import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { METEOR_CONFIG } from './config';
import { MeteorScene } from './MeteorScene';
import type { NPCRarity } from './config';

interface PhaserCanvasProps {
  onNPCSquished?: (rarity: NPCRarity, score: number) => void;
  onMeteorLanded?: (results: { squished: Array<{ rarity: NPCRarity; score: number }> }) => void;
  onMeteorStart?: (positions: Array<{ x: number; y: number }>) => void;
  onSceneReady?: (scene: MeteorScene) => void;
}

export function PhaserCanvas({
  onNPCSquished,
  onMeteorLanded,
  onMeteorStart,
  onSceneReady,
}: PhaserCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Create scene instance
    const meteorScene = new MeteorScene();

    // Create game config
    const config: Phaser.Types.Core.GameConfig = {
      ...METEOR_CONFIG,
      parent: containerRef.current,
      scene: meteorScene,
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Wait for game to be ready, then set up scene callbacks
    // Using game.events ensures scene is properly initialized
    game.events.once('ready', () => {
      // Get the actual scene instance from the game
      const scene = game.scene.getScene('MeteorScene') as MeteorScene;
      if (scene) {
        scene.setCallbacks({
          onNPCSquished,
          onMeteorLanded,
          onMeteorStart,
        });
        onSceneReady?.(scene);
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update callbacks when they change
  useEffect(() => {
    if (!gameRef.current) return;
    const scene = gameRef.current.scene.getScene('MeteorScene') as MeteorScene;
    if (scene) {
      scene.setCallbacks({
        onNPCSquished,
        onMeteorLanded,
        onMeteorStart,
      });
    }
  }, [onNPCSquished, onMeteorLanded, onMeteorStart]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
}
