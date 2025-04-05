
import React from 'react';
import { usePlant } from '@/context/PlantContext';
import { Progress } from '@/components/ui/progress';
import { SeedIcon, SproutIcon, LeafIcon, FlowerIcon, TreeIcon } from './PlantIcons';

export function PlantDisplay() {
  const { plantLevel, streak, streakPercentage, nextLevelDays, streakMessage } = usePlant();

  const getPlantIcon = () => {
    switch (plantLevel) {
      case 'sprout':
        return <SproutIcon className="h-32 w-32 animate-float" />;
      case 'leaf':
        return <LeafIcon className="h-32 w-32 animate-float" />;
      case 'flower':
        return <FlowerIcon className="h-36 w-36 animate-float" />;
      case 'tree':
        return <TreeIcon className="h-40 w-40 animate-float" />;
      default:
        return <SeedIcon className="h-24 w-24 animate-float" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <div className="plant-container">
        {getPlantIcon()}
        <div className="plant-tooltip text-center">
          <p className="font-medium">{plantLevel.charAt(0).toUpperCase() + plantLevel.slice(1)}</p>
          <p className="text-xs text-muted-foreground">{streak} day streak</p>
        </div>
      </div>
      
      <div className="w-full max-w-xs space-y-2">
        <div className="flex justify-between text-sm">
          <span>Streak: {streak} days</span>
          {plantLevel !== 'tree' && <span>{nextLevelDays} days to next level</span>}
        </div>
        <Progress value={streakPercentage} className="h-2" />
        <p className="text-center text-sm font-medium text-muted-foreground">{streakMessage}</p>
      </div>
    </div>
  );
}
