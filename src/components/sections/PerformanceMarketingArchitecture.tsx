'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Server, Activity, BarChart3, Database, Globe, Zap, TrendingUp, Shield, Cloud, Layers, Filter, Target, MousePointer, RefreshCw, ShoppingCart, GitBranch, Play, Pause, Plus, Users, Eye } from 'lucide-react';

const PerformanceMarketingArchitecture = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const animationRef = useRef(null);

  const initialNodes = {
    left: [
      { id: 'visitor', title: 'Website Visitor', icon: Users, x: 20, y: 100, step: 1, desc: 'User lands on website' },
      { id: 'click', title: 'User Click/Action', icon: MousePointer, x: 20, y: 220, step: 2, desc: 'Clicks, form submits, purchases' },
      { id: 'gtm', title: 'GTM Tag Fires', icon: Layers, x: 20, y: 340, step: 3, desc: 'Google Tag Manager triggers' },
      { id: 'consent', title: 'Consent Check', icon: Shield, x: 20, y: 460, step: 4, desc: 'GDPR/CCPA validation' },
      { id: 'pixels', title: 'Client-Side Pixels', icon: Activity, x: 20, y: 580, step: 5, desc: 'Meta/Google pixels fire' },
    ],
    center: [
      { id: 'datalayer', title: 'Data Layer Events', subtitle: 'Structured Event Schema', icon: GitBranch, x: 450, y: 150, step: 6 },
      { id: 'database', title: 'Event Database', subtitle: 'PostgreSQL / MySQL', icon: Database, x: 450, y: 340, step: 7 },
      { id: 'server', title: 'Server-Side Processing', subtitle: 'GTM Server / Node.js', icon: Server, x: 450, y: 530, step: 8 },
    ],
    right: [
      { id: 'capi', title: 'Conversions API', count: 'Meta/TikTok/Snap', icon: Zap, x: 880, y: 100, step: 9 },
      { id: 'ads', title: 'Ads Managers', count: '5 platforms', icon: Target, x: 880, y: 220, step: 10 },
      { id: 'enhanced', title: 'Enhanced Conversions', count: 'Google Ads', icon: TrendingUp, x: 880, y: 340, step: 11 },
      { id: 'ga4', title: 'Google Analytics 4', count: 'Analytics', icon: BarChart3, x: 880, y: 460, step: 12 },
      { id: 'attribution', title: 'Attribution Platform', count: 'ROI Analysis', icon: Filter, x: 880, y: 580, step: 13 },
    ],
  };

  const [nodes, setNodes] = useState(initialNodes);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
    setIsPlaying(false);
  };

  const handleMouseDown = (e, nodeId, column) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging({ id: nodeId, column });
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const container = document.getElementById('diagram-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newX = e.clientX - rect.left - offset.x;
    const newY = e.clientY - rect.top - offset.y;

    setNodes(prev => ({
      ...prev,
      [dragging.column]: prev[dragging.column].map(node =>
        node.id === dragging.id
          ? { ...node, x: Math.max(0, Math.min(newX, rect.width - (dragging.column === 'center' ? 260 : 240))), y: Math.max(0, Math.min(newY, rect.height - (dragging.column === 'center' ? 140 : 80))) }
          : node
      )
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, offset]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= 13) {
            setIsPlaying(false);
            return 13;
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying]);

  const NodeCard = ({ node, column, isActive }) => {
    const Icon = node.icon;
    
    return (
      <div
        onMouseDown={(e) => handleMouseDown(e, node.id, column)}
        style={{
          position: 'absolute',
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: column === 'center' ? '260px' : '240px',
        }}
        className={`bg-white rounded-xl border-2 shadow-md transition-all duration-500 cursor-grab active:cursor-grabbing ${
          isActive 
            ? column === 'center' 
              ? 'border-blue-500 shadow-blue-200 shadow-xl scale-105 z-50 ring-4 ring-blue-100' 
              : 'border-emerald-500 shadow-emerald-200 shadow-xl scale-105 z-50 ring-4 ring-emerald-100'
            : column === 'center'
              ? 'border-blue-200 shadow-sm z-10'
              : 'border-gray-200 shadow-sm z-10'
        }`}
      >
        {column === 'center' ? (
          <div className="p-5 text-center">
            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
              isActive ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg' : 'bg-gradient-to-br from-blue-50 to-blue-100'
            }`}>
              <Icon className={`w-6 h-6 transition-colors ${
                isActive ? 'text-white' : 'text-blue-600'
              }`} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">{node.title}</h3>
            <p className="text-xs text-gray-600 font-medium">{node.subtitle}</p>
            {isActive && (
              <div className="mt-4 flex justify-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 flex items-start gap-4">
            <div className={`p-3 rounded-lg transition-all duration-300 flex-shrink-0 ${
              isActive 
                ? column === 'left' 
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 ring-2 ring-emerald-200' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-200'
                : 'bg-gray-50'
            }`}>
              <Icon className={`w-6 h-6 transition-colors ${
                isActive 
                  ? column === 'left' 
                    ? 'text-emerald-600' 
                    : 'text-blue-600'
                  : 'text-gray-500'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-bold text-gray-900 mb-1.5 ${
                isActive ? 'text-base' : ''
              }`}>{node.title}</h3>
              {node.count && (
                <div className={`text-xs font-medium mt-1 ${
                  isActive ? 'text-gray-700' : 'text-gray-500'
                }`}>{node.count}</div>
              )}
              {node.desc && (
                <div className={`text-xs mt-1.5 leading-relaxed ${
                  isActive ? 'text-gray-700' : 'text-gray-500'
                }`}>{node.desc}</div>
              )}
            </div>
            {isActive && (
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0 mt-1 ${
                column === 'left' ? 'bg-emerald-500' : 'bg-blue-500'
              }`}></div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getNodeCenter = (node, column) => {
    const width = column === 'center' ? 260 : 240;
    const height = column === 'center' ? 140 : 80;
    return { x: node.x + width / 2, y: node.y + height / 2 };
  };

  const ConnectionLine = ({ from, to, fromColumn, toColumn, isActive, isAnimating }) => {
    const start = getNodeCenter(from, fromColumn);
    const end = getNodeCenter(to, toColumn);
    
    const controlX1 = start.x + (end.x - start.x) * 0.3;
    const controlX2 = end.x - (end.x - start.x) * 0.3;
    
    const pathD = `M ${start.x} ${start.y} C ${controlX1} ${start.y}, ${controlX2} ${end.y}, ${end.x} ${end.y}`;
    
    const gradientId = `gradient-${from.id}-${to.id}`;
    
    // Determine stroke color based on columns
    const getStrokeColor = () => {
      if (fromColumn === 'left' && toColumn === 'center') return '#10b981'; // emerald
      if (fromColumn === 'center' && toColumn === 'center') return '#3b82f6'; // blue
      if (fromColumn === 'center' && toColumn === 'right') return '#3b82f6'; // blue
      if (fromColumn === 'left' && toColumn === 'right') return '#10b981'; // emerald
      return '#3b82f6'; // default blue
    };
    
    const strokeColor = getStrokeColor();
    
    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0">
              {isAnimating && (
                <animate
                  attributeName="offset"
                  values="-30%;100%"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
            <stop offset="15%" stopColor={strokeColor} stopOpacity="1">
              {isAnimating && (
                <animate
                  attributeName="offset"
                  values="-15%;115%"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
            <stop offset="30%" stopColor={strokeColor} stopOpacity="0">
              {isAnimating && (
                <animate
                  attributeName="offset"
                  values="0%;130%"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
          </linearGradient>
        </defs>
        
        <path
          d={pathD}
          fill="none"
          stroke={isActive ? strokeColor : "#d1d5db"}
          strokeWidth={isActive ? "3.5" : "2"}
          opacity={isActive ? "0.6" : "0.25"}
          className="transition-all duration-500"
          strokeDasharray={!isActive ? "4,4" : "0"}
        />
        
        {isAnimating && (
          <path
            d={pathD}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}
      </g>
    );
  };

  const connections = [
    // Left to center flow
    { from: 'visitor', to: 'datalayer', fromCol: 'left', toCol: 'center', activeStep: 1 },
    { from: 'click', to: 'datalayer', fromCol: 'left', toCol: 'center', activeStep: 2 },
    { from: 'gtm', to: 'datalayer', fromCol: 'left', toCol: 'center', activeStep: 3 },
    { from: 'consent', to: 'datalayer', fromCol: 'left', toCol: 'center', activeStep: 4 },
    { from: 'pixels', to: 'datalayer', fromCol: 'left', toCol: 'center', activeStep: 5 },
    
    // Data layer to database
    { from: 'datalayer', to: 'database', fromCol: 'center', toCol: 'center', activeStep: 6 },
    
    // Database to server
    { from: 'database', to: 'server', fromCol: 'center', toCol: 'center', activeStep: 7 },
    
    // Server to right side
    { from: 'server', to: 'capi', fromCol: 'center', toCol: 'right', activeStep: 9 },
    { from: 'server', to: 'ads', fromCol: 'center', toCol: 'right', activeStep: 10 },
    { from: 'server', to: 'enhanced', fromCol: 'center', toCol: 'right', activeStep: 11 },
    { from: 'server', to: 'ga4', fromCol: 'center', toCol: 'right', activeStep: 12 },
    { from: 'server', to: 'attribution', fromCol: 'center', toCol: 'right', activeStep: 13 },
    
    // Direct pixel to ads (browser events)
    { from: 'pixels', to: 'ads', fromCol: 'left', toCol: 'right', activeStep: 5 },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-5">
            <span className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-semibold shadow-lg">
              Enterprise Architecture
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            Performance Marketing Architecture
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Complete data flow from browser interactions through server-side processing to ad platform optimization
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-5">
              <button
                onClick={handlePlayPause}
                className={`flex items-center gap-2.5 px-7 py-3.5 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlaying ? 'Pause' : 'Play Journey'}</span>
              </button>
              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 font-medium mb-0.5">Current Step</div>
                <div className="text-gray-800 font-bold text-xl">
                  <span className="text-blue-600">{currentStep}</span> / 13
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
              >
                ← Previous
              </button>
              <button
                onClick={() => handleStepChange(Math.min(13, currentStep + 1))}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
              >
                Next →
              </button>
              <button
                onClick={() => {
                  handleStepChange(0);
                  setNodes(initialNodes);
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
            <div 
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 h-full transition-all duration-500 rounded-full shadow-sm"
              style={{ width: `${(currentStep / 13) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Diagram */}
        <div id="diagram-container" className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl border border-gray-200 relative overflow-hidden" style={{ height: '750px' }}>
          {/* Three Vertical Lanes - Background Containers */}
          <div className="absolute inset-0 flex">
            {/* Left Lane - Client / Browser */}
            <div className="w-[300px] border-r-2 border-dashed border-emerald-200/40 bg-gradient-to-b from-emerald-50/25 to-transparent"></div>
            
            {/* Center Lane - Data Infrastructure */}
            <div className="flex-1 border-x-2 border-dashed border-blue-200/50 bg-gradient-to-b from-blue-50/35 to-transparent relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/15 to-transparent"></div>
            </div>
            
            {/* Right Lane - Ad Platforms */}
            <div className="w-[300px] border-l-2 border-dashed border-blue-200/40 bg-gradient-to-b from-blue-50/25 to-transparent"></div>
          </div>

          {/* Column Headers with Enhanced Styling */}
          <div className="absolute left-6 top-4 z-20">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-emerald-200">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Client / Browser</h3>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">User Actions & Events</p>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 top-4 z-20">
            <div className="bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-lg shadow-md border-2 border-blue-300">
              <div className="flex items-center gap-2 justify-center">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Tracking & Data Infrastructure</h3>
              </div>
              <p className="text-[10px] text-gray-600 mt-0.5 text-center font-medium">Core System</p>
            </div>
          </div>

          <div className="absolute right-6 top-4 z-20">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-blue-200">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Ad Platforms & Optimization</h3>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">Outputs & ML</p>
            </div>
          </div>

          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            {connections.map((conn) => {
              const fromNode = nodes[conn.fromCol].find(n => n.id === conn.from);
              const toNode = nodes[conn.toCol].find(n => n.id === conn.to);
              
              if (!fromNode || !toNode) return null;
              
              return (
                <ConnectionLine
                  key={`${conn.from}-${conn.to}`}
                  from={fromNode}
                  to={toNode}
                  fromColumn={conn.fromCol}
                  toColumn={conn.toCol}
                  isActive={currentStep >= conn.activeStep}
                  isAnimating={currentStep === conn.activeStep && isPlaying}
                />
              );
            })}
          </svg>

          {/* Render all nodes */}
          {Object.entries(nodes).map(([column, nodeList]) =>
            nodeList.map(node => (
              <NodeCard
                key={node.id}
                node={node}
                column={column}
                isActive={currentStep >= node.step}
              />
            ))
          )}

          {/* Drag instruction */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-xs text-gray-500 flex items-center gap-2">
            <MousePointer className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">Drag nodes to customize layout</span>
          </div>
        </div>

        {/* Journey Steps */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-4 gap-5">
            <div className="bg-white rounded-xl shadow-md p-6 border border-emerald-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="text-base font-bold text-gray-900">1. User Entry</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Visitor lands on website, interacts, clicks, and triggers events through GTM with consent validation.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-base font-bold text-gray-900">2. Data Collection</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Events are structured in data layer, stored in database for historical analysis and compliance.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-300 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-blue-800" />
                </div>
                <h3 className="text-base font-bold text-gray-900">3. Server Processing</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Server-side GTM processes events, enriches data, and sends to CAPI endpoints bypassing ad blockers.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-base font-bold text-gray-900">4. Optimization</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ad platforms use server events for ML optimization, attribution analysis tracks ROI across channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMarketingArchitecture;
