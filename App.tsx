import React, { useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { HandTracker } from './components/HandTracker';
import { AppState, HandGestureState, ShapeType } from './types';
import { generateShape } from './services/geminiService';

const App: React.FC = () => {
  // Application State
  const [appState, setAppState] = useState<AppState>({
    currentShape: ShapeType.HEART,
    particleColor: '#00ffff',
    particleCount: 3000,
    isGenerating: false,
    customPoints: null,
  });

  // Hand Gesture State (Refs are used in Scene for performance, State for UI feedback)
  const [gestureState, setGestureState] = useState<HandGestureState>({
    pinchStrength: 0, // 0 (open) to 1 (closed/tense)
    handDistance: 0.5, // Normalized distance between hands
    handsDetected: 0,
  });

  // Hand gesture handler from the tracker
  const handleGestureUpdate = (gesture: HandGestureState) => {
    setGestureState(gesture);
  };

  const handleShapeChange = (shape: ShapeType) => {
    setAppState(prev => ({ ...prev, currentShape: shape, customPoints: null }));
  };

  const handleColorChange = (color: string) => {
    setAppState(prev => ({ ...prev, particleColor: color }));
  };

  const handleGeminiGeneration = async (prompt: string) => {
    try {
      setAppState(prev => ({ ...prev, isGenerating: true }));
      const points = await generateShape(prompt);
      setAppState(prev => ({
        ...prev,
        currentShape: ShapeType.CUSTOM,
        customPoints: points,
        isGenerating: false
      }));
    } catch (error) {
      console.error("Failed to generate shape:", error);
      setAppState(prev => ({ ...prev, isGenerating: false }));
      alert("AI Generation failed. Please try again.");
    }
  };

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene
          appState={appState}
          gestureState={gestureState}
        />
      </div>

      {/* Vision Processing Layer (Hidden or Small Video Preview) */}
      <HandTracker onGestureUpdate={handleGestureUpdate} />

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <UI
          appState={appState}
          gestureState={gestureState}
          onShapeChange={handleShapeChange}
          onColorChange={handleColorChange}
          onGenerateShape={handleGeminiGeneration}
        />
      </div>
    </div>
  );
};

export default App;