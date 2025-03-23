from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize the search client
search_endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
search_key = os.getenv("AZURE_SEARCH_KEY")
search_client = SearchClient(
    endpoint=search_endpoint,
    index_name="news-index",
    credential=AzureKeyCredential(search_key)
)

# Sample trusted news articles
articles = [
    {
        "id": "1",
        "title": "Ukraine war: Russia claims advances in eastern Ukraine",
        "content": "Russian forces claim to have made advances in eastern Ukraine as intense fighting continues in the region. Ukrainian officials acknowledge challenging situations but maintain their defensive positions.",
        "source": "BBC News",
        "published_date": datetime.utcnow(),
        "url": "https://www.bbc.com/news/world-europe-12345"
    },
    {
        "id": "2",
        "title": "EU announces new aid package for Ukraine",
        "content": "The European Union has announced a new comprehensive aid package for Ukraine, including military and humanitarian assistance. The package aims to support Ukraine's defense capabilities and civilian infrastructure.",
        "source": "Reuters",
        "published_date": datetime.utcnow(),
        "url": "https://www.reuters.com/world/europe/12345"
    },
    {
        "id": "3",
        "title": "UN calls for immediate ceasefire in Ukraine",
        "content": "The United Nations Secretary-General has called for an immediate ceasefire in Ukraine, emphasizing the humanitarian crisis and the need for diplomatic solutions to the conflict.",
        "source": "Associated Press",
        "published_date": datetime.utcnow(),
        "url": "https://apnews.com/article/12345"
    }
]

# Upload the articles to the search index
result = search_client.upload_documents(documents=articles)
print(f"Added {len(result)} articles to the search index")
print("Sample articles uploaded successfully") 