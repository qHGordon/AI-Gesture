import React, { useState } from 'react';
import { AppState, HandGestureState, ShapeType } from '../types';
import { Sparkles, Hand, Palette, Bot, Activity } from 'lucide-react';
import { clsx } from 'clsx';

interface UIProps {
  appState: AppState;
  gestureState: HandGestureState;
  onShapeChange: (shape: ShapeType) => void;
  onColorChange: (color: string) => void;
  onGenerateShape: (prompt: string) => void;
}

export const UI: React.FC<UIProps> = ({ 
    appState, 
    gestureState, 
    onShapeChange, 
    onColorChange,
    onGenerateShape 
}) => {
  const [prompt, setPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  const handleSubmitGen = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
        onGenerateShape(prompt);
        setPrompt('');
        setShowAiInput(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between p-6 pointer-events-none">
      
      {/* Header / Status */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            ZenParticles
            </h1>
            <p className="text-xs text-gray-400 mt-1">
                Gemini AI & Vision Powered
            </p>
        </div>
        
        {/* Gesture Indicators */}
        <div className="flex flex-col items-end gap-2">
            <div className={clsx(
                "flex items-center gap-2 px-3 py-1 rounded-full border transition-colors",
                gestureState.handsDetected > 0 ? "bg-green-900/50 border-green-500 text-green-200" : "bg-red-900/50 border-red-500 text-red-200"
            )}>
                <Hand size={14} />
                <span className="text-xs font-mono">
                    {gestureState.handsDetected > 0 ? `${gestureState.handsDetected} HANDS DETECTED` : "NO HANDS"}
                </span>
            </div>
            {gestureState.handsDetected > 0 && (
                <div className="flex flex-col gap-1 items-end text-xs text-gray-300 font-mono bg-black/40 p-2 rounded">
                    <div>Pinch: {(gestureState.pinchStrength * 100).toFixed(0)}%</div>
                    <div>Span: {(gestureState.handDistance * 100).toFixed(0)}%</div>
                </div>
            )}
        </div>
      </div>

      {/* Main Controls Bottom */}
      <div className="pointer-events-auto flex flex-col gap-4 max-w-2xl mx-auto w-full">
        
        {/* AI Generator Panel */}
        {showAiInput && (
            <form onSubmit={handleSubmitGen} className="bg-gray-900/90 border border-purple-500/50 p-4 rounded-xl shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe a 3D shape (e.g. 'A spiral galaxy', 'A flying bird')..."
                        className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                    <button 
                        type="submit"
                        disabled={appState.isGenerating}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {appState.isGenerating ? "Generating..." : "Create"}
                    </button>
                </div>
            </form>
        )}

        {/* Toolbar */}
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 p-4 rounded-2xl flex flex-wrap items-center gap-6 shadow-2xl justify-center">
            
            {/* Shape Selectors */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {Object.values(ShapeType).filter(s => s !== ShapeType.CUSTOM).map((shape) => (
                    <button
                        key={shape}
                        onClick={() => onShapeChange(shape)}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                            appState.currentShape === shape 
                                ? "bg-white text-black shadow-lg scale-105" 
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        )}
                    >
                        {shape}
                    </button>
                ))}
            </div>

            <div className="w-px h-8 bg-gray-700 hidden md:block" />

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowAiInput(!showAiInput)}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                        showAiInput || appState.currentShape === ShapeType.CUSTOM 
                            ? "bg-purple-900/50 border-purple-500 text-purple-200" 
                            : "bg-gray-800 border-transparent text-gray-300 hover:bg-gray-700"
                    )}
                >
                    <Bot size={18} />
                    <span className="text-sm">AI Shape</span>
                </button>

                <div className="relative group">
                    <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer">
                        <Palette size={18} className="text-gray-300" />
                        <input 
                            type="color" 
                            value={appState.particleColor}
                            onChange={(e) => onColorChange(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                        />
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
