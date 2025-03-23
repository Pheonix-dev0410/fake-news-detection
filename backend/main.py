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

# Load environment variables
load_dotenv()

app = FastAPI(title="Fake News Detection API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Azure clients
text_analytics_client = TextAnalyticsClient(
    endpoint=os.getenv("AZURE_LANGUAGE_ENDPOINT"),
    credential=AzureKeyCredential(os.getenv("AZURE_LANGUAGE_KEY"))
)

search_client = SearchClient(
    endpoint=os.getenv("AZURE_SEARCH_ENDPOINT"),
    index_name="news-index",
    credential=AzureKeyCredential(os.getenv("AZURE_SEARCH_KEY"))
)

cosmos_client = CosmosClient.from_connection_string(os.getenv("COSMOS_CONNECTION_STRING"))
database = cosmos_client.get_database_client("fake-news-db")
container = database.get_container_client("articles")

class NewsInput(BaseModel):
    url: Optional[HttpUrl] = None
    text: Optional[str] = None

class AnalysisResult(BaseModel):
    text: str
    sentiment: str
    confidence: float
    is_fake: bool
    credibility_score: float
    source_url: Optional[str]
    analyzed_at: datetime

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

        # Search for similar articles in trusted sources
        search_results = search_client.search(
            search_text=text,
            select=["title", "content", "source"],
            top=5
        )

        # Calculate credibility score based on search results
        credibility_score = min(1.0, len(list(search_results)) * 0.2)

        # Determine if news is fake based on credibility score and sentiment
        is_fake = credibility_score < 0.4 or (sentiment == "negative" and confidence > 0.8)

        # Create result
        result = AnalysisResult(
            text=text,
            sentiment=sentiment,
            confidence=confidence,
            is_fake=is_fake,
            credibility_score=credibility_score,
            source_url=source_url,
            analyzed_at=datetime.utcnow()
        )

        # Store result in Cosmos DB
        container.create_item(body=result.dict())

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_analysis_history():
    try:
        # Query recent analyses from Cosmos DB
        query = "SELECT * FROM c ORDER BY c.analyzed_at DESC LIMIT 10"
        results = list(container.query_items(query=query, enable_cross_partition_query=True))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 