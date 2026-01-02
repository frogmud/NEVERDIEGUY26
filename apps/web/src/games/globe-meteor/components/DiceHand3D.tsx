/**
 * DiceHand3D - 3D polyhedral dice selector for globe meteor
 *
 * Renders actual 3D dice shapes (d4=tetrahedron, d6=cube, etc.)
 * that can be selected Balatro-style. Selected dice lift and glow.
 *
 * NEVER DIE GUY
 */

import React, { useRef, useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  TetrahedronGeometry,
  OctahedronGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  BoxGeometry,
} from 'three';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

interface DiceType {
  sides: number;
  label: string;
  color: string;
}

interface DiceHand3DProps {
  availableDice: DiceType[];
  selectedDice: DiceType[];
  maxDice: number;
  onToggleDice: (dice: DiceType) => void;
  disabled?: boolean;
}

/**
 * Get the appropriate geometry for each die type
 */
function getDieGeometry(sides: number): THREE.BufferGeometry {
  switch (sides) {
    case 4:
      return new TetrahedronGeometry(0.5);
    case 6:
      return new BoxGeometry(0.7, 0.7, 0.7);
    case 8:
      return new OctahedronGeometry(0.5);
    case 10:
      // D10 uses a modified geometry - we'll use a pentagonal shape
      return new DodecahedronGeometry(0.45);
    case 12:
      return new DodecahedronGeometry(0.5);
    case 20:
      return new IcosahedronGeometry(0.5);
    default:
      return new IcosahedronGeometry(0.5);
  }
}

/**
 * Individual 3D die component
 */
function Die3D({
  dice,
  isSelected,
  canSelect,
  onClick,
  position,
}: {
  dice: DiceType;
  isSelected: boolean;
  canSelect: boolean;
  onClick: () => void;
  position: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animate rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle idle rotation
      meshRef.current.rotation.y += delta * (isSelected ? 0.8 : 0.3);
      meshRef.current.rotation.x += delta * (isSelected ? 0.4 : 0.15);

      // Hover effect - scale up slightly
      const targetScale = hovered && canSelect ? 1.15 : isSelected ? 1.1 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const geometry = getDieGeometry(dice.sides);

  // Y position lifts when selected
  const yOffset = isSelected ? 0.4 : hovered && canSelect ? 0.15 : 0;

  return (
    <group position={[position[0], position[1] + yOffset, position[2]]}>
      <Float
        speed={isSelected ? 4 : 2}
        rotationIntensity={isSelected ? 0.3 : 0.1}
        floatIntensity={isSelected ? 0.3 : 0.1}
      >
        <mesh
          ref={meshRef}
          geometry={geometry}
          onClick={(e) => {
            e.stopPropagation();
            if (canSelect) onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = canSelect ? 'pointer' : 'not-allowed';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <meshStandardMaterial
            color={dice.color}
            emissive={dice.color}
            emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0.1}
            metalness={0.3}
            roughness={0.4}
            transparent={!canSelect && !isSelected}
            opacity={!canSelect && !isSelected ? 0.4 : 1}
          />
        </mesh>

        {/* Die label floating above */}
        <Text
          position={[0, 0.7, 0]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {dice.label.toUpperCase()}
        </Text>

        {/* Selection ring */}
        {isSelected && (
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} />
          </mesh>
        )}
      </Float>

      {/* Glow effect for selected dice */}
      {isSelected && (
        <pointLight
          position={[0, 0, 0]}
          color={dice.color}
          intensity={2}
          distance={3}
        />
      )}
    </group>
  );
}

/**
 * DiceHand3D Component
 *
 * Renders a row of 3D polyhedral dice at the bottom of the screen.
 */
export function DiceHand3D({
  availableDice,
  selectedDice,
  maxDice,
  onToggleDice,
  disabled = false,
}: DiceHand3DProps) {
  const slotsRemaining = maxDice - selectedDice.length;
  const isMaxed = slotsRemaining === 0;

  // Calculate positions for dice spread
  const spacing = 1.4;
  const startX = -((availableDice.length - 1) * spacing) / 2;

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pb: 1,
        width: '100%',
        maxWidth: 700,
      }}
    >
      {/* Selection info */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 0.5,
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <Chip
          label={`${selectedDice.length}/${maxDice} DICE`}
          size="small"
          color={isMaxed ? 'secondary' : 'default'}
          sx={{
            fontWeight: 700,
            backgroundColor: isMaxed ? '#00e5ff' : 'rgba(0,0,0,0.7)',
            color: isMaxed ? '#000' : '#fff',
          }}
        />
        {selectedDice.length > 0 && (
          <Chip
            label={`${selectedDice.length}-${selectedDice.reduce(
              (sum, d) => sum + d.sides,
              0
            )} meteors`}
            size="small"
            sx={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          />
        )}
      </Box>

      {/* 3D Canvas for dice */}
      <Box
        sx={{
          width: '100%',
          height: 140,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Canvas
          camera={{ position: [0, 1.5, 5], fov: 40 }}
          style={{ background: 'transparent' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, 3, -5]} intensity={0.4} />

          {/* Dice */}
          {availableDice.map((dice, index) => {
            const isSelected = selectedDice.some((d) => d.label === dice.label);
            const canSelect = !disabled && (isSelected || !isMaxed);

            return (
              <Die3D
                key={dice.label}
                dice={dice}
                isSelected={isSelected}
                canSelect={canSelect}
                onClick={() => onToggleDice(dice)}
                position={[startX + index * spacing, 0, 0]}
              />
            );
          })}
        </Canvas>
      </Box>

      {/* Instructions */}
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          opacity: 0.7,
          fontSize: '0.65rem',
          mt: 0.5,
        }}
      >
        Click dice to select (max {maxDice})
      </Typography>
    </Box>
  );
}

export default DiceHand3D;
