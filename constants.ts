// Helper to create a flat array of [x,y,z]
export const generateHeartPoints = (count: number): Float32Array => {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Heart formula
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const r = 1; 
    
    // A classic parametric heart
    // x = 16sin^3(t)
    // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
    // Extended to 3D roughly
    const t = Math.random() * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const z = (Math.random() - 0.5) * 5; // Thickness

    // Scale down
    points[i * 3] = x * 0.1;
    points[i * 3 + 1] = y * 0.1;
    points[i * 3 + 2] = z * 0.5;
  }
  return points;
};

export const generateSpherePoints = (count: number): Float32Array => {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    points[i * 3 + 2] = r * Math.cos(phi);
  }
  return points;
};

export const generateSaturnPoints = (count: number): Float32Array => {
  const points = new Float32Array(count * 3);
  const planetRatio = 0.4;
  const ringStart = count * planetRatio;
  
  // Planet
  for (let i = 0; i < ringStart; i++) {
    const r = 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    points[i * 3 + 2] = r * Math.cos(phi);
  }

  // Rings
  for (let i = ringStart; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Ring radius between 2.2 and 4
    const r = 2.2 + Math.random() * 2.5; 
    points[i * 3] = r * Math.cos(angle);
    points[i * 3 + 1] = (Math.random() - 0.5) * 0.1; // Thin Y
    points[i * 3 + 2] = r * Math.sin(angle);
  }
  return points;
};

export const generateFlowerPoints = (count: number): Float32Array => {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI;
    // Rose-like polar function
    const k = 4;
    const r = 2 * Math.cos(k * u) + 1;
    
    points[i * 3] = r * Math.cos(u) * Math.sin(v);
    points[i * 3 + 1] = r * Math.cos(v); 
    points[i * 3 + 2] = r * Math.sin(u) * Math.sin(v);
  }
  return points;
};

// Abstract procedural Buddha (stacked spheres approximation)
export const generateBuddhaPoints = (count: number): Float32Array => {
    const points = new Float32Array(count * 3);
    // Base, Torso, Head
    for (let i = 0; i < count; i++) {
      const section = Math.random();
      let cx = 0, cy = 0, cz = 0, r = 1;
      
      if (section < 0.4) {
          // Legs/Base (Wide ellipsoid)
          cy = -1.5;
          r = 1.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          // Squashed sphere
          points[i*3] = r * Math.sin(phi) * Math.cos(theta) * 1.2;
          points[i*3+1] = cy + r * Math.sin(phi) * Math.sin(theta) * 0.6;
          points[i*3+2] = r * Math.cos(phi);
      } else if (section < 0.8) {
          // Torso
          cy = 0;
          r = 1.0;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          points[i*3] = r * Math.sin(phi) * Math.cos(theta);
          points[i*3+1] = cy + r * Math.sin(phi) * Math.sin(theta);
          points[i*3+2] = r * Math.cos(phi) * 0.8;
      } else {
          // Head
          cy = 1.4;
          r = 0.6;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          points[i*3] = r * Math.sin(phi) * Math.cos(theta);
          points[i*3+1] = cy + r * Math.sin(phi) * Math.sin(theta);
          points[i*3+2] = r * Math.cos(phi);
      }
    }
    return points;
};

export const generateFireworksPoints = (count: number): Float32Array => {
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        // Random spherical dispersion
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.random() * 4;
        points[i*3] = r * Math.sin(phi) * Math.cos(theta);
        points[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        points[i*3+2] = r * Math.cos(phi);
    }
    return points;
}
