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
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="Fake News Detection API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        # Extract text from URL or use provided text
        if input_data.url:
            article = Article(str(input_data.url))
            article.download()
            article.parse()
            text = article.text
            source_url = str(input_data.url)
        elif input_data.text:
            text = input_data.text
            source_url = None
        else:
            raise HTTPException(status_code=400, detail="Either URL or text must be provided")

        # Perform sentiment analysis
        sentiment_result = text_analytics_client.analyze_sentiment([text])[0]
        sentiment = sentiment_result.sentiment
        confidence = sentiment_result.confidence_scores[sentiment]

        # Try to search for similar articles, but don't fail if search index doesn't exist
        credibility_score = 0.5  # Default score
        try:
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
            logger.warning(f"Search index not available: {str(search_error)}")
            # Continue without search results

        # Determine if news is fake based on available signals
        is_fake = (sentiment == "negative" and confidence > 0.8)

        # Create result with datetime as ISO format string and unique id
        result = AnalysisResult(
            id=str(uuid.uuid4()),
            text=text,
            sentiment=sentiment,
            confidence=confidence,
            is_fake=is_fake,
            credibility_score=credibility_score,
            source_url=source_url,
            analyzed_at=datetime.utcnow().isoformat()
        )

        # Convert result to dict and store in Cosmos DB
        result_dict = result.dict()
        container.create_item(body=result_dict)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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