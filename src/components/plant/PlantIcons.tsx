
import React from 'react';

interface PlantIconProps {
  className?: string;
}

export const SeedIcon: React.FC<PlantIconProps> = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="65" r="15" fill="#7C5E2A" />
    <path d="M50 20 L50 50" stroke="#69C6BA" strokeWidth="2" strokeLinecap="round" />
    <path d="M45 55 C45 45, 55 45, 55 55" stroke="#69C6BA" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SproutIcon: React.FC<PlantIconProps> = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="80" r="10" fill="#7C5E2A" />
    <path d="M50 20 L50 70" stroke="#69C6BA" strokeWidth="3" strokeLinecap="round" />
    <path d="M35 40 C50 25, 50 40, 65 40" stroke="#69C6BA" strokeWidth="3" strokeLinecap="round" />
    <path d="M42 50 C50 40, 50 50, 58 50" stroke="#69C6BA" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const LeafIcon: React.FC<PlantIconProps> = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="85" r="8" fill="#7C5E2A" />
    <path d="M50 15 L50 75" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
    <path d="M30 35 Q50 15, 70 35" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" fill="#E0F2E9" />
    <path d="M35 50 Q50 35, 65 50" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" fill="#E0F2E9" />
    <path d="M40 65 Q50 55, 60 65" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" fill="#E0F2E9" />
  </svg>
);

export const FlowerIcon: React.FC<PlantIconProps> = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="85" r="8" fill="#7C5E2A" />
    <path d="M50 15 L50 75" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
    <path d="M35 50 Q50 35, 65 50" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" fill="#E0F2E9" />
    <circle cx="50" cy="25" r="15" fill="#E8BBFF" />
    <circle cx="50" cy="25" r="8" fill="#FFC107" />
    <path d="M40 65 Q50 55, 60 65" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" fill="#E0F2E9" />
  </svg>
);

export const TreeIcon: React.FC<PlantIconProps> = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="45" y="70" width="10" height="25" rx="2" fill="#8B5B2A" />
    <path d="M50,10 L25,60 L75,60 Z" fill="#2E7D32" />
    <path d="M50,25 L30,55 L70,55 Z" fill="#2E7D32" />
    <path d="M50,40 L35,60 L65,60 Z" fill="#2E7D32" />
    <circle cx="35" cy="40" r="4" fill="#E8BBFF" />
    <circle cx="65" cy="45" r="4" fill="#E8BBFF" />
    <circle cx="50" cy="25" r="4" fill="#E8BBFF" />
  </svg>
);
