from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
import os
from dotenv import load_dotenv
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.cosmos import CosmosClient
from newspaper import Article
import json
from datetime import datetime
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Set to DEBUG for more detailed logs
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Validate required environment variables
required_env_vars = [
    "AZURE_LANGUAGE_ENDPOINT",
    "AZURE_LANGUAGE_KEY",
    "AZURE_SEARCH_ENDPOINT",
    "AZURE_SEARCH_KEY",
    "COSMOS_CONNECTION_STRING"
]

missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

app = FastAPI(title="Fake News Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://salmon-pond-0fbd3ac00.azurestaticapps.net"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    # Initialize Azure Language client
    text_analytics_client = TextAnalyticsClient(
        endpoint=os.getenv("AZURE_LANGUAGE_ENDPOINT"),
        credential=AzureKeyCredential(os.getenv("AZURE_LANGUAGE_KEY"))
    )

    # Initialize Azure Search client (but don't connect yet)
    search_endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
    search_key = os.getenv("AZURE_SEARCH_KEY")

    # Initialize Cosmos DB client
    cosmos_client = CosmosClient.from_connection_string(os.getenv("COSMOS_CONNECTION_STRING"))
    database = cosmos_client.get_database_client("fake_news_db")
    container = database.get_container_client("analyzed_articles")
except Exception as e:
    logger.error(f"Failed to initialize Azure services: {str(e)}")
    raise

class NewsInput(BaseModel):
    url: Optional[HttpUrl] = None
    text: Optional[str] = None

class AnalysisResult(BaseModel):
    id: str
    text: str
    sentiment: str
    confidence: float
    is_fake: bool
    credibility_score: float
    source_url: Optional[str]
    analyzed_at: str

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

@app.get("/")
async def root():
    return {"status": "ok", "message": "Fake News Detection API is running"}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_news(input_data: NewsInput):
    try:
        logger.debug(f"Received request with URL: {input_data.url}")
        
        # Extract text from URL or use provided text
        if input_data.url:
            try:
                logger.debug(f"Attempting to download article from URL: {input_data.url}")
                article = Article(str(input_data.url))
                article.download()
                article.parse()
                text = article.text
                if not text:
                    raise ValueError("No text content found in the article")
                source_url = str(input_data.url)
                logger.debug(f"Successfully extracted text from URL. Text length: {len(text)}")
            except Exception as e:
                logger.error(f"Error extracting text from URL: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to extract text from URL: {str(e)}"
                )
        elif input_data.text:
            text = input_data.text
            source_url = None
            logger.debug("Using provided text input")
        else:
            raise HTTPException(status_code=400, detail="Either URL or text must be provided")

        # Perform sentiment analysis
        try:
            logger.debug("Starting sentiment analysis")
            sentiment_result = text_analytics_client.analyze_sentiment([text])[0]
            sentiment = sentiment_result.sentiment
            
            # Get the highest confidence score regardless of sentiment
            confidence_scores = sentiment_result.confidence_scores
            confidence = max([
                confidence_scores.positive,
                confidence_scores.negative,
                confidence_scores.neutral
            ])
            
            logger.debug(f"Sentiment analysis complete. Result: {sentiment}, Confidence: {confidence}")
            logger.debug(f"Detailed confidence scores: positive={confidence_scores.positive}, negative={confidence_scores.negative}, neutral={confidence_scores.neutral}")
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to analyze sentiment: {str(e)}"
            )

        # Try to search for similar articles
        credibility_score = 0.5  # Default score
        try:
            logger.debug("Attempting to search for similar articles")
            search_client = SearchClient(
                endpoint=search_endpoint,
                index_name="news-index",
                credential=AzureKeyCredential(search_key)
            )
            search_results = list(search_client.search(
                search_text=text,
                select=["title", "content", "source"],
                top=5
            ))
            credibility_score = min(1.0, len(search_results) * 0.2)
            logger.info(f"Found {len(search_results)} similar articles")
        except Exception as search_error:
            logger.warning(f"Search index not available: {str(search_error)}", exc_info=True)
            # Continue without search results

        # Determine if news is fake based on multiple signals
        # 1. Low credibility score strongly indicates fake news
        # 2. Extremely negative sentiment with high confidence is a warning sign
        # 3. Mixed sentiment with high negative component is suspicious
        is_fake = (
            (credibility_score < 0.4) or  # Low similarity to trusted sources
            (sentiment == "negative" and confidence > 0.9 and credibility_score < 0.6) or  # Very negative content
            (sentiment == "mixed" and confidence_scores.negative > 0.7 and credibility_score < 0.5)  # Suspicious mixed content
        )
        logger.debug(f"Fake news determination: {is_fake} (credibility: {credibility_score}, sentiment: {sentiment}, confidence: {confidence})")

        # Create result
        try:
            result = AnalysisResult(
                id=str(uuid.uuid4()),
                text=text[:1000],  # Limit text length for storage
                sentiment=sentiment,
                confidence=confidence,
                is_fake=is_fake,
                credibility_score=credibility_score,
                source_url=source_url,
                analyzed_at=datetime.utcnow().isoformat()
            )
            logger.debug("Created analysis result object")
        except Exception as e:
            logger.error(f"Error creating result object: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Error creating result: {str(e)}"
            )

        # Store in Cosmos DB
        try:
            logger.debug("Attempting to store result in Cosmos DB")
            result_dict = result.dict()
            container.create_item(body=result_dict)
            logger.debug("Successfully stored result in Cosmos DB")
        except Exception as e:
            logger.error(f"Failed to store result in Cosmos DB: {str(e)}", exc_info=True)
            # Don't fail the request if storage fails
            pass

        return result

    except HTTPException as he:
        logger.error(f"HTTP Exception: {str(he)}", exc_info=True)
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in analyze_news: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "language": "available",
            "search": "index not found - needs setup",
            "cosmos": "available"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 