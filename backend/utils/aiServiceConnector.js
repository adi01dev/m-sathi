
const axios = require('axios');
const FormData = require('form-data');

/**
 * Configuration for AI service
 */
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Connect to the AI service API for sentiment analysis
 * @param {Buffer} audioBuffer - The audio buffer to analyze
 * @returns {Promise<Object>} - Analysis results
 */
exports.analyzeSentimentWithAI = async (audioBuffer) => {
  try {
    const formData = new FormData();
    formData.append('audioFile', audioBuffer, {
      filename: 'recording.wav',
      contentType: 'audio/wav',
    });

    const response = await axios.post(`${AI_SERVICE_URL}/analyze-sentiment`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    console.error('Error calling AI service for sentiment analysis:', error.message);
    
    if (error.response) {
      console.error('Response error data:', error.response.data);
    }
    
    throw new Error('Failed to analyze sentiment through AI service');
  }
};

/**
 * Get personalized recommendations from the AI service
 * @param {string} userId - User ID
 * @param {string} moodLabel - Mood label
 * @param {Array<string>} previousRecommendations - IDs of previously given recommendations
 * @returns {Promise<Array>} - List of recommendations
 */
exports.getAIRecommendations = async (userId, moodLabel, previousRecommendations = []) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/get-recommendations`, {
      userId,
      moodLabel,
      previousRecommendations
    });

    return response.data.recommendations || [];
  } catch (error) {
    console.error('Error calling AI service for recommendations:', error.message);
    throw new Error('Failed to get recommendations from AI service');
  }
};

/**
 * Generate a wellness report PDF using the AI service
 * @param {Object} reportData - Report data including mood entries, etc.
 * @returns {Promise<Object>} - Report generation status
 */
exports.generateReportWithAI = async (reportData) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/generate-report`, reportData);
    return response.data;
  } catch (error) {
    console.error('Error calling AI service for report generation:', error.message);
    throw new Error('Failed to generate report with AI service');
  }
};
