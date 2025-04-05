
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlantLevel } from '@/lib/types';
import { userAPI } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface PlantContextType {
  streak: number;
  plantLevel: PlantLevel;
  lastCheckIn: Date | null;
  updateStreak: (checkIn: boolean) => Promise<void>;
  streakPercentage: number;
  nextLevelDays: number;
  streakMessage: string;
}

const PlantContext = createContext<PlantContextType>({} as PlantContextType);

export const PlantProvider = ({ children }: { children: React.ReactNode }) => {
  const [streak, setStreak] = useState(0);
  const [plantLevel, setPlantLevel] = useState<PlantLevel>('seed');
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate streak percentage to next level
  const streakPercentage = (): number => {
    if (plantLevel === 'seed' && streak === 0) return 0;
    if (plantLevel === 'sprout') return (streak / 3) * 100;
    if (plantLevel === 'leaf') return ((streak - 3) / 4) * 100;
    if (plantLevel === 'flower') return ((streak - 7) / 7) * 100;
    if (plantLevel === 'tree') return 100;
    return (streak / 1) * 100; // seed to sprout
  };

  // Days until next level
  const nextLevelDays = (): number => {
    if (plantLevel === 'seed') return 1 - streak;
    if (plantLevel === 'sprout') return 3 - streak;
    if (plantLevel === 'leaf') return 7 - streak;
    if (plantLevel === 'flower') return 14 - streak;
    return 0; // already at max level
  };

  // Motivational message based on streak
  const streakMessage = (): string => {
    if (streak === 0) return "Start your wellness journey today!";
    if (streak === 1) return "First day - you're on your way!";
    if (streak < 5) return `Amazing! ${streak} day streak!`;
    if (streak < 10) return `Incredible! ${streak} days of self-care!`;
    return `Remarkable! ${streak} day wellness journey!`;
  };

  useEffect(() => {
    const initializeStreak = async () => {
      if (user?.id) {
        try {
          const userStreak = await userAPI.getStreak(user.id);
          setStreak(userStreak);
          
          // Set plant level based on streak
          let level: PlantLevel = 'seed';
          if (userStreak >= 14) level = 'tree';
          else if (userStreak >= 7) level = 'flower';
          else if (userStreak >= 3) level = 'leaf';
          else if (userStreak >= 1) level = 'sprout';
          
          setPlantLevel(level);
          
          // Check local storage for last check-in
          const lastCheckInStr = localStorage.getItem('lastCheckIn');
          if (lastCheckInStr) {
            setLastCheckIn(new Date(lastCheckInStr));
          }
        } catch (error) {
          console.error("Failed to initialize streak:", error);
        }
      }
    };
    
    initializeStreak();
  }, [user?.id]);

  const updateStreak = async (checkIn: boolean) => {
    if (!user?.id) return;
    
    try {
      const today = new Date();
      
      if (checkIn) {
        // If already checked in today, don't increment streak
        if (lastCheckIn && 
            lastCheckIn.getDate() === today.getDate() &&
            lastCheckIn.getMonth() === today.getMonth() &&
            lastCheckIn.getFullYear() === today.getFullYear()) {
          return;
        }
        
        const { streak: newStreak, plantLevel: newPlantLevel } = await userAPI.updateStreak(user.id, true);
        setStreak(newStreak);
        setPlantLevel(newPlantLevel as PlantLevel);
        setLastCheckIn(today);
        localStorage.setItem('lastCheckIn', today.toISOString());
        
        // Show plant level up notification
        if (newPlantLevel !== plantLevel) {
          toast({
            title: "Your plant has grown! 🌱",
            description: `Your wellness plant is now a ${newPlantLevel}!`,
          });
        }
      } else {
        // Reset streak (missed day)
        const { streak: newStreak, plantLevel: newPlantLevel } = await userAPI.updateStreak(user.id, false);
        setStreak(newStreak);
        setPlantLevel(newPlantLevel as PlantLevel);
        
        toast({
          variant: "destructive",
          title: "Streak reset",
          description: "Your plant has wilted slightly. Start fresh today!",
        });
      }
    } catch (error) {
      console.error("Failed to update streak:", error);
      toast({
        variant: "destructive",
        title: "Error updating streak",
        description: "Please try again later.",
      });
    }
  };

  return (
    <PlantContext.Provider
      value={{
        streak,
        plantLevel,
        lastCheckIn,
        updateStreak,
        streakPercentage: streakPercentage(),
        nextLevelDays: nextLevelDays(),
        streakMessage: streakMessage(),
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

export const usePlant = () => useContext(PlantContext);
