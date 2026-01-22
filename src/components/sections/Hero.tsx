'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle } from 'lucide-react';

function MagneticButton({ children, distance = 0.3 }) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const currentPos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let rafId = null;
    
    const animate = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      
      currentPos.current.x += dx * 0.1;
      currentPos.current.y += dy * 0.1;
      
      setPosition({
        x: currentPos.current.x,
        y: currentPos.current.y
      });
      
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        rafId = requestAnimationFrame(animate);
      }
    };
    
    const calculateDistance = (e) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        if (isHovered) {
          targetPos.current = {
            x: distanceX * distance,
            y: distanceY * distance
          };
        } else {
          targetPos.current = { x: 0, y: 0 };
        }
        
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      }
    };

    document.addEventListener('mousemove', calculateDistance);
    return () => {
      document.removeEventListener('mousemove', calculateDistance);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isHovered, distance]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        willChange: 'transform'
      }}>
      {children}
    </div>
  );
}

export default function Hero() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsLoading(false);
            setIsCompleted(true);
            setTimeout(() => {
              setIsCompleted(false);
              setProgress(0);
            }, 2000);
            return 100;
          }
          return prev + 1;
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleClick = () => {
    if (!isCompleted) {
      setIsLoading(true);
      setProgress(0);
    }
  };

  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold text-black mb-5 sm:mb-6 md:mb-7 lg:mb-8 leading-[1.2] tracking-tight">
            Here to be Your{' '}
            <span className="italic font-bold">Performance</span> Focused{' '}
            <span className="italic font-bold">Partner</span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            With Zyntrex, you can set company-wide goals, strategic plans, and get work done on a single monthly plan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <button
              onClick={handleClick}
              disabled={isLoading || isCompleted}
              className="relative bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 text-white font-medium px-6 sm:px-8 py-3 rounded-full flex items-center gap-2 transition-all duration-200 w-full sm:w-auto min-w-[180px] justify-center overflow-hidden"
            >
              {/* Progress bar background */}
              {isLoading && (
                <div 
                  className="absolute left-0 top-0 h-full bg-blue-400 transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              )}
              
              {/* Button content */}
              <div className="relative z-10 flex items-center gap-2">
                {isCompleted ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Downloaded</span>
                  </>
                ) : isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{progress}%</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Download</span>
                  </>
                )}
              </div>
            </button>
            <MagneticButton distance={0.3}>
              <button className="bg-white border border-black text-black px-6 sm:px-8 py-3 rounded-full font-medium text-sm sm:text-base w-full sm:w-auto min-w-[180px] flex items-center justify-center hover:bg-gray-50 transition-colors">
                See Pricing &gt;
              </button>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
