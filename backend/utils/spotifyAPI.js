
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Map moods to Spotify seed genres and attributes
const moodMappings = {
  joyful: {
    genres: ['pop', 'happy', 'dance'],
    attributes: { min_energy: 0.8, min_valence: 0.8 }
  },
  happy: {
    genres: ['pop', 'indie_pop', 'feel-good'],
    attributes: { min_energy: 0.6, min_valence: 0.6 }
  },
  calm: {
    genres: ['ambient', 'chill', 'classical'],
    attributes: { max_energy: 0.4, min_valence: 0.5 }
  },
  relaxed: {
    genres: ['acoustic', 'chill', 'study'],
    attributes: { max_energy: 0.5, min_valence: 0.4 }
  },
  neutral: {
    genres: ['indie', 'pop', 'folk'],
    attributes: { target_energy: 0.5, target_valence: 0.5 }
  },
  anxious: {
    genres: ['ambient', 'classical', 'piano'],
    attributes: { max_energy: 0.4, max_tempo: 80 }
  },
  stressed: {
    genres: ['meditation', 'ambient', 'sleep'],
    attributes: { max_energy: 0.3, max_tempo: 70 }
  },
  sad: {
    genres: ['sad', 'indie', 'emotional'],
    attributes: { max_energy: 0.5, max_valence: 0.4 }
  },
  depressed: {
    genres: ['chill', 'ambient', 'acoustic'],
    attributes: { max_energy: 0.4, max_valence: 0.3 }
  }
};

// Cache the access token and its expiry
let tokenExpiryTime = null;

/**
 * Get recommendations from Spotify based on mood
 * @param {string} moodLabel The mood label to get recommendations for
 * @returns {Promise<Array>} Array of recommendation objects
 */
exports.getSpotifyRecommendations = async (moodLabel) => {
  try {
    // Check if we need to refresh the access token
    const now = Date.now();
    if (!tokenExpiryTime || now >= tokenExpiryTime) {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body.access_token);
      
      // Set expiry time (subtracting 60 seconds as buffer)
      tokenExpiryTime = now + (data.body.expires_in - 60) * 1000;
    }
    
    // Get mood mapping
    const mappingForMood = moodMappings[moodLabel] || moodMappings.neutral;
    
    // Get recommendations from Spotify
    const response = await spotifyApi.getRecommendations({
      seed_genres: mappingForMood.genres.slice(0, 2), // Spotify allows max 5 seeds
      limit: 5,
      ...mappingForMood.attributes
    });
    
    // Format recommendations for our database
    return response.body.tracks.map(track => ({
      title: `${track.name} by ${track.artists[0].name}`,
      description: `A song to match your ${moodLabel} mood. Artist: ${track.artists.map(a => a.name).join(', ')}`,
      type: 'music',
      link: track.external_urls.spotify,
      imageUrl: track.album.images[0]?.url || '/placeholder.svg',
      forMoods: [moodLabel, 'neutral'],
      tags: ['music', 'spotify', ...mappingForMood.genres],
      duration: msToMinSec(track.duration_ms)
    }));
    
  } catch (error) {
    console.error('Spotify API error:', error);
    return []; // Return empty array on error
  }
};

// Helper function to convert milliseconds to min:sec format
function msToMinSec(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
}
