
import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import numpy as np
import json
import base64
from datetime import datetime, timedelta
import uuid

# Import our custom modules
from audio_processor import process_audio, transcribe_audio
from sentiment_analyzer import analyze_sentiment, get_mood_label_and_score
from recommendation_engine import get_personalized_recommendations
from pdf_generator import generate_wellness_report

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Mental Health Mirror AI Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for request/response
class SentimentAnalysisRequest(BaseModel):
    userId: str
    audioData: Optional[str] = None  # Base64 encoded audio
    transcription: Optional[str] = None  # Direct text input

class SentimentAnalysisResponse(BaseModel):
    transcription: str
    sentiment: Dict[str, Any]
    moodLabel: str
    moodScore: float

class RecommendationRequest(BaseModel):
    userId: str
    moodLabel: str
    previousRecommendations: Optional[List[str]] = None

class ReportGenerationRequest(BaseModel):
    userId: str
    weekNumber: int
    year: int
    startDate: str
    endDate: str
    moodEntries: List[Dict[str, Any]]
    completedRecommendations: List[Dict[str, Any]]
    streak: Dict[str, Any]

@app.get("/")
def read_root():
    return {"status": "online", "service": "Mental Health Mirror AI Service"}

@app.post("/analyze-sentiment", response_model=SentimentAnalysisResponse)
async def analyze_mood(request: SentimentAnalysisRequest = None, 
                       audioFile: UploadFile = File(None)):
    try:
        # Handle direct file upload
        if audioFile:
            audio_data = await audioFile.read()
            # Process audio file
            audio_features = process_audio(audio_data)
            transcription = transcribe_audio(audio_data)
        # Handle base64 encoded audio
        elif request and request.audioData:
            audio_bytes = base64.b64decode(request.audioData.split(",")[1] 
                                           if "," in request.audioData 
                                           else request.audioData)
            audio_features = process_audio(audio_bytes)
            transcription = transcribe_audio(audio_bytes)
        # Handle direct text input
        elif request and request.transcription:
            transcription = request.transcription
            audio_features = None
        else:
            raise HTTPException(status_code=400, detail="No audio or text provided")

        # Analyze sentiment from transcription and audio features
        sentiment_analysis = analyze_sentiment(transcription, audio_features)
        mood_label, mood_score = get_mood_label_and_score(sentiment_analysis)

        return {
            "transcription": transcription,
            "sentiment": sentiment_analysis,
            "moodLabel": mood_label,
            "moodScore": mood_score
        }
    except Exception as e:
        print(f"Error in sentiment analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sentiment analysis error: {str(e)}")

@app.post("/get-recommendations")
async def get_recommendations(request: RecommendationRequest):
    try:
        recommendations = get_personalized_recommendations(
            request.userId,
            request.moodLabel,
            request.previousRecommendations or []
        )
        return {"recommendations": recommendations}
    except Exception as e:
        print(f"Error in recommendation engine: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.post("/generate-report")
async def generate_report(
    background_tasks: BackgroundTasks,
    request: ReportGenerationRequest
):
    try:
        report_id = f"{request.userId}_{request.year}_{request.weekNumber}"
        report_filename = f"report_{report_id}.pdf"
        
        # Generate report asynchronously
        background_tasks.add_task(
            generate_wellness_report,
            report_filename,
            request.userId,
            request.moodEntries,
            request.completedRecommendations,
            request.streak,
            request.startDate,
            request.endDate
        )
        
        return {
            "success": True,
            "message": "Report generation started",
            "reportId": report_id,
            "reportFilename": report_filename
        }
    except Exception as e:
        print(f"Error in report generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
