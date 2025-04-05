
const youtubeSearchApi = require('youtube-search-api');

// Map moods to YouTube search queries
const moodQueries = {
  joyful: ['uplifting music', 'happy meditation', 'joyful yoga'],
  happy: ['positive affirmations', 'happy bollywood dance', 'cheerful music'],
  calm: ['calming meditation', 'nature sounds', 'peaceful music'],
  relaxed: ['guided relaxation', 'gentle yoga', 'relaxing Indian classical music'],
  neutral: ['mindfulness meditation', 'ambient music', 'breathing exercises'],
  anxious: ['anxiety relief meditation', 'breathing techniques for anxiety', 'calming sounds'],
  stressed: ['stress relief exercises', 'guided imagery', 'indian classical for stress'],
  sad: ['uplifting inspirational videos', 'motivational speeches', 'self-compassion meditation'],
  depressed: ['depression relief meditation', 'therapeutic music', 'positive psychology exercises']
};

// Map video types
const videoTypes = {
  meditation: ['meditation', 'mindfulness', 'guided'],
  exercise: ['yoga', 'workout', 'exercise', 'stretching'],
  music: ['music', 'playlist', 'song'],
  breathing: ['breathing', 'pranayama'],
  affirmation: ['affirmation', 'positive', 'mantra']
};

/**
 * Get recommendations from YouTube based on mood
 * @param {string} moodLabel The mood label to get recommendations for
 * @returns {Promise<Array>} Array of recommendation objects
 */
exports.getYouTubeRecommendations = async (moodLabel) => {
  try {
    // Get queries for this mood
    const queries = moodQueries[moodLabel] || moodQueries.neutral;
    
    // Choose a random query from the available options
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    // Search YouTube
    const searchResults = await youtubeSearchApi.GetListByKeyword(randomQuery, false, 5);
    
    if (!searchResults.items || searchResults.items.length === 0) {
      return [];
    }
    
    // Format recommendations for our database
    return searchResults.items.map(video => {
      // Determine video type based on title and description
      const videoType = determineVideoType(video.title);
      
      return {
        title: video.title,
        description: `A video to help with your ${moodLabel} mood.`,
        type: videoType,
        link: `https://www.youtube.com/watch?v=${video.id}`,
        imageUrl: video.thumbnail.thumbnails[0].url,
        forMoods: [moodLabel, 'neutral'],
        tags: ['video', 'youtube', videoType],
        duration: video.length ? formatDuration(video.length.simpleText) : '5 min'
      };
    });
    
  } catch (error) {
    console.error('YouTube API error:', error);
    return []; // Return empty array on error
  }
};

/**
 * Determine the type of video based on its title
 * @param {string} title Video title
 * @returns {string} Video type
 */
function determineVideoType(title) {
  const lowerTitle = title.toLowerCase();
  
  for (const [type, keywords] of Object.entries(videoTypes)) {
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword)) {
        return type === 'exercise' ? 'activity' : type;
      }
    }
  }
  
  // Default to video if we can't determine
  return 'video';
}

/**
 * Format YouTube duration to our format
 * @param {string} duration Duration in YouTube format
 * @returns {string} Formatted duration
 */
function formatDuration(duration) {
  if (!duration) return '5 min';
  
  // If it's already in minutes or seconds format, return as is
  if (duration.includes('min') || duration.includes('sec')) {
    return duration;
  }
  
  // Handle HH:MM:SS format
  const parts = duration.split(':');
  if (parts.length === 2) {
    return `${parseInt(parts[0])}:${parts[1]}`;
  } else if (parts.length === 3) {
    return `${parseInt(parts[0])}:${parts[1]}:${parts[2]}`;
  }
  
  return '5 min'; // Default if parsing fails
}
