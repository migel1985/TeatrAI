import React from 'react';

interface TheaterCurtainProps {
  children: React.ReactNode;
}

const TheaterCurtain: React.FC<TheaterCurtainProps> = ({ children }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Top valance/pelmet */}
      <div className="absolute -top-4 left-0 right-0 h-16 z-20">
        <svg viewBox="0 0 400 40" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="valanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(0, 70%, 35%)" />
              <stop offset="50%" stopColor="hsl(0, 65%, 30%)" />
              <stop offset="100%" stopColor="hsl(0, 70%, 25%)" />
            </linearGradient>
            <linearGradient id="goldTrim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 80%, 60%)" />
              <stop offset="50%" stopColor="hsl(45, 80%, 50%)" />
              <stop offset="100%" stopColor="hsl(45, 70%, 40%)" />
            </linearGradient>
          </defs>
          {/* Swag pattern */}
          <path 
            d="M0,0 L400,0 L400,25 Q350,40 300,25 Q250,10 200,25 Q150,40 100,25 Q50,10 0,25 Z" 
            fill="url(#valanceGradient)"
          />
          {/* Gold fringe */}
          <path 
            d="M0,25 Q50,10 100,25 Q150,40 200,25 Q250,10 300,25 Q350,40 400,25 L400,30 Q350,45 300,30 Q250,15 200,30 Q150,45 100,30 Q50,15 0,30 Z" 
            fill="url(#goldTrim)"
          />
        </svg>
      </div>

      {/* Left curtain */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10">
        <svg viewBox="0 0 80 400" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="leftCurtainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 70%, 25%)" />
              <stop offset="30%" stopColor="hsl(0, 65%, 35%)" />
              <stop offset="60%" stopColor="hsl(0, 70%, 40%)" />
              <stop offset="100%" stopColor="hsl(0, 65%, 30%)" />
            </linearGradient>
          </defs>
          {/* Gathered curtain effect */}
          <path 
            d="M80,0 Q60,50 70,100 Q80,150 65,200 Q50,250 60,300 Q70,350 55,400 L0,400 L0,0 Z" 
            fill="url(#leftCurtainGradient)"
          />
          {/* Curtain folds */}
          <path 
            d="M70,0 Q55,100 65,200 Q75,300 60,400" 
            stroke="hsl(0, 70%, 20%)" 
            strokeWidth="2" 
            fill="none"
            opacity="0.5"
          />
          <path 
            d="M50,0 Q35,100 45,200 Q55,300 40,400" 
            stroke="hsl(0, 70%, 20%)" 
            strokeWidth="1.5" 
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Right curtain */}
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10">
        <svg viewBox="0 0 80 400" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="rightCurtainGradient" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 70%, 25%)" />
              <stop offset="30%" stopColor="hsl(0, 65%, 35%)" />
              <stop offset="60%" stopColor="hsl(0, 70%, 40%)" />
              <stop offset="100%" stopColor="hsl(0, 65%, 30%)" />
            </linearGradient>
          </defs>
          {/* Gathered curtain effect */}
          <path 
            d="M0,0 Q20,50 10,100 Q0,150 15,200 Q30,250 20,300 Q10,350 25,400 L80,400 L80,0 Z" 
            fill="url(#rightCurtainGradient)"
          />
          {/* Curtain folds */}
          <path 
            d="M10,0 Q25,100 15,200 Q5,300 20,400" 
            stroke="hsl(0, 70%, 20%)" 
            strokeWidth="2" 
            fill="none"
            opacity="0.5"
          />
          <path 
            d="M30,0 Q45,100 35,200 Q25,300 40,400" 
            stroke="hsl(0, 70%, 20%)" 
            strokeWidth="1.5" 
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Gold tie-backs */}
      <div className="absolute left-16 top-12 w-6 h-6 z-20">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-gold-light to-gold shadow-lg border-2 border-gold" />
      </div>
      <div className="absolute right-16 top-12 w-6 h-6 z-20">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-gold-light to-gold shadow-lg border-2 border-gold" />
      </div>

      {/* Stage floor shadow */}
      <div className="absolute -bottom-2 left-16 right-16 h-4 bg-gradient-to-t from-background to-transparent z-0" />

      {/* Content area (stage) */}
      <div className="relative z-0 mx-16 my-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default TheaterCurtain;
