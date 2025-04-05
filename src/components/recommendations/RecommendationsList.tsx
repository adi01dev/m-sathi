
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Recommendation } from '@/lib/types';
import { Music, Video, Activity, Lungs, Sparkles, MessageSquareQuote, PenLine, Check } from 'lucide-react';
import { recommendationsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface RecommendationsListProps {
  recommendations: Recommendation[];
  moodLabel: string;
}

export function RecommendationsList({ recommendations, moodLabel }: RecommendationsListProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const { toast } = useToast();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'activity': return <Activity className="h-4 w-4" />;
      case 'breathing': return <Lungs className="h-4 w-4" />;
      case 'meditation': return <Sparkles className="h-4 w-4" />;
      case 'affirmation': return <MessageSquareQuote className="h-4 w-4" />;
      case 'journaling': return <PenLine className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await recommendationsAPI.markCompleted('user-1', id);
      setCompletedIds(prev => [...prev, id]);
      
      toast({
        title: "Activity completed!",
        description: "You've earned 5 wellness tokens for your effort.",
      });
    } catch (error) {
      console.error("Error marking recommendation as complete:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Couldn't mark activity as complete. Please try again.",
      });
    }
  };

  const isCompleted = (id: string): boolean => {
    return completedIds.includes(id) || !!recommendations.find(r => r.id === id && r.completed);
  };

  const groupedRecommendations = recommendations.reduce((acc, recommendation) => {
    if (!acc[recommendation.type]) {
      acc[recommendation.type] = [];
    }
    acc[recommendation.type].push(recommendation);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const availableTabs = Object.keys(groupedRecommendations);

  if (recommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No recommendations available</h3>
          <p className="text-muted-foreground">Check back after your next mood check-in.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue={availableTabs[0]} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
        {availableTabs.map(tab => (
          <TabsTrigger key={tab} value={tab} className="flex gap-2 items-center">
            {getIcon(tab)}
            <span className="capitalize hidden md:inline">{tab}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {availableTabs.map(tab => (
        <TabsContent key={tab} value={tab} className="space-y-4">
          {groupedRecommendations[tab].map(item => (
            <RecommendationCard 
              key={item.id}
              recommendation={item}
              completed={isCompleted(item.id)}
              onComplete={() => handleComplete(item.id)}
            />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  completed: boolean;
  onComplete: () => void;
}

function RecommendationCard({ recommendation, completed, onComplete }: RecommendationCardProps) {
  return (
    <Card className={`overflow-hidden transition-opacity ${completed ? 'opacity-75' : ''}`}>
      <div className="h-2 bg-primary"></div>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{recommendation.title}</span>
          {recommendation.duration && (
            <Badge variant="outline" className="ml-2">
              {recommendation.duration}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-sm">{recommendation.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {recommendation.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="capitalize">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {recommendation.link ? (
          <Button variant="outline" asChild>
            <a href={recommendation.link} target="_blank" rel="noopener noreferrer">
              Open {recommendation.type}
            </a>
          </Button>
        ) : (
          <div></div>
        )}
        
        <Button 
          onClick={onComplete} 
          disabled={completed}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Completed
            </>
          ) : "Mark Complete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
