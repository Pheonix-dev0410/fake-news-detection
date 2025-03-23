from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SimpleField,
    SearchableField,
    SearchFieldDataType,
)
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the search index client
search_endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
search_key = os.getenv("AZURE_SEARCH_KEY")
index_client = SearchIndexClient(
    endpoint=search_endpoint,
    credential=AzureKeyCredential(search_key)
)

# Define the index schema
index_name = "news-index"
fields = [
    SimpleField(name="id", type=SearchFieldDataType.String, key=True),
    SearchableField(name="title", type=SearchFieldDataType.String),
    SearchableField(name="content", type=SearchFieldDataType.String),
    SimpleField(name="source", type=SearchFieldDataType.String),
    SimpleField(name="published_date", type=SearchFieldDataType.DateTimeOffset),
    SimpleField(name="url", type=SearchFieldDataType.String),
]

# Create the index
index = SearchIndex(name=index_name, fields=fields)
result = index_client.create_or_update_index(index)
print(f"Index {result.name} created successfully") 