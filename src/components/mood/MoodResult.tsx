
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { moodEmojis, getMoodColor } from '@/lib/moodUtils';

interface MoodResultProps {
  moodLabel: string;
  moodScore: number;
  transcription: string;
  date?: Date;
}

export function MoodResult({ moodLabel, moodScore, transcription, date = new Date() }: MoodResultProps) {
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);

  const moodEmoji = moodEmojis[moodLabel as keyof typeof moodEmojis] || '😐';
  const moodColor = getMoodColor(moodScore);
  
  return (
    <Card className="w-full overflow-hidden">
      <div className={`h-2 ${moodColor}`}></div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Today's Mood: {moodLabel.charAt(0).toUpperCase() + moodLabel.slice(1)} <span className="text-2xl">{moodEmoji}</span>
        </CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Mood intensity</h4>
            <div className="flex items-center gap-2">
              <div className="h-3 flex-1 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className={`h-full ${moodColor}`} 
                  style={{ width: `${moodScore * 10}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{moodScore}/10</span>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium mb-2">Your journal entry</h4>
            <p className="text-muted-foreground text-sm italic">"{transcription}"</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        Check back tomorrow for your next mood check-in
      </CardFooter>
    </Card>
  );
}
