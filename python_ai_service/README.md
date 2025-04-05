
# Mental Health Mirror - AI Service

This is the Python AI backend service for the Mental Health Mirror application. It provides voice analysis, sentiment detection, personalized recommendations, and PDF report generation.

## Features

- Voice recording analysis
- Sentiment and emotion detection
- Culturally contextualized mood analysis for Indian users
- Personalized recommendations based on mood
- Integration with Spotify and YouTube APIs
- PDF wellness report generation

## Prerequisites

- Python 3.8+
- Docker and Docker Compose (optional, for containerized deployment)
- API keys for:
  - OpenAI
  - Spotify
  - YouTube

## Setup

1. Clone the repository
2. Create an `.env` file based on `.env.example` and add your API keys
3. Install dependencies:

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_md
```

4. Start the service:

```bash
uvicorn main:app --reload
```

## Using Docker

To run the service with Docker:

```bash
docker-compose up -d
```

## API Endpoints

- `POST /analyze-sentiment`: Analyze sentiment from voice or text
- `POST /get-recommendations`: Get personalized recommendations 
- `POST /generate-report`: Generate a PDF wellness report

## Integration with Node.js Backend

See the Node.js backend documentation for details on how to connect this AI service with the main Mental Health Mirror application.
