
import React, { useState, useEffect } from 'react';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { MoodResult } from '@/components/mood/MoodResult';
import { PlantDisplay } from '@/components/plant/PlantDisplay';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { CommunityGroups } from '@/components/community/CommunityGroups';
import { TokenWallet } from '@/components/reward/TokenWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { PlantProvider } from '@/context/PlantContext';
import { recommendationsAPI } from '@/lib/api';
import { getRandomQuote } from '@/lib/moodUtils';
import { Recommendation } from '@/lib/types';
import { Sparkles, Users, Coins } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [moodRecorded, setMoodRecorded] = useState(false);
  const [moodLabel, setMoodLabel] = useState('');
  const [moodScore, setMoodScore] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [quote, setQuote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has completed check-in today from localStorage
    const checkInStatus = localStorage.getItem('todayCheckIn');
    if (checkInStatus) {
      const { moodLabel, moodScore, transcription } = JSON.parse(checkInStatus);
      setMoodLabel(moodLabel);
      setMoodScore(moodScore);
      setTranscription(transcription);
      setMoodRecorded(true);

      // Fetch recommendations based on mood
      fetchRecommendations(moodLabel);
    }

    // Set a random quote
    setQuote(getRandomQuote('neutral'));
  }, []);

  const fetchRecommendations = async (mood: string) => {
    if (!user) return;
    
    try {
      const recs = await recommendationsAPI.getRecommendations(user.id, mood);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load recommendations.",
      });
    }
  };

  const handleMoodRecorded = (label: string, score: number, text: string) => {
    setMoodLabel(label);
    setMoodScore(score);
    setTranscription(text);
    setMoodRecorded(true);
    
    // Update quote based on mood
    setQuote(getRandomQuote(label));
    
    // Save check-in to localStorage
    localStorage.setItem('todayCheckIn', JSON.stringify({
      moodLabel: label,
      moodScore: score,
      transcription: text,
      date: new Date().toISOString()
    }));
    
    // Fetch recommendations based on mood
    fetchRecommendations(label);
  };

  // Redirect to login if not authenticated
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <PlantProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container py-4 flex justify-between items-center">
            <h1 className="text-2xl font-heading font-semibold">Mental Health Mirror</h1>
            <div className="flex items-center gap-2">
              <span>{user?.name}</span>
            </div>
          </div>
        </header>
        
        <main className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar */}
            <div className="space-y-6">
              {/* Welcome card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{greeting()}, {user?.name?.split(' ')[0]}!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">"{quote}"</p>
                </CardContent>
              </Card>
              
              {/* Plant growth */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Your Wellness Plant</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <PlantDisplay />
                </CardContent>
              </Card>
              
              {/* Token wallet */}
              <TokenWallet />
            </div>
            
            {/* Main content area */}
            <div className="md:col-span-2 space-y-6">
              {/* Mood check-in or result */}
              {!moodRecorded ? (
                <>
                  <h2 className="text-xl font-medium">Daily Mood Check-In</h2>
                  <VoiceRecorder onMoodRecorded={handleMoodRecorded} />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-medium">Today's Mood Check-In</h2>
                  <MoodResult 
                    moodLabel={moodLabel} 
                    moodScore={moodScore}
                    transcription={transcription}
                  />
                </>
              )}
              
              {/* Tabs for recommendations and community */}
              <Tabs defaultValue="recommendations" className="mt-6">
                <TabsList>
                  <TabsTrigger value="recommendations" className="flex gap-2">
                    <Sparkles className="h-4 w-4" /> Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="community" className="flex gap-2">
                    <Users className="h-4 w-4" /> Community
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="flex gap-2 md:hidden">
                    <Coins className="h-4 w-4" /> Rewards
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="recommendations" className="mt-6">
                  <h2 className="text-xl font-medium mb-4">Personalized Recommendations</h2>
                  {moodRecorded ? (
                    <RecommendationsList 
                      recommendations={recommendations} 
                      moodLabel={moodLabel}
                    />
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <h3 className="font-medium">Complete your mood check-in first</h3>
                        <p className="text-muted-foreground text-sm">
                          We'll provide personalized recommendations based on your mood.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="community" className="mt-6">
                  <h2 className="text-xl font-medium mb-4">Community Support Groups</h2>
                  <CommunityGroups />
                </TabsContent>
                
                <TabsContent value="rewards" className="mt-6 md:hidden">
                  <h2 className="text-xl font-medium mb-4">Wellness Rewards</h2>
                  <TokenWallet />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </PlantProvider>
  );
};

export default Dashboard;
