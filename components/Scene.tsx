import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { AppState, HandGestureState, ShapeType } from '../types';
import { 
    generateHeartPoints, 
    generateSpherePoints, 
    generateSaturnPoints, 
    generateFlowerPoints,
    generateBuddhaPoints,
    generateFireworksPoints
} from '../constants';

// Declare JSX intrinsic elements for React Three Fiber to fix TypeScript errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      pointsMaterial: any;
      ambientLight: any;
      color: any;
    }
  }
}

interface SceneProps {
  appState: AppState;
  gestureState: HandGestureState;
}

const Particles: React.FC<{ appState: AppState, gestureState: HandGestureState }> = ({ appState, gestureState }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  // Memoize target positions based on shape selection
  const targetPositions = useMemo(() => {
    const count = appState.particleCount;
    switch (appState.currentShape) {
        case ShapeType.HEART: return generateHeartPoints(count);
        case ShapeType.SATURN: return generateSaturnPoints(count);
        case ShapeType.FLOWER: return generateFlowerPoints(count);
        case ShapeType.BUDDHA: return generateBuddhaPoints(count);
        case ShapeType.FIREWORKS: return generateFireworksPoints(count);
        case ShapeType.CUSTOM: 
            return appState.customPoints ? new Float32Array(appState.customPoints) : generateSpherePoints(count);
        case ShapeType.SPHERE:
        default: return generateSpherePoints(count);
    }
  }, [appState.currentShape, appState.particleCount, appState.customPoints]);

  // Current positions buffer
  const currentPositions = useMemo(() => new Float32Array(appState.particleCount * 3), [appState.particleCount]);

  useEffect(() => {
    // Reset positions to 0,0,0 or just let them lerp.
    // For smoother transition, we don't reset currentPositions, we just lerp to new targets in useFrame
  }, [targetPositions]);

  useFrame((state, delta) => {
    if (!geometryRef.current) return;

    const { pinchStrength, handDistance, handsDetected } = gestureState;
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    
    // Dynamic factors
    // If pinchStrength is high (fist), condense particles (scale down jitter)
    // If handDistance is high, expand global scale
    
    // Default breathe
    const time = state.clock.getElapsedTime();
    const breathe = Math.sin(time) * 0.1 + 1; 

    // Interaction multipliers
    const expansionFactor = handsDetected > 0 ? (0.5 + handDistance * 2.0) : breathe;
    const tensionFactor = handsDetected > 0 ? pinchStrength : 0; // 0 to 1

    // Lerp speed
    const lerpSpeed = 4.0 * delta;

    for (let i = 0; i < appState.particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        let tx = targetPositions[ix] || 0;
        let ty = targetPositions[iy] || 0;
        let tz = targetPositions[iz] || 0;

        // Apply Expansion (Hand Distance)
        tx *= expansionFactor;
        ty *= expansionFactor;
        tz *= expansionFactor;

        // Apply Tension (Pinch) -> Add jitter/noise or condense
        // Let's make tension = condense heavily to center + high vibration
        if (tensionFactor > 0.1) {
             const pullToCenter = 1 - (tensionFactor * 0.8);
             tx *= pullToCenter;
             ty *= pullToCenter;
             tz *= pullToCenter;
             
             // Jitter
             tx += (Math.random() - 0.5) * tensionFactor * 0.5;
             ty += (Math.random() - 0.5) * tensionFactor * 0.5;
             tz += (Math.random() - 0.5) * tensionFactor * 0.5;
        }

        // Standard Fireworks Animation Rotation if needed
        if (appState.currentShape === ShapeType.FIREWORKS) {
            // constantly expand? No, stick to static shape for now to keep code clean
        }

        // Interpolate current position to target
        positions[ix] += (tx - positions[ix]) * lerpSpeed;
        positions[iy] += (ty - positions[iy]) * lerpSpeed;
        positions[iz] += (tz - positions[iz]) * lerpSpeed;
    }

    geometryRef.current.attributes.position.needsUpdate = true;
    
    if (pointsRef.current) {
        // Slowly rotate the whole system
        pointsRef.current.rotation.y += 0.001 + (tensionFactor * 0.05);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={currentPositions.length / 3}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={appState.particleColor}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const Scene: React.FC<SceneProps> = (props) => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.5} />
      <Particles {...props} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};