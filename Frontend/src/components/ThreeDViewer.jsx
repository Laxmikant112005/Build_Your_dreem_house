import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Preload,
  useGLTF,
  Center,
  Bounds,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

/**
 * 3D Model
 */
function Model({ url, autoRotate = false }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();

  useEffect(() => {
    if (!scene) return;

    // Enable shadows
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

/**
 * Loading UI
 * This is outside the Canvas, so it can use normal HTML.
 */
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin mb-4" />
      <p className="text-slate-600 font-medium">
        Loading 3D Model...
      </p>
    </div>
  );
}

/**
 * Error fallback
 */
function ErrorOverlay({ error }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <span className="text-red-600 text-2xl">!</span>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        Unable to load 3D model
      </h3>

      <p className="text-sm text-slate-500 max-w-md">
        Check that the GLB/GLTF file exists and that the model URL is correct.
      </p>

      {error && (
        <p className="mt-3 text-xs text-red-500 max-w-md break-all">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Actual Canvas content
 */
function ViewerContent({ modelUrl, autoRotate }) {
  return (
    <>
      <ambientLight intensity={1.2} />

      <directionalLight
        position={[10, 10, 10]}
        intensity={2}
        castShadow
      />

      <directionalLight
        position={[-10, 5, -10]}
        intensity={1}
      />

      <Environment preset="city" />

      <Bounds fit clip observe margin={1.2}>
        <Model
          url={modelUrl}
          autoRotate={autoRotate}
        />
      </Bounds>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={1}
        maxDistance={100}
        enablePan
        enableZoom
        enableRotate
      />

      <Preload all />
    </>
  );
}

/**
 * Main 3D Viewer
 */
function ThreeDViewer({
  modelUrl = "/models/sample.glb",
  fallbackImage = "/images/placeholder-design.jpg",
  autoRotate = false,
}) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(modelUrl, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Model file not found: ${response.status} ${response.statusText}`
          );
        }
      })
      .catch((err) => {
        console.error("3D model URL error:", err);
        setError(err.message);
      });
  }, [modelUrl]);

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50">
      {/* 2D fallback image */}
      {error && (
        <img
          src={fallbackImage}
          alt="2D Preview"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Loading overlay */}
      {loading && !error && <LoadingOverlay />}

      {/* 3D Canvas */}
      {!error && (
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{
            position: [5, 4, 7],
            fov: 45,
            near: 0.1,
            far: 1000,
          }}
          onCreated={() => {
            setLoading(false);
          }}
        >
          <color attach="background" args={["#f8fafc"]} />

          <Suspense fallback={null}>
            <ViewerContent
              modelUrl={modelUrl}
              autoRotate={autoRotate}
            />
          </Suspense>
        </Canvas>
      )}

      {/* Error message */}
      {error && <ErrorOverlay error={error} />}

      {/* Viewer controls label */}
      {!error && !loading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full pointer-events-none">
          🖱️ Drag to rotate • Scroll to zoom • Right-click to pan
        </div>
      )}
    </div>
  );
}

export default ThreeDViewer;