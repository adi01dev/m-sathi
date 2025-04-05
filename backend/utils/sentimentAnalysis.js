
const { OpenAI } = require('openai');
const { analyzeSentimentWithAI } = require('./aiServiceConnector');

/**
 * Initialize OpenAI client
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze sentiment from audio data
 * @param {Buffer} audioBuffer Audio recording buffer
 * @returns {Promise<Object>} Analysis results
 */
exports.analyzeSentimentWithAI = async (audioBuffer) => {
  try {
    // First attempt to use the Python AI service
    try {
      // This will connect to our Python service which handles complex processing
      const aiServiceResult = await analyzeSentimentWithAI(audioBuffer);
      return aiServiceResult;
    } catch (aiServiceError) {
      console.warn('AI service unavailable, falling back to OpenAI:', aiServiceError.message);
      
      // Fall back to direct OpenAI API calls if the AI service is unavailable
      // Step 1: Convert speech to text using Whisper API
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: {
          buffer: audioBuffer,
          name: "audio.wav"
        },
        model: "whisper-1",
        language: "en"
      });
      
      const transcription = transcriptionResponse.text;

      // Step 2: Analyze sentiment using GPT-4
      const completionResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: `You are a mental health analysis assistant. Analyze the sentiment and emotional state from this voice journal entry. Consider tone, word choice, and expressed feelings.

            Return ONLY a JSON object with the following structure:
            {
              "transcription": "the transcribed text",
              "sentiment": {
                "label": "Overall sentiment (positive/negative/neutral/mixed)",
                "score": Numeric score from -1 (very negative) to 1 (very positive),
                "emotions": {
                  "emotion1": probability from 0 to 1,
                  "emotion2": probability from 0 to 1,
                  ...
                }
              },
              "moodLabel": "One of these labels: joyful, happy, calm, relaxed, neutral, anxious, stressed, sad, depressed",
              "moodScore": Numeric score from 1 to 10 (1 = very negative, 10 = very positive)
            }`
          },
          { 
            role: "user", 
            content: transcription 
          }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const analysisResult = JSON.parse(completionResponse.choices[0].message.content);
      
      return analysisResult;
    }
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    throw new Error('Failed to analyze sentiment');
  }
};
