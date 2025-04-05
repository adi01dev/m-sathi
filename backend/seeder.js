
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');
const Recommendation = require('./models/recommendation.model');
const { CommunityGroup } = require('./models/community.model');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample recommendations data
const recommendationsData = [
  {
    title: 'Morning Meditation',
    description: 'Start your day with a 5-minute meditation to set a positive tone.',
    type: 'meditation',
    forMoods: ['anxious', 'stressed', 'neutral'],
    tags: ['beginner', 'morning'],
    duration: '5 min'
  },
  {
    title: 'Bollywood Mood Lifter',
    description: 'Energetic songs to lift your spirits and get you moving.',
    type: 'music',
    link: 'https://open.spotify.com/playlist/37i9dQZF1DX6KPLbETVFRI',
    forMoods: ['sad', 'neutral', 'depressed'],
    tags: ['music', 'bollywood'],
    duration: '30 min'
  },
  {
    title: 'Yoga for Anxiety',
    description: 'Gentle yoga poses to help calm your mind and relieve anxiety.',
    type: 'activity',
    link: 'https://www.youtube.com/watch?v=hJbRpHZr_d0',
    forMoods: ['anxious', 'stressed'],
    tags: ['yoga', 'anxiety'],
    duration: '15 min'
  },
  {
    title: '4-7-8 Breathing Technique',
    description: 'A simple breathing exercise to help reduce stress and anxiety quickly.',
    type: 'breathing',
    forMoods: ['anxious', 'stressed', 'neutral'],
    tags: ['breathing', 'quick'],
    duration: '3 min'
  },
  {
    title: 'Daily Positive Affirmations',
    description: 'Start your day with these powerful positive affirmations to boost your mood.',
    type: 'affirmation',
    forMoods: ['depressed', 'sad', 'neutral'],
    tags: ['affirmation', 'morning'],
    duration: '5 min'
  },
  {
    title: 'Gratitude Journaling',
    description: 'Write down three things you are grateful for today.',
    type: 'journaling',
    forMoods: ['depressed', 'sad', 'neutral'],
    tags: ['gratitude', 'writing'],
    duration: '10 min'
  },
  {
    title: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and relax different muscle groups to reduce physical tension.',
    type: 'meditation',
    forMoods: ['stressed', 'anxious'],
    tags: ['relaxation', 'physical'],
    duration: '15 min'
  },
  {
    title: 'Classical Ragas for Peace',
    description: 'Traditional Indian classical music known for its calming properties.',
    type: 'music',
    forMoods: ['anxious', 'neutral', 'stressed'],
    tags: ['indian', 'classical'],
    duration: '20 min'
  },
  {
    title: 'Nature Walk Mindfulness',
    description: 'Take a walk outside and practice mindfulness by engaging all your senses.',
    type: 'activity',
    forMoods: ['neutral', 'sad', 'anxious'],
    tags: ['outdoors', 'mindfulness'],
    duration: '30 min'
  },
  {
    title: 'Evening Wind Down Routine',
    description: 'A sequence of activities to prepare your mind and body for restful sleep.',
    type: 'activity',
    forMoods: ['neutral', 'stressed'],
    tags: ['evening', 'sleep'],
    duration: '20 min'
  }
];

// Sample community groups data
const communityGroupsData = [
  {
    name: 'Anxiety Support',
    description: 'A safe space to share experiences and coping strategies for anxiety.',
    category: 'Mental Health',
    members: []
  },
  {
    name: 'Mindful Professionals',
    description: 'For working professionals seeking work-life balance and stress management.',
    category: 'Professional',
    members: []
  },
  {
    name: 'Young Adults (18-25)',
    description: 'Navigating emotional wellness during college and early career years.',
    category: 'Age Group',
    members: []
  },
  {
    name: 'Meditation Practice',
    description: 'Share meditation experiences, techniques, and progress with others.',
    category: 'Practice',
    members: []
  },
  {
    name: 'Indian Wellness Traditions',
    description: 'Exploring Ayurveda, yoga, and traditional Indian approaches to mental wellness.',
    category: 'Cultural',
    members: []
  }
];

// Import data into database
const importData = async () => {
  try {
    // Clear existing data
    await Recommendation.deleteMany();
    await CommunityGroup.deleteMany();
    
    // Insert new data
    await Recommendation.insertMany(recommendationsData);
    await CommunityGroup.insertMany(communityGroupsData);
    
    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete all data from database
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Recommendation.deleteMany();
    await CommunityGroup.deleteMany();
    
    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Determine which function to run based on command line args
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
