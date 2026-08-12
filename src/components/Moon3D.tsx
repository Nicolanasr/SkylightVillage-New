"use client";

import React, { useRef, Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

const MOON_COLOR_MAP = "/textures/moon.jpg";
const MOON_BUMP_MAP  = "/textures/moon_bump.jpg";

// ── GLSL Shaders ──────────────────────────────────────────────────────────────
// The sun direction rotates in WORLD space based on the phase value.
// Because we use world-space normals, the terminator stays fixed relative
// to the sun regardless of how much the mesh auto-rotates.
//
// phase=0.00  New Moon   → sun at world -Z (behind moon, viewer sees dark side)
// phase=0.25  1st Qtr   → sun at world +X (right half lit)
// phase=0.50  Full Moon  → sun at world +Z (in front, viewer sees fully lit)
// phase=0.75  Last Qtr  → sun at world -X (left half lit)

const VERT_SHADER = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    // Normal in world space so the terminator is independent of mesh rotation
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG_SHADER = /* glsl */`
  #define PI 3.14159265358979

  uniform float     phase;
  uniform sampler2D moonTexture;
  uniform sampler2D bumpTexture;

  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vec4 texColor = texture2D(moonTexture, vUv);

    // Sun direction in world space (rotates around Y with phase)
    float angle = phase * 2.0 * PI;
    vec3 sunDir = normalize(vec3(sin(angle), 0.0, -cos(angle)));

    // Diffuse lighting from the sun
    float NdotL  = dot(normalize(vWorldNormal), sunDir);
    float lit    = max(0.0, NdotL);

    // Soft terminator falloff (adds a gentle penumbra instead of hard cutoff)
    float terminator = smoothstep(-0.04, 0.04, NdotL);

    // Very faint earthshine on the dark side — enough to reveal surface texture
    // Real earthshine is ~2% of full brightness; we use ~9% for visual clarity
    vec3 earthshine = vec3(0.07, 0.08, 0.10);

    vec3 color = texColor.rgb * (earthshine + terminator * 0.98);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ── MoonMesh ──────────────────────────────────────────────────────────────────
interface MoonMeshProps {
  phaseValue: number;
  dragging:  React.MutableRefObject<boolean>;
  dragDelta: React.MutableRefObject<number>;
}

function MoonMesh({ phaseValue, dragging, dragDelta }: MoonMeshProps) {
  const meshRef     = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const [colorMap, bumpMap] = useLoader(TextureLoader, [MOON_COLOR_MAP, MOON_BUMP_MAP]);

  // Build uniforms once; update phase imperatively so we avoid recreating the object
  const uniforms = useMemo(() => ({
    phase:       { value: phaseValue },
    moonTexture: { value: colorMap   },
    bumpTexture: { value: bumpMap    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [colorMap, bumpMap]);

  // Keep the phase uniform in sync when it changes (e.g. user switches day)
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.phase.value = phaseValue;
    }
  }, [phaseValue]);

  // Auto-rotate; respect drag input
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (dragging.current) {
      meshRef.current.rotation.y += dragDelta.current * 0.005;
      dragDelta.current *= 0.85;
    } else {
      meshRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERT_SHADER}
        fragmentShader={FRAG_SHADER}
      />
    </mesh>
  );
}

// ── Loading placeholder ───────────────────────────────────────────────────────
function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial color="#1e293b" roughness={1} />
    </mesh>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
interface Moon3DProps {
  phaseValue: number;
  className?: string;
}

export default function Moon3D({ phaseValue, className = "" }: Moon3DProps) {
  const dragging  = useRef(false);
  const dragDelta = useRef(0);
  const lastX     = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    lastX.current    = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    dragDelta.current = e.clientX - lastX.current;
    lastX.current     = e.clientX;
  }
  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div
      className={`cursor-grab active:cursor-grabbing ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      title="Drag to rotate the Moon"
    >
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Small ambient so the Loader placeholder is visible */}
        <ambientLight intensity={0.1} />

        <Suspense fallback={<Loader />}>
          <MoonMesh
            phaseValue={phaseValue}
            dragging={dragging}
            dragDelta={dragDelta}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
