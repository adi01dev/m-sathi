
const Recommendation = require('../models/recommendation.model');
const User = require('../models/user.model');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const { getSpotifyRecommendations } = require('../utils/spotifyAPI');
const { getYouTubeRecommendations } = require('../utils/youtubeAPI');
const { getAIRecommendations } = require('../utils/aiServiceConnector');

/**
 * @desc    Get recommendations for user
 * @route   GET /api/recommendations
 * @access  Private
 */
exports.getRecommendations = asyncHandler(async (req, res) => {
  const { moodLabel } = req.query;
  
  if (!moodLabel) {
    throw new AppError('Mood label is required', 400);
  }

  // Get stored recommendations
  let recommendations = await Recommendation.findForMood(moodLabel, 10);
  
  // If we have less than 5 recommendations, fetch some from external sources
  if (recommendations.length < 5) {
    try {
      // First try to get recommendations from the AI service
      const userId = req.user._id.toString();
      const previousRecommendationIds = recommendations.map(rec => rec._id.toString());
      
      try {
        // Get AI-powered personalized recommendations
        const aiRecommendations = await getAIRecommendations(
          userId, 
          moodLabel, 
          previousRecommendationIds
        );
        
        // Save these recommendations to database
        if (aiRecommendations && aiRecommendations.length > 0) {
          // Format recommendations for our database model
          const formattedRecs = aiRecommendations.map(rec => ({
            title: rec.title,
            description: rec.description,
            type: rec.type,
            link: rec.link,
            imageUrl: rec.imageUrl,
            forMoods: rec.forMoods || [moodLabel],
            tags: rec.tags || [],
            duration: rec.duration
          }));
          
          await Recommendation.insertMany(formattedRecs);
        }
      } catch (aiError) {
        console.error('Error fetching AI recommendations:', aiError);
        
        // Fall back to direct API services if AI service fails
        // Get music recommendations from Spotify based on mood
        const spotifyRecs = await getSpotifyRecommendations(moodLabel);
        
        // Get video recommendations from YouTube based on mood
        const youtubeRecs = await getYouTubeRecommendations(moodLabel);
        
        // Save these recommendations to database
        if (spotifyRecs.length > 0) {
          await Recommendation.insertMany(spotifyRecs);
        }
        
        if (youtubeRecs.length > 0) {
          await Recommendation.insertMany(youtubeRecs);
        }
      }
      
      // Get updated list of recommendations
      recommendations = await Recommendation.findForMood(moodLabel, 10);
    } catch (error) {
      console.error('Error fetching external recommendations:', error);
      // Continue with existing recommendations
    }
  }
  
  // Check if any recommendations are already completed by the user
  const userId = req.user._id;
  const processedRecommendations = recommendations.map(rec => {
    const isCompleted = rec.userCompletions.some(
      completion => completion.userId.toString() === userId.toString()
    );
    
    return {
      id: rec._id,
      title: rec.title,
      description: rec.description,
      type: rec.type,
      link: rec.link,
      imageUrl: rec.imageUrl,
      forMoods: rec.forMoods,
      tags: rec.tags,
      duration: rec.duration,
      completed: isCompleted
    };
  });

  res.status(200).json({
    success: true,
    count: processedRecommendations.length,
    data: processedRecommendations
  });
});

/**
 * @desc    Mark a recommendation as completed
 * @route   POST /api/recommendations/:id/complete
 * @access  Private
 */
exports.markCompleted = asyncHandler(async (req, res) => {
  const recommendationId = req.params.id;
  const userId = req.user._id;
  
  // Find the recommendation
  const recommendation = await Recommendation.findById(recommendationId);
  
  if (!recommendation) {
    throw new AppError('Recommendation not found', 404);
  }
  
  // Check if already completed
  const alreadyCompleted = recommendation.userCompletions.some(
    completion => completion.userId.toString() === userId.toString()
  );
  
  if (!alreadyCompleted) {
    // Mark as completed
    recommendation.userCompletions.push({ userId });
    await recommendation.save();
    
    // Award tokens to user
    const user = await User.findById(userId);
    user.tokens += 5;
    await user.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Recommendation marked as completed',
    tokens: alreadyCompleted ? undefined : user.tokens
  });
});
