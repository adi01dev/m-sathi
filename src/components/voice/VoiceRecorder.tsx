
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { moodAPI } from '@/lib/api';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePlant } from '@/context/PlantContext';

interface VoiceRecorderProps {
  onMoodRecorded: (moodLabel: string, moodScore: number, transcription: string) => void;
}

export function VoiceRecorder({ onMoodRecorded }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { updateStreak } = usePlant();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start a timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Please speak about how you're feeling today...",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice check-in.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      
      setIsRecording(false);
      setIsProcessing(true);

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          
          // Process the audio with AI
          const result = await moodAPI.analyzeSentiment(audioBlob);
          
          // Update the user's streak
          await updateStreak(true);

          // Pass the results back to parent
          onMoodRecorded(result.moodLabel, result.moodScore, result.transcription);
          
          toast({
            title: "Mood recorded successfully",
            description: `You seem to be feeling ${result.moodLabel} today.`,
          });
        } catch (error) {
          console.error("Error processing audio:", error);
          toast({
            variant: "destructive",
            title: "Processing error",
            description: "There was an error analyzing your mood.",
          });
        } finally {
          setIsProcessing(false);
        }
      };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-8 rounded-full ${isRecording ? 'bg-red-100 animate-pulse' : isProcessing ? 'bg-amber-100' : 'bg-blue-50'}`}>
            {isRecording ? (
              <Square className="h-10 w-10 text-red-500" />
            ) : isProcessing ? (
              <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
            ) : (
              <Mic className="h-10 w-10 text-primary" />
            )}
          </div>
          
          {isRecording && (
            <div className="text-center">
              <h3 className="font-medium">Recording...</h3>
              <p className="text-sm text-muted-foreground">{formatTime(recordingTime)}</p>
            </div>
          )}
          
          {isProcessing && (
            <div className="text-center">
              <h3 className="font-medium">Processing your mood...</h3>
              <p className="text-sm text-muted-foreground">This will take a moment</p>
            </div>
          )}

          {!isRecording && !isProcessing && (
            <div className="text-center">
              <h3 className="font-medium">Record your mood</h3>
              <p className="text-sm text-muted-foreground">Speak about how you're feeling today</p>
            </div>
          )}

          <Button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
          >
            {isRecording ? "Stop Recording" : isProcessing ? "Processing..." : "Start Voice Check-In"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
