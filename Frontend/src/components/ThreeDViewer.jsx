import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Preload } from '@react-three/drei';

function Model({ url }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return <primitive ref={ref} object={scene} scale={1.5} position={[0, -1, 0]} />;
}

function Fallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-500 font-medium p-8">
      <div className="w-20 h-20 border-4 border-slate-200 border-t-slate-400 rounded-full animate-spin mb-4"></div>
      <p>Loading 3D Model...</p>
    </div>
  );
}

function ThreeDViewer({ modelUrl = '/public/models/sample.glb', fallbackImage = '/images/placeholder-design.jpg' }) {
  return (
    <div className="w-full h-[500px] rounded-4xl overflow-hidden shadow-2xl border border-slate-200 relative group bg-slate-50">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={<Fallback />}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model url={modelUrl} />
          <OrbitControls />
          <Preload all />
        </Suspense>
      </Canvas>
      <img 
        src={fallbackImage} 
        alt="2D Preview"
        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
      />
    </div>
  );
}

export default ThreeDViewer;

