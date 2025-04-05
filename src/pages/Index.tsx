
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left side with main content */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 wellness-gradient">
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight">
              Mental Health Mirror
            </h1>
            <p className="text-xl text-gray-700">
              Your AI-powered wellness companion on the journey to emotional well-being.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="gap-2 text-lg"
                onClick={() => navigate('/login')}
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg"
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right side with illustration */}
        <div className="hidden md:flex w-1/2 bg-wellness-blue items-center justify-center p-12">
          <div className="relative h-full w-full max-w-lg">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-white rounded-full shadow-xl overflow-hidden">
              <div className="absolute inset-2 bg-gradient-to-br from-wellness-lavender via-white to-wellness-green rounded-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h2 className="text-xl font-medium mb-2">Grow Your Mind</h2>
                    <p className="text-sm text-gray-600">Track your emotional journey</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements for decoration */}
            <div className="absolute top-1/4 right-1/4 w-12 h-12 rounded-full bg-wellness-teal opacity-60 animate-float"></div>
            <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-wellness-purple opacity-40 animate-float" style={{animationDelay: "1s"}}></div>
            <div className="absolute bottom-1/4 right-1/3 w-10 h-10 rounded-full bg-wellness-yellow opacity-50 animate-float" style={{animationDelay: "2s"}}></div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Mental Health Mirror - Your AI Wellness Companion</p>
      </footer>
    </div>
  );
};

export default Index;
