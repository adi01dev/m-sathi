
// Type definitions for our application

export type User = {
  id: string;
  name: string;
  email: string;
  occupation: 'student' | 'professional' | 'other';
  healthStatus: string;
  goals: string[];
  createdAt: string;
  streak: number;
  plantLevel: PlantLevel;
  tokens: number;
};

export type PlantLevel = 'seed' | 'sprout' | 'leaf' | 'flower' | 'tree';

export type MoodEntry = {
  id: string;
  userId: string;
  date: string;
  moodScore: number; // 1-10
  moodLabel: MoodLabel;
  audioUrl?: string;
  transcription?: string;
  sentimentAnalysis?: SentimentAnalysis;
};

export type MoodLabel = 
  | 'joyful' 
  | 'happy' 
  | 'calm' 
  | 'relaxed' 
  | 'neutral' 
  | 'anxious' 
  | 'stressed' 
  | 'sad' 
  | 'depressed';

export type SentimentAnalysis = {
  score: number; // -1 to 1, negative to positive
  label: string;
  emotions: {
    [key: string]: number; // e.g. {joy: 0.8, sadness: 0.1}
  };
};

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  type: 'music' | 'video' | 'activity' | 'breathing' | 'meditation' | 'affirmation' | 'journaling';
  link?: string;
  imageUrl?: string;
  forMoods: MoodLabel[];
  tags: string[];
  duration?: string;
  completed?: boolean;
};

export type CommunityGroup = {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  imageUrl?: string;
  latestActivity?: string;
};

export type Message = {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
};

export type WellnessReport = {
  userId: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  averageMood: number;
  moodEntries: MoodEntry[];
  streakMaintained: boolean;
  plantProgress: number;
  recommendations: Recommendation[];
  url?: string;
};
