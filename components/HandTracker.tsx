import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandGestureState } from '../types';

interface HandTrackerProps {
  onGestureUpdate: (state: HandGestureState) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onGestureUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);

  // Initialize MediaPipe
  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        landmarkerRef.current = landmarker;
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load MediaPipe:", err);
      }
    };
    init();
  }, []);

  // Initialize Camera
  useEffect(() => {
    if (!isLoaded || !videoRef.current) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Camera permission denied:", err);
      }
    };

    startCamera();

    return () => {
       // Cleanup if needed
       if (requestRef.current) {
           cancelAnimationFrame(requestRef.current);
       }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const predictWebcam = () => {
    if (!landmarkerRef.current || !videoRef.current) return;
    
    // Process frame
    const startTimeMs = performance.now();
    if (videoRef.current.currentTime > 0) {
        const result = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
        
        // Calculate Gesture Logic
        let pinchStrength = 0;
        let handDistance = 0.5; // Default idle
        let handsDetected = 0;

        if (result.landmarks && result.landmarks.length > 0) {
            handsDetected = result.landmarks.length;

            // 1. Calculate Tension/Pinch for each hand
            let totalTension = 0;
            result.landmarks.forEach(landmarks => {
                // Simple tension: Distance between Wrist (0) and average of tips (4,8,12,16,20)
                // Actually simpler: Distance between Index Tip (8) and Thumb Tip (4) 
                // Normalized by palm scale (Wrist 0 to Middle MCP 9)
                
                const wrist = landmarks[0];
                const thumbTip = landmarks[4];
                const indexTip = landmarks[8];
                const middleMCP = landmarks[9];

                const palmSize = Math.hypot(middleMCP.x - wrist.x, middleMCP.y - wrist.y);
                const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
                
                // If pinchDist is small relative to palmSize, it's a pinch/fist
                // Normalized: < 0.2 is closed, > 0.5 is open
                const openFactor = Math.min(Math.max((pinchDist / palmSize) - 0.1, 0), 1) * 2; 
                // Invert so 1 is tension/closed, 0 is open
                totalTension += (1 - openFactor);
            });
            pinchStrength = totalTension / handsDetected;
            // Clamp
            pinchStrength = Math.min(Math.max(pinchStrength, 0), 1);

            // 2. Calculate Distance Between Hands (if 2 hands)
            if (result.landmarks.length === 2) {
                const hand1Wrist = result.landmarks[0][0];
                const hand2Wrist = result.landmarks[1][0];
                const dist = Math.hypot(hand1Wrist.x - hand2Wrist.x, hand1Wrist.y - hand2Wrist.y);
                // dist is typically 0 to 1 in viewport coords
                handDistance = dist;
            }
        }

        onGestureUpdate({
            pinchStrength,
            handDistance,
            handsDetected
        });
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-xl opacity-80 z-50 pointer-events-none hidden md:block">
        {/* Hidden video element for processing */}
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
        />
        <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
            {isLoaded ? "Tracking Active" : "Loading Model..."}
        </div>
    </div>
  );
};