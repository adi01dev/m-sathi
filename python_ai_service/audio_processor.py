
import os
import io
import librosa
import numpy as np
import soundfile as sf
import tempfile
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def process_audio(audio_data):
    """
    Process audio data to extract features useful for sentiment analysis
    
    Parameters:
    audio_data (bytes): Raw audio data
    
    Returns:
    dict: Audio features including mfccs, chroma, mel, contrast, tonnetz
    """
    try:
        # Save audio data to temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            temp_audio.write(audio_data)
            temp_audio_path = temp_audio.name
        
        # Load audio file with librosa
        y, sr = librosa.load(temp_audio_path, sr=22050)
        
        # Remove temporary file
        os.unlink(temp_audio_path)
        
        # Extract audio features
        
        # 1. MFCCs (Mel-Frequency Cepstral Coefficients)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfccs_mean = np.mean(mfccs.T, axis=0).tolist()
        
        # 2. Chroma features
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma.T, axis=0).tolist()
        
        # 3. Mel-scaled spectrogram
        mel = librosa.feature.melspectrogram(y=y, sr=sr)
        mel_mean = np.mean(librosa.power_to_db(mel).T, axis=0).tolist()
        
        # 4. Spectral Contrast
        contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        contrast_mean = np.mean(contrast.T, axis=0).tolist()
        
        # 5. Tonnetz (tonal centroid features)
        tonnetz = librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr)
        tonnetz_mean = np.mean(tonnetz.T, axis=0).tolist()
        
        # 6. Zero Crossing Rate
        zcr = librosa.feature.zero_crossing_rate(y)
        zcr_mean = np.mean(zcr.T, axis=0).tolist()
        
        # 7. Tempo and beat strength
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        
        # 8. RMS Energy
        rms = librosa.feature.rms(y=y)
        rms_mean = np.mean(rms.T, axis=0).tolist()
        
        # Combine features
        features = {
            "mfccs": mfccs_mean,
            "chroma": chroma_mean,
            "mel": mel_mean,
            "contrast": contrast_mean,
            "tonnetz": tonnetz_mean,
            "zcr": zcr_mean,
            "tempo": float(tempo),
            "rms": rms_mean
        }
        
        return features
    except Exception as e:
        print(f"Error in audio processing: {str(e)}")
        return None

def transcribe_audio(audio_data):
    """
    Transcribe audio data to text using OpenAI Whisper
    
    Parameters:
    audio_data (bytes): Raw audio data
    
    Returns:
    str: Transcribed text
    """
    try:
        # Save audio data to temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            temp_audio.write(audio_data)
            temp_audio_path = temp_audio.name
        
        # Use OpenAI's Whisper API via client API
        with open(temp_audio_path, "rb") as audio_file:
            transcription = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="en"
            )
        
        # Remove temporary file
        os.unlink(temp_audio_path)
        
        return transcription.text
    except Exception as e:
        print(f"Error in transcription: {str(e)}")
        return "Error in transcription"
