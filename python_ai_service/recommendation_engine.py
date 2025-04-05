
import os
import json
import random
import numpy as np
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Recommendations database - in production this would be a real database
# Here we're using a static dictionary for simplicity
RECOMMENDATIONS_DB = {
    "joyful": [
        {
            "id": "j1",
            "title": "Fast-paced Bollywood Dance Workout",
            "description": "Channel your joyful energy with this upbeat Bollywood dance workout.",
            "type": "activity",
            "tags": ["dance", "exercise", "bollywood", "energetic"],
            "duration": "15 min"
        },
        {
            "id": "j2",
            "title": "Gratitude Journaling",
            "description": "Write down 5 things that made you feel grateful today.",
            "type": "journaling",
            "tags": ["gratitude", "reflection", "positive"],
            "duration": "10 min"
        },
        {
            "id": "j3",
            "title": "Joy Meditation",
            "description": "A guided meditation to amplify your feelings of joy and happiness.",
            "type": "meditation",
            "tags": ["mindfulness", "guided", "joy"],
            "duration": "8 min"
        }
    ],
    "happy": [
        {
            "id": "h1",
            "title": "Positive Affirmations in Hindi & English",
            "description": "Listen and repeat these uplifting affirmations to maintain your positive state.",
            "type": "affirmation",
            "tags": ["positive", "bilingual", "mantras"],
            "duration": "5 min"
        },
        {
            "id": "h2",
            "title": "Nature Walk Mindfulness",
            "description": "Take a mindful walk, focusing on the natural beauty around you.",
            "type": "activity",
            "tags": ["outdoors", "mindfulness", "nature"],
            "duration": "20 min"
        }
    ],
    "calm": [
        {
            "id": "c1",
            "title": "Indian Classical Music for Relaxation",
            "description": "Calming ragas specially selected to maintain your peaceful state.",
            "type": "music",
            "tags": ["classical", "indian", "instrumental"],
            "duration": "15 min"
        },
        {
            "id": "c2",
            "title": "Gentle Yoga Flow",
            "description": "A series of gentle yoga poses to maintain calm and balance.",
            "type": "activity",
            "tags": ["yoga", "gentle", "stretching"],
            "duration": "12 min"
        }
    ],
    "relaxed": [
        {
            "id": "r1",
            "title": "Progressive Muscle Relaxation",
            "description": "A guided exercise to release tension from your body.",
            "type": "breathing",
            "tags": ["relaxation", "body-scan", "tension-release"],
            "duration": "10 min"
        },
        {
            "id": "r2",
            "title": "Evening Tea Ritual",
            "description": "Prepare a cup of calming tea (suggestions: tulsi, chamomile) and sip mindfully.",
            "type": "activity",
            "tags": ["mindfulness", "ritual", "ayurveda"],
            "duration": "15 min"
        }
    ],
    "neutral": [
        {
            "id": "n1",
            "title": "Balanced Breathing Practice",
            "description": "A simple box breathing technique to center yourself.",
            "type": "breathing",
            "tags": ["balance", "focus", "centering"],
            "duration": "5 min"
        },
        {
            "id": "n2",
            "title": "Mindful Observation",
            "description": "Choose an object and observe it with complete attention for 5 minutes.",
            "type": "meditation",
            "tags": ["focus", "mindfulness", "attention"],
            "duration": "5 min"
        }
    ],
    "anxious": [
        {
            "id": "a1",
            "title": "4-7-8 Breathing Technique",
            "description": "A breathing pattern that helps reduce anxiety and induces relaxation.",
            "type": "breathing",
            "tags": ["anxiety", "calming", "immediate-relief"],
            "duration": "5 min"
        },
        {
            "id": "a2",
            "title": "Guided Anxiety Relief Meditation",
            "description": "A meditation specifically designed to calm anxiety.",
            "type": "meditation",
            "tags": ["anxiety", "guided", "relief"],
            "duration": "10 min"
        },
        {
            "id": "a3",
            "title": "Worry List Journaling",
            "description": "Write down your worries, then note what's in your control and what's not.",
            "type": "journaling",
            "tags": ["anxiety", "reflection", "problem-solving"],
            "duration": "15 min"
        }
    ],
    "stressed": [
        {
            "id": "s1",
            "title": "Guided Body Scan",
            "description": "A progressive relaxation technique focusing on each part of your body.",
            "type": "meditation",
            "tags": ["stress-relief", "body", "relaxation"],
            "duration": "10 min"
        },
        {
            "id": "s2",
            "title": "Stress Relief Pressure Points",
            "description": "Apply gentle pressure to specific points on your body to relieve stress.",
            "type": "activity",
            "tags": ["acupressure", "immediate-relief", "traditional"],
            "duration": "5 min"
        },
        {
            "id": "s3",
            "title": "Calming Pranayama",
            "description": "Traditional Indian breathing exercises to reduce stress.",
            "type": "breathing",
            "tags": ["yoga", "pranayama", "traditional"],
            "duration": "7 min"
        }
    ],
    "sad": [
        {
            "id": "sd1",
            "title": "Self-Compassion Practice",
            "description": "A guided meditation focusing on being kind to yourself during difficult times.",
            "type": "meditation",
            "tags": ["self-care", "compassion", "kindness"],
            "duration": "10 min"
        },
        {
            "id": "sd2",
            "title": "Mood-Lifting Light Exercise",
            "description": "Simple physical movements to help lift your mood through endorphin release.",
            "type": "activity",
            "tags": ["movement", "gentle", "mood-boost"],
            "duration": "10 min"
        },
        {
            "id": "sd3",
            "title": "Emotional Release Journaling",
            "description": "Write freely about your feelings without judgment.",
            "type": "journaling",
            "tags": ["emotional", "expression", "processing"],
            "duration": "15 min"
        }
    ],
    "depressed": [
        {
            "id": "d1",
            "title": "Tiny Task Accomplishment",
            "description": "Complete one very small task and acknowledge your achievement.",
            "type": "activity",
            "tags": ["small-wins", "achievement", "motivation"],
            "duration": "5 min"
        },
        {
            "id": "d2",
            "title": "Grounding Exercise",
            "description": "A simple 5-4-3-2-1 sensory grounding technique.",
            "type": "breathing",
            "tags": ["grounding", "presence", "immediate-help"],
            "duration": "5 min"
        },
        {
            "id": "d3",
            "title": "Supportive Self-Talk",
            "description": "Practice replacing negative thoughts with supportive statements.",
            "type": "affirmation",
            "tags": ["cognitive", "positive", "reframing"],
            "duration": "8 min"
        }
    ]
}

# Token cache for Spotify
spotify_token = None
spotify_token_expiry = None

def get_spotify_token():
    """Get a token for Spotify API"""
    global spotify_token, spotify_token_expiry
    
    current_time = datetime.now()
    
    # Check if token exists and is still valid
    if spotify_token and spotify_token_expiry and spotify_token_expiry > current_time:
        return spotify_token
    
    try:
        # Request new token
        auth_url = "https://accounts.spotify.com/api/token"
        
        auth_response = requests.post(
            auth_url,
            data={
                "grant_type": "client_credentials",
                "client_id": SPOTIFY_CLIENT_ID,
                "client_secret": SPOTIFY_CLIENT_SECRET,
            }
        )
        
        auth_data = auth_response.json()
        spotify_token = auth_data["access_token"]
        
        # Set expiration time (usually 1 hour)
        from datetime import timedelta
        spotify_token_expiry = current_time + timedelta(seconds=auth_data["expires_in"] - 60)
        
        return spotify_token
    except Exception as e:
        print(f"Error getting Spotify token: {str(e)}")
        return None

# Map moods to music parameters
MOOD_MUSIC_PARAMS = {
    "joyful": {"genres": "bollywood,pop,edm", "min_energy": 0.8, "min_valence": 0.8},
    "happy": {"genres": "bollywood,pop,indie", "min_energy": 0.6, "min_valence": 0.6},
    "calm": {"genres": "indian classical,ambient,chill", "max_energy": 0.4, "min_valence": 0.5},
    "relaxed": {"genres": "acoustic,chill,instrumental", "max_energy": 0.5, "min_valence": 0.4},
    "neutral": {"genres": "indie,folk,world", "target_energy": 0.5, "target_valence": 0.5},
    "anxious": {"genres": "classical,ambient,indian classical", "max_energy": 0.4, "max_tempo": 80},
    "stressed": {"genres": "meditation,ambient,indian classical", "max_energy": 0.3, "max_tempo": 70},
    "sad": {"genres": "acoustic,indie,bollywood", "max_energy": 0.5, "max_valence": 0.4},
    "depressed": {"genres": "chill,ambient,acoustic", "max_energy": 0.4, "max_valence": 0.3}
}

# Map moods to YouTube search queries
MOOD_VIDEO_QUERIES = {
    "joyful": ["uplifting Indian music", "happy bollywood dance", "joyful yoga"],
    "happy": ["positive affirmations hindi", "happy bollywood songs", "cheerful bhajans"],
    "calm": ["peaceful ragas", "calming Indian flute music", "nature sounds India"],
    "relaxed": ["guided relaxation hindi", "gentle yoga", "relaxing Indian classical music"],
    "neutral": ["mindfulness meditation hindi", "ambient music", "breathing exercises yoga"],
    "anxious": ["anxiety relief meditation hindi", "pranayama breathing techniques", "calming mantra chanting"],
    "stressed": ["stress relief yoga nidra", "guided imagery hindi", "indian classical for stress"],
    "sad": ["uplifting bhajans", "motivational speeches hindi", "self-compassion meditation"],
    "depressed": ["depression relief meditation hindi", "positive affirmations indian", "light therapy music"]
}

def get_spotify_recommendations(mood_label):
    """Get music recommendations from Spotify based on mood"""
    token = get_spotify_token()
    if not token:
        return []
    
    try:
        # Get parameters for this mood
        params = MOOD_MUSIC_PARAMS.get(mood_label, MOOD_MUSIC_PARAMS["neutral"])
        
        # Prepare query parameters
        query_params = {
            "limit": 3,
            "market": "IN"  # Target Indian market
        }
        
        # Add mood-specific parameters
        if "genres" in params:
            query_params["seed_genres"] = params["genres"]
        if "min_energy" in params:
            query_params["min_energy"] = params["min_energy"]
        if "max_energy" in params:
            query_params["max_energy"] = params["max_energy"]
        if "min_valence" in params:
            query_params["min_valence"] = params["min_valence"]
        if "max_valence" in params:
            query_params["max_valence"] = params["max_valence"]
        if "target_energy" in params:
            query_params["target_energy"] = params["target_energy"]
        if "target_valence" in params:
            query_params["target_valence"] = params["target_valence"]
        if "max_tempo" in params:
            query_params["max_tempo"] = params["max_tempo"]
        
        # Make API request
        recommendation_url = "https://api.spotify.com/v1/recommendations"
        response = requests.get(
            recommendation_url,
            headers={"Authorization": f"Bearer {token}"},
            params=query_params
        )
        
        if response.status_code != 200:
            print(f"Spotify API error: {response.status_code}")
            return []
        
        data = response.json()
        
        # Format recommendations
        recommendations = []
        for track in data.get("tracks", []):
            artist_names = ", ".join([artist["name"] for artist in track["artists"]])
            track_url = track["external_urls"]["spotify"]
            image_url = track["album"]["images"][0]["url"] if track["album"]["images"] else ""
            
            recommendations.append({
                "id": f"spotify_{track['id']}",
                "title": f"{track['name']} by {artist_names}",
                "description": f"A song to match your {mood_label} mood. Artist: {artist_names}",
                "type": "music",
                "link": track_url,
                "imageUrl": image_url,
                "forMoods": [mood_label],
                "tags": ["music", "spotify", "recommended"],
                "duration": milliseconds_to_time(track["duration_ms"])
            })
        
        return recommendations
    
    except Exception as e:
        print(f"Error getting Spotify recommendations: {str(e)}")
        return []

def get_youtube_videos(mood_label):
    """Get video recommendations from YouTube based on mood"""
    if not YOUTUBE_API_KEY:
        return []
        
    try:
        # Get search queries for this mood
        queries = MOOD_VIDEO_QUERIES.get(mood_label, MOOD_VIDEO_QUERIES["neutral"])
        
        # Choose a random query
        query = random.choice(queries)
        
        # Make API request
        search_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query,
            "maxResults": 3,
            "type": "video",
            "relevanceLanguage": "hi,en",  # Hindi and English content
            "regionCode": "IN",  # India region
            "key": YOUTUBE_API_KEY
        }
        
        response = requests.get(search_url, params=params)
        
        if response.status_code != 200:
            print(f"YouTube API error: {response.status_code}")
            return []
            
        data = response.json()
        
        # Format recommendations
        recommendations = []
        for item in data.get("items", []):
            video_id = item["id"]["videoId"]
            title = item["snippet"]["title"]
            description = item["snippet"]["description"]
            thumbnail = item["snippet"]["thumbnails"]["high"]["url"]
            
            # Determine video type based on title/description
            video_type = "video"
            if any(term in title.lower() for term in ["meditation", "mindfulness", "guided"]):
                video_type = "meditation"
            elif any(term in title.lower() for term in ["yoga", "exercise", "workout"]):
                video_type = "activity"
            elif any(term in title.lower() for term in ["breathing", "pranayama"]):
                video_type = "breathing"
            elif any(term in title.lower() for term in ["affirmation", "positive"]):
                video_type = "affirmation"
                
            recommendations.append({
                "id": f"youtube_{video_id}",
                "title": title,
                "description": description[:100] + "..." if len(description) > 100 else description,
                "type": video_type,
                "link": f"https://www.youtube.com/watch?v={video_id}",
                "imageUrl": thumbnail,
                "forMoods": [mood_label],
                "tags": ["video", "youtube", video_type],
                "duration": "5-10 min"  # YouTube API doesn't easily provide duration in search
            })
            
        return recommendations
        
    except Exception as e:
        print(f"Error getting YouTube recommendations: {str(e)}")
        return []

def get_personalized_recommendations(user_id, mood_label, previous_recommendations=None):
    """
    Get personalized recommendations based on mood
    
    Parameters:
    user_id (str): User ID
    mood_label (str): Current mood label
    previous_recommendations (list): Previously given recommendations to avoid repeating
    
    Returns:
    list: List of recommendation objects
    """
    if previous_recommendations is None:
        previous_recommendations = []
    
    # Start with pre-defined recommendations for the mood
    base_recommendations = RECOMMENDATIONS_DB.get(mood_label, [])
    
    # Filter out previously recommended items
    filtered_recommendations = [r for r in base_recommendations 
                              if r["id"] not in previous_recommendations]
    
    # If we have too few recommendations, add some from neutral mood or adjacent moods
    if len(filtered_recommendations) < 3:
        mood_order = ["depressed", "sad", "stressed", "anxious", "neutral", 
                      "relaxed", "calm", "happy", "joyful"]
        try:
            current_index = mood_order.index(mood_label)
            
            # Add recommendations from adjacent moods
            for i in range(1, 3):
                # Get recommendations from moods that are 1-2 steps away
                if current_index - i >= 0:
                    adjacent_mood = mood_order[current_index - i]
                    filtered_recommendations.extend(
                        [r for r in RECOMMENDATIONS_DB.get(adjacent_mood, [])
                         if r["id"] not in previous_recommendations][:1]
                    )
                
                if current_index + i < len(mood_order):
                    adjacent_mood = mood_order[current_index + i]
                    filtered_recommendations.extend(
                        [r for r in RECOMMENDATIONS_DB.get(adjacent_mood, [])
                         if r["id"] not in previous_recommendations][:1]
                    )
        except ValueError:
            # If mood not found in order, add neutral recommendations
            filtered_recommendations.extend(
                [r for r in RECOMMENDATIONS_DB.get("neutral", [])
                 if r["id"] not in previous_recommendations][:2]
            )
    
    # Get external recommendations
    spotify_recommendations = []
    youtube_recommendations = []
    
    try:
        spotify_recommendations = get_spotify_recommendations(mood_label)
    except Exception as e:
        print(f"Error getting Spotify recommendations: {str(e)}")
    
    try:
        youtube_recommendations = get_youtube_videos(mood_label)
    except Exception as e:
        print(f"Error getting YouTube recommendations: {str(e)}")
    
    # Combine all recommendations and select a balanced mix
    all_recommendations = []
    
    # Include 2-3 internal recommendations
    all_recommendations.extend(filtered_recommendations[:3])
    
    # Include 1-2 Spotify recommendations
    all_recommendations.extend(spotify_recommendations[:2])
    
    # Include 1-2 YouTube recommendations
    all_recommendations.extend(youtube_recommendations[:2])
    
    # Shuffle recommendations for variety
    random.shuffle(all_recommendations)
    
    # Limit to 5 total recommendations
    return all_recommendations[:5]

def milliseconds_to_time(ms):
    """Convert milliseconds to MM:SS format"""
    seconds = int((ms / 1000) % 60)
    minutes = int((ms / (1000 * 60)) % 60)
    return f"{minutes}:{seconds:02d}"
