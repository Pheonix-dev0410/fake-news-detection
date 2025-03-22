# Fake News Detection App

A full-stack application that detects fake news using Azure AI services. The app analyzes news articles and URLs to determine their credibility using Azure AI Language and Azure Cognitive Search.

## Features

- Modern, responsive UI inspired by Regis Grumberg's portfolio design
- News article analysis through URL or direct text input
- Sentiment analysis and credibility scoring
- Integration with trusted news sources
- Real-time classification results

## Tech Stack

### Frontend
- Next.js 14
- Tailwind CSS
- TypeScript
- Azure Static Web Apps

### Backend
- FastAPI
- Python 3.11+
- Azure App Service

### Azure Services
- Azure AI Language (Text Analytics)
- Azure Cognitive Search
- Azure Cosmos DB
- Azure Static Web Apps
- Azure App Service

## Project Structure

```
.
├── frontend/           # Next.js frontend application
├── backend/           # FastAPI backend application
└── README.md          # Project documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Azure CLI
- Azure subscription with free tier services

### Local Development

1. Clone the repository
2. Set up environment variables:
   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:8000
   
   # Backend (.env)
   AZURE_LANGUAGE_KEY=your_key
   AZURE_LANGUAGE_ENDPOINT=your_endpoint
   AZURE_SEARCH_KEY=your_key
   AZURE_SEARCH_ENDPOINT=your_endpoint
   COSMOS_CONNECTION_STRING=your_connection_string
   ```

3. Start the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

4. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment

The application is configured for deployment on Azure:

- Frontend: Azure Static Web Apps
- Backend: Azure App Service
- Database: Azure Cosmos DB
- AI Services: Azure AI Language and Cognitive Search

## License

MIT 