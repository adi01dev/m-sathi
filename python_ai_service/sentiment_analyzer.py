
import os
import json
import openai
import spacy
import numpy as np
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_md")
except:
    # If not available, download it
    import subprocess
    subprocess.call(["python", "-m", "spacy", "download", "en_core_web_md"])
    nlp = spacy.load("en_core_web_md")

# Load pre-trained sentiment analysis model
MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
sentiment_pipeline = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)

# Load emotion detection model
emotion_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")

# Define mood labels and their associated emotions
MOOD_MAPPINGS = {
    "joyful": {
        "emotions": ["joy", "love", "optimism"],
        "min_score": 0.85,
        "score_range": [8, 10]
    },
    "happy": {
        "emotions": ["joy", "optimism"],
        "min_score": 0.6,
        "score_range": [7, 8]
    },
    "calm": {
        "emotions": ["neutral", "joy"],
        "min_score": 0.3,
        "score_range": [6, 7]
    },
    "relaxed": {
        "emotions": ["neutral", "joy"],
        "min_score": 0.2,
        "score_range": [5, 6]
    },
    "neutral": {
        "emotions": ["neutral"],
        "min_score": 0,
        "score_range": [5, 5]
    },
    "anxious": {
        "emotions": ["fear", "worry"],
        "min_score": -0.2,
        "score_range": [4, 5]
    },
    "stressed": {
        "emotions": ["fear", "anger", "worry"],
        "min_score": -0.4,
        "score_range": [3, 4]
    },
    "sad": {
        "emotions": ["sadness"],
        "min_score": -0.6,
        "score_range": [2, 3]
    },
    "depressed": {
        "emotions": ["sadness", "disgust"],
        "min_score": -0.85,
        "score_range": [1, 2]
    }
}

# Indian cultural context keywords and phrases
INDIAN_CULTURAL_CONTEXT = {
    "family_terms": [
        "family", "parents", "mother", "father", "sister", "brother", "grandparents",
        "relatives", "uncle", "aunt", "cousins", "joint family", "elders", "in-laws"
    ],
    "social_pressure_terms": [
        "expectations", "society", "marriage", "career", "studies", "exams", 
        "competitive", "comparison", "neighbors", "relatives", "community",
        "grades", "rank", "JEE", "NEET", "board exams", "family name", 
        "what will people say", "log kya kahenge", "respect", "honor"
    ],
    "spiritual_terms": [
        "meditation", "yoga", "prayer", "temple", "puja", "spiritual", "faith",
        "god", "goddess", "festival", "ritual", "karma", "dharma", "mantra"
    ],
    "work_culture_terms": [
        "office", "deadline", "manager", "boss", "overtime", "pressure", 
        "promotion", "colleagues", "workplace", "IT", "software", "project",
        "client", "delivery", "target", "meeting"
    ]
}

def analyze_sentiment(transcription, audio_features=None):
    """
    Analyze sentiment from transcription and audio features using multiple models
    
    Parameters:
    transcription (str): Transcribed text
    audio_features (dict): Audio features extracted from audio
    
    Returns:
    dict: Sentiment analysis including score, label, emotions
    """
    try:
        # 1. Use pre-trained model for basic sentiment
        sentiment_result = sentiment_pipeline(transcription)[0]
        base_score = sentiment_result["score"]
        
        # Convert to a scale from -1 to 1 where NEGATIVE = -1, POSITIVE = 1
        if sentiment_result["label"] == "POSITIVE":
            base_sentiment_score = base_score
        else:
            base_sentiment_score = -base_score
        
        # 2. Use emotion classifier
        emotion_result = emotion_classifier(transcription)[0]
        emotion_name = emotion_result["label"]
        emotion_confidence = emotion_result["score"]
        
        # 3. Process with spaCy for additional features
        doc = nlp(transcription)
        
        # Extract keywords and entities
        keywords = []
        for token in doc:
            if token.is_stop is False and token.is_punct is False:
                keywords.append(token.text)
        
        entities = [(ent.text, ent.label_) for ent in doc.ents]
        
        # 4. Check for Indian cultural context indicators
        cultural_context_score = 0
        cultural_factors = {}
        
        for context_type, terms in INDIAN_CULTURAL_CONTEXT.items():
            detected_terms = []
            for term in terms:
                if term.lower() in transcription.lower():
                    detected_terms.append(term)
                    
            if detected_terms:
                cultural_factors[context_type] = detected_terms
                
                # Adjust score based on cultural context
                if context_type == "spiritual_terms":
                    cultural_context_score += 0.1  # Spiritual practices often have positive effect
                elif context_type == "social_pressure_terms":
                    cultural_context_score -= 0.1  # Social pressure often has negative effect
        
        # 5. Use OpenAI for deep contextual analysis
        try:
            openai_response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert in mental health analysis for Indian individuals. 
                        Analyze the sentiment and emotional state from this text, considering Indian cultural context.
                        Consider family dynamics, social pressures, spiritual practices, and work culture in India.
                        
                        Return ONLY a JSON object with the following structure:
                        {
                          "context_analysis": "Brief analysis of the person's emotional state",
                          "sentiment_score_adjustment": Value between -0.3 and 0.3 to adjust the sentiment score,
                          "detected_emotions": {
                            "emotion1": probability from 0 to 1,
                            "emotion2": probability from 0 to 1,
                            ...
                          },
                          "cultural_factors": ["List of identified cultural factors affecting mood"],
                          "severity_level": "normal" or "concerning" or "urgent"
                        }"""
                    },
                    {
                        "role": "user",
                        "content": transcription
                    }
                ],
                response_format={"type": "json_object"}
            )
            
            openai_analysis = json.loads(openai_response.choices[0].message.content)
            openai_adjustment = openai_analysis.get("sentiment_score_adjustment", 0)
            openai_emotions = openai_analysis.get("detected_emotions", {})
            severity = openai_analysis.get("severity_level", "normal")
            
        except Exception as e:
            print(f"OpenAI analysis error: {str(e)}")
            openai_adjustment = 0
            openai_emotions = {}
            severity = "normal"
        
        # 6. Incorporate audio features if available
        audio_adjustment = 0
        if audio_features:
            # Use rms (energy) and tempo for emotional intensity
            rms_mean = np.mean(audio_features.get("rms", [0]))
            tempo = audio_features.get("tempo", 0)
            
            # Higher energy and tempo often correlate with arousal level
            intensity = (rms_mean * 5) + (tempo / 200)
            
            # Adjust based on audio features
            if base_sentiment_score > 0:
                audio_adjustment = min(intensity * 0.2, 0.2)  # Amplify positive emotions
            elif base_sentiment_score < 0:
                audio_adjustment = max(-intensity * 0.2, -0.2)  # Amplify negative emotions
        
        # 7. Combine all scores with weights
        final_score = (
            base_sentiment_score * 0.5 +    # Base sentiment model
            openai_adjustment * 0.3 +       # OpenAI contextual adjustment
            cultural_context_score * 0.1 +  # Cultural context adjustment
            audio_adjustment * 0.1          # Audio-based adjustment
        )
        
        # Ensure score is between -1 and 1
        final_score = max(min(final_score, 1.0), -1.0)
        
        # Combine emotions from multiple sources
        emotions = {}
        
        # Add emotions from emotion classifier
        emotions[emotion_name] = emotion_confidence
        
        # Add emotions from OpenAI analysis
        for emotion, score in openai_emotions.items():
            if emotion in emotions:
                emotions[emotion] = (emotions[emotion] + score) / 2  # Average if emotion exists
            else:
                emotions[emotion] = score
        
        # Determine sentiment label
        if final_score >= 0.6:
            sentiment_label = "positive"
        elif final_score <= -0.3:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"
            
        # Create final result
        result = {
            "score": final_score,
            "label": sentiment_label,
            "emotions": emotions,
            "keywords": keywords[:10],  # Top 10 keywords
            "cultural_context": cultural_factors,
            "severity": severity
        }
        
        return result
        
    except Exception as e:
        print(f"Error in sentiment analysis: {str(e)}")
        # Return default analysis if error occurs
        return {
            "score": 0,
            "label": "neutral",
            "emotions": {"neutral": 1.0},
            "keywords": [],
            "cultural_context": {},
            "severity": "normal"
        }

def get_mood_label_and_score(sentiment_analysis):
    """
    Convert sentiment analysis to mood label and score for the app
    
    Parameters:
    sentiment_analysis (dict): Result from analyze_sentiment function
    
    Returns:
    (str, int): Mood label and score (1-10)
    """
    sentiment_score = sentiment_analysis.get("score", 0)
    emotions = sentiment_analysis.get("emotions", {})
    
    # Find the best matching mood based on sentiment score and emotions
    best_mood = "neutral"  # Default
    best_match_score = -float('inf')
    
    for mood, mood_data in MOOD_MAPPINGS.items():
        # Score based on sentiment value proximity to mood's expected range
        range_mid = (mood_data["min_score"] + (mood_data["min_score"] + 0.2)) / 2
        proximity_score = 1 - abs(sentiment_score - range_mid)
        
        # Score based on matching emotions
        emotion_match_score = 0
        for emotion in mood_data["emotions"]:
            if emotion in emotions:
                emotion_match_score += emotions[emotion]
                
        # Combine scores (70% emotion match, 30% sentiment value)
        match_score = (emotion_match_score * 0.7) + (proximity_score * 0.3)
        
        if match_score > best_match_score:
            best_match_score = match_score
            best_mood = mood
    
    # Convert sentiment score (-1 to 1) to mood score (1 to 10)
    mood_score = int(((sentiment_score + 1) / 2) * 9) + 1
    
    # Adjust based on identified mood range
    mood_range = MOOD_MAPPINGS[best_mood]["score_range"]
    # Ensure the score is within the expected range for this mood
    mood_score = max(min(mood_score, mood_range[1]), mood_range[0])
    
    return best_mood, mood_score
