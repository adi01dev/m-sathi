
// API service for interacting with the backend

import { User, MoodEntry, Recommendation, CommunityGroup, Message, WellnessReport } from "./types";

// Mock API for frontend development - in a real app, these would make actual API calls
const MOCK_DELAY = 500; // Simulate network delay

// Mock data
const mockUser: User = {
  id: "user-1",
  name: "Rajesh Kumar",
  email: "rajesh@example.com",
  occupation: "professional",
  healthStatus: "Generally healthy, occasional stress",
  goals: ["Reduce anxiety", "Improve sleep", "Practice mindfulness"],
  createdAt: new Date().toISOString(),
  streak: 0,
  plantLevel: "seed",
  tokens: 0
};

const mockMoods: MoodEntry[] = [
  {
    id: "mood-1",
    userId: "user-1",
    date: new Date().toISOString(),
    moodScore: 7,
    moodLabel: "happy"
  }
];

const mockRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    title: "Morning Meditation",
    description: "Start your day with a 5-minute meditation to set a positive tone.",
    type: "meditation",
    imageUrl: "/placeholder.svg",
    forMoods: ["anxious", "stressed"],
    tags: ["beginner", "morning"],
    duration: "5 min",
    completed: false
  },
  {
    id: "rec-2",
    title: "Bollywood Mood Lifter",
    description: "Energetic songs to lift your spirits and get you moving.",
    type: "music",
    link: "https://open.spotify.com/playlist/37i9dQZF1DX6KPLbETVFRI",
    imageUrl: "/placeholder.svg",
    forMoods: ["sad", "neutral"],
    tags: ["music", "bollywood"],
    duration: "30 min",
    completed: false
  },
  {
    id: "rec-3",
    title: "Yoga for Anxiety",
    description: "Gentle yoga poses to help calm your mind and relieve anxiety.",
    type: "activity",
    link: "https://www.youtube.com/watch?v=hJbRpHZr_d0",
    imageUrl: "/placeholder.svg",
    forMoods: ["anxious", "stressed"],
    tags: ["yoga", "anxiety"],
    duration: "15 min",
    completed: false
  }
];

const mockCommunities: CommunityGroup[] = [
  {
    id: "group-1",
    name: "Anxiety Support",
    description: "A safe space to share experiences and coping strategies for anxiety.",
    category: "Mental Health",
    memberCount: 145,
    imageUrl: "/placeholder.svg",
    latestActivity: new Date().toISOString()
  },
  {
    id: "group-2",
    name: "Mindful Professionals",
    description: "For working professionals seeking work-life balance and stress management.",
    category: "Professional",
    memberCount: 72,
    imageUrl: "/placeholder.svg",
    latestActivity: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "group-3",
    name: "Young Adults (18-25)",
    description: "Navigating emotional wellness during college and early career years.",
    category: "Age Group",
    memberCount: 210,
    imageUrl: "/placeholder.svg",
    latestActivity: new Date(Date.now() - 172800000).toISOString()
  }
];

// Auth API
export const authAPI = {
  register: async (userData: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return { ...mockUser, ...userData };
  },
  
  login: async (email: string, password: string): Promise<{user: User, token: string}> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    // Simple validation for demo purposes
    if (email && password) {
      return {
        user: mockUser,
        token: "mock-jwt-token"
      };
    }
    throw new Error("Invalid credentials");
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const token = localStorage.getItem("token");
    return token ? mockUser : null;
  }
};

// User API
export const userAPI = {
  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return { ...mockUser, ...updates };
  },
  
  getStreak: async (userId: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return mockUser.streak;
  },
  
  updateStreak: async (userId: string, increment: boolean): Promise<{streak: number, plantLevel: string}> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    let newStreak = increment ? mockUser.streak + 1 : 0;
    let plantLevel: string = mockUser.plantLevel;
    
    // Update plant level based on streak
    if (newStreak >= 14) plantLevel = "tree";
    else if (newStreak >= 7) plantLevel = "flower";
    else if (newStreak >= 3) plantLevel = "leaf";
    else if (newStreak >= 1) plantLevel = "sprout";
    else plantLevel = "seed";
    
    mockUser.streak = newStreak;
    mockUser.plantLevel = plantLevel as any;
    
    return { streak: newStreak, plantLevel };
  }
};

// Mood API
export const moodAPI = {
  recordMood: async (moodData: Partial<MoodEntry>): Promise<MoodEntry> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const newMood = {
      id: `mood-${Date.now()}`,
      userId: mockUser.id,
      date: new Date().toISOString(),
      moodScore: 5,
      moodLabel: "neutral" as const,
      ...moodData
    };
    mockMoods.unshift(newMood);
    return newMood;
  },
  
  getMoodHistory: async (userId: string, days: number = 7): Promise<MoodEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return mockMoods;
  },
  
  analyzeSentiment: async (audioBlob: Blob): Promise<{
    transcription: string;
    sentiment: {
      label: string;
      score: number;
      emotions: Record<string, number>;
    };
    moodLabel: string;
    moodScore: number;
  }> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock sentiment analysis result
    return {
      transcription: "Today I'm feeling quite relaxed after my morning yoga session, though I have some deadlines coming up that are causing a bit of worry.",
      sentiment: {
        label: "mixed",
        score: 0.2, // slightly positive
        emotions: {
          relaxed: 0.6,
          worried: 0.3,
          neutral: 0.1
        }
      },
      moodLabel: "relaxed",
      moodScore: 6
    };
  }
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: async (userId: string, moodLabel: string): Promise<Recommendation[]> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    // Filter recommendations based on mood
    return mockRecommendations.filter(rec => 
      rec.forMoods.includes(moodLabel as any) || rec.forMoods.includes("neutral")
    );
  },
  
  markCompleted: async (userId: string, recommendationId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const rec = mockRecommendations.find(r => r.id === recommendationId);
    if (rec) {
      rec.completed = true;
      mockUser.tokens += 5; // Award tokens for completing a recommendation
    }
  }
};

// Community API
export const communityAPI = {
  getGroups: async (): Promise<CommunityGroup[]> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return mockCommunities;
  },
  
  joinGroup: async (userId: string, groupId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    // In a real app, this would update the user's group memberships
    return;
  },
  
  getMessages: async (groupId: string): Promise<Message[]> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return [
      {
        id: "msg-1",
        groupId,
        userId: "user-2",
        userName: "Priya Sharma",
        content: "I've been practicing the breathing techniques we discussed last week, and they really help during stressful meetings!",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "msg-2",
        groupId,
        userId: "user-3",
        userName: "Amit Patel",
        content: "Has anyone tried the Ayurvedic sleep remedies? I'm looking for natural ways to improve my sleep quality.",
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  },
  
  sendMessage: async (message: Partial<Message>): Promise<Message> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const newMessage = {
      id: `msg-${Date.now()}`,
      groupId: message.groupId || "",
      userId: mockUser.id,
      userName: mockUser.name,
      content: message.content || "",
      timestamp: new Date().toISOString()
    };
    return newMessage;
  }
};

// Reports API
export const reportsAPI = {
  generateWeeklyReport: async (userId: string): Promise<WellnessReport> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      userId,
      weekNumber: Math.ceil(now.getDate() / 7),
      year: now.getFullYear(),
      startDate: startOfWeek.toISOString(),
      endDate: endOfWeek.toISOString(),
      averageMood: 6.5,
      moodEntries: mockMoods,
      streakMaintained: true,
      plantProgress: 25, // percentage
      recommendations: mockRecommendations.filter(r => r.completed),
      url: "#" // In a real app, this would be a URL to the downloadable PDF
    };
  }
};

// Reward API (Blockchain tokens)
export const rewardAPI = {
  getTokenBalance: async (userId: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return mockUser.tokens;
  },
  
  awardTokens: async (userId: string, amount: number, reason: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    mockUser.tokens += amount;
    return mockUser.tokens;
  },
  
  redeemTokens: async (userId: string, amount: number, reward: string): Promise<{
    success: boolean;
    newBalance: number;
    message: string;
  }> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    if (mockUser.tokens >= amount) {
      mockUser.tokens -= amount;
      return {
        success: true,
        newBalance: mockUser.tokens,
        message: `Successfully redeemed ${amount} tokens for ${reward}`
      };
    }
    
    return {
      success: false,
      newBalance: mockUser.tokens,
      message: "Insufficient token balance"
    };
  }
};
