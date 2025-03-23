from azure.cosmos import CosmosClient, PartitionKey
import os
from dotenv import load_dotenv

def init_cosmos_db():
    # Load environment variables
    load_dotenv()
    
    # Get Cosmos DB connection string
    connection_string = os.getenv('COSMOS_CONNECTION_STRING')
    
    if not connection_string:
        raise ValueError("COSMOS_CONNECTION_STRING environment variable is not set")
    
    # Initialize Cosmos client
    client = CosmosClient.from_connection_string(connection_string)
    
    # Create database if it doesn't exist
    try:
        database = client.create_database_if_not_exists('fake_news_db')
        print("Database 'fake_news_db' created or already exists")
        
        # Create container if it doesn't exist (without throughput for serverless)
        container = database.create_container_if_not_exists(
            id='analyzed_articles',
            partition_key=PartitionKey(path="/id")
        )
        print("Container 'analyzed_articles' created or already exists")
        
    except Exception as e:
        print(f"Error creating Cosmos DB resources: {str(e)}")
        raise

if __name__ == "__main__":
    init_cosmos_db() 