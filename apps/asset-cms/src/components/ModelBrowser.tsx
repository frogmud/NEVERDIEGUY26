/// <reference path="../types/three.d.ts" />
/**
 * Model Browser - Browse and preview PSX Mega Pack GLB models
 */

import { useState, Suspense, useRef, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CHAR_SETS, luminanceToChar, type CharSetName } from '../utils/charSets';
import { usePersistedState } from '../utils/usePersistedState';

// Import model index
import psxModels from '../data/psx-models.json';

interface ModelInfo {
  name: string;
  file: string;
  category: string;
  path: string;
}

// Domain globe definitions (from main game config)
const DOMAIN_GLOBES = [
  { id: 1, name: 'Earth', color: '#8b7355', scale: 0.8, element: 'Earth', die: 6 },
  { id: 2, name: 'Frost Reach', color: '#81d4fa', scale: 1.0, element: 'Ice', die: 12 },
  { id: 3, name: 'Infernus', color: '#d84315', scale: 1.0, element: 'Fire', die: 10 },
  { id: 4, name: 'Shadow Keep', color: '#4a3860', scale: 0.9, element: 'Death', die: 8 },
  { id: 5, name: 'Null Providence', color: '#e8e8e8', scale: 0.7, element: 'Void', die: 4 },
  { id: 6, name: 'Aberrant', color: '#1a4a4a', scale: 1.2, element: 'Chaos', die: 20 },
];

// Trophy-worthy PSX categories (filter out decorations)
const TROPHY_CATEGORIES = ['Items & Weapons'];

// Transform absolute paths to dev server URLs
const PSX_BASE_PATH = '/Users/kevin/Documents/PSX Mega Pack/Models/GLB';
function toModelUrl(absolutePath: string): string {
  // Convert "/Users/kevin/Documents/PSX Mega Pack/Models/GLB/Decals/foo.glb"
  // to "/psx-models/Decals/foo.glb"
  const relativePath = absolutePath.replace(PSX_BASE_PATH, '');
  return `/psx-models${relativePath}`;
}

// Grid presets for ASCII resolution
type GridPreset = 'small' | 'medium' | 'large';

const GRID_PRESETS: Record<GridPreset, { cols: number; rows: number }> = {
  small: { cols: 60, rows: 34 },
  medium: { cols: 80, rows: 45 },
  large: { cols: 120, rows: 68 },
};

const GRID_LABELS: Record<GridPreset, string> = {
  small: '60x34',
  medium: '80x45',
  large: '120x68',
};

// ASCII rendering constants
const CHAR_WIDTH = 10;
const CHAR_HEIGHT = 14;

// Model component that loads and displays a GLB
function Model({ path }: { path: string }) {
  const modelUrl = toModelUrl(path);
  const { scene } = useGLTF(modelUrl);

  // Clone scene to avoid issues with reuse
  const clonedScene = scene.clone();

  return (
    <Center>
      <primitive object={clonedScene} />
    </Center>
  );
}

// Procedural globe component for domain planets
function Globe({ color, scale }: { color: string; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    // @ts-ignore - R3F intrinsic element
    <mesh ref={meshRef} scale={scale}>
      {/* @ts-ignore - R3F intrinsic element */}
      <sphereGeometry args={[1.5, 64, 64]} />
      {/* @ts-ignore - R3F intrinsic element */}
      <meshStandardMaterial
        color={color}
        flatShading
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
}

// Live ASCII renderer - captures frames and converts to ASCII
interface AsciiSettings {
  cols: number;
  rows: number;
  charSet: string;
  threshold: number;
  color: string;
  contrast: number;
}

function LiveAsciiRenderer({
  asciiCanvasRef,
  enabled,
  settings,
}: {
  asciiCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
  settings: AsciiSettings;
}) {
  const { gl, scene, camera } = useThree();
  const frameCount = useRef(0);

  useFrame(() => {
    if (!enabled) return;

    // Throttle to ~12 FPS for performance
    frameCount.current++;
    if (frameCount.current % 5 !== 0) return;

    const asciiCanvas = asciiCanvasRef.current;
    if (!asciiCanvas) return;

    const { cols, rows, charSet, threshold, color, contrast } = settings;

    // Force render before reading pixels (useFrame runs before render)
    gl.render(scene, camera);

    // Read pixels from WebGL canvas directly
    const width = gl.domElement.width;
    const height = gl.domElement.height;
    const pixels = new Uint8Array(width * height * 4);
    const glCtx = gl.getContext();
    glCtx.readPixels(0, 0, width, height, glCtx.RGBA, glCtx.UNSIGNED_BYTE, pixels);

    // Sample down to ASCII grid
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // Setup output canvas
    const outWidth = cols * CHAR_WIDTH;
    const outHeight = rows * CHAR_HEIGHT;
    if (asciiCanvas.width !== outWidth || asciiCanvas.height !== outHeight) {
      asciiCanvas.width = outWidth;
      asciiCanvas.height = outHeight;
    }

    const asciiCtx = asciiCanvas.getContext('2d');
    if (!asciiCtx) return;

    // Clear with black background
    asciiCtx.fillStyle = '#000000';
    asciiCtx.fillRect(0, 0, outWidth, outHeight);

    // Draw ASCII
    asciiCtx.font = `${CHAR_HEIGHT}px monospace`;
    asciiCtx.fillStyle = color;
    asciiCtx.textBaseline = 'top';

    for (let y = 0; y < rows; y++) {
      let row = '';
      for (let x = 0; x < cols; x++) {
        // Sample center of each cell (flip Y for WebGL)
        const sampleX = Math.floor((x + 0.5) * cellWidth);
        const sampleY = Math.floor((rows - y - 0.5) * cellHeight);
        const i = (sampleY * width + sampleX) * 4;

        const r = pixels[i] || 0;
        const g = pixels[i + 1] || 0;
        const b = pixels[i + 2] || 0;

        const rawLum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

        // Apply contrast boost
        const luminance = Math.min(1, rawLum * contrast);

        if (luminance < threshold) {
          row += ' ';
        } else {
          row += luminanceToChar(luminance, charSet);
        }
      }
      asciiCtx.fillText(row, 0, y * CHAR_HEIGHT);
    }
  });

  return null;
}

// Camera auto-fit component
function CameraController({ modelKey }: { modelKey: string }) {
  const { camera, scene } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // Wait a bit for model to load, then fit camera
    const timeout = setTimeout(() => {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      const distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

      // Random angle for variety
      const theta = Math.random() * Math.PI * 2; // Horizontal angle (0 to 2π)
      const phi = Math.PI / 6 + Math.random() * Math.PI / 3; // Vertical angle (30° to 90°)

      // Convert spherical to cartesian
      const x = center.x + distance * Math.sin(phi) * Math.cos(theta);
      const y = center.y + distance * Math.cos(phi);
      const z = center.z + distance * Math.sin(phi) * Math.sin(theta);

      camera.position.set(x, y, z);
      camera.lookAt(center);
      camera.updateProjectionMatrix();

      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [modelKey, camera, scene]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom
      enableRotate
      enablePan={false}
      autoRotate
      autoRotateSpeed={0.5}
      minDistance={0.5}
      maxDistance={50}
    />
  );
}

// Selected item type
type SelectedItem =
  | { type: 'globe'; globe: typeof DOMAIN_GLOBES[0] }
  | { type: 'model'; model: ModelInfo };

export function ModelBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'png' | 'webm'>('png');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Persisted settings
  const [autoRotate, setAutoRotate] = usePersistedState('model:autoRotate', true);
  const [asciiMode, setAsciiMode] = usePersistedState('model:asciiMode', false);
  const [gridPreset, setGridPreset] = usePersistedState<GridPreset>('model:gridPreset', 'medium');
  const [charSetName, setCharSetName] = usePersistedState<CharSetName>('model:charSetName', 'minimal');
  const [threshold, setThreshold] = usePersistedState('model:threshold', 0.0);
  const [contrast, setContrast] = usePersistedState('model:contrast', 10);
  const [color, setColor] = usePersistedState('model:color', '#e0e0e0');

  // Build ASCII settings object
  const asciiSettings: AsciiSettings = {
    ...GRID_PRESETS[gridPreset],
    charSet: CHAR_SETS[charSetName],
    threshold,
    contrast,
    color,
  };

  // Filter categories to trophy-worthy ones only
  const psxCategories = psxModels.categories.filter(
    (cat: { name: string }) => TROPHY_CATEGORIES.includes(cat.name)
  );

  // Get models for selected PSX category
  const models = selectedCategory && selectedCategory !== 'Domain Globes'
    ? psxModels.models.filter((m: ModelInfo) => m.category === selectedCategory)
    : [];

  // Check if viewing globes
  const isGlobeCategory = selectedCategory === 'Domain Globes';

  // Total model count
  const totalModels = DOMAIN_GLOBES.length + psxCategories.reduce(
    (sum: number, cat: { count: number }) => sum + cat.count, 0
  );

  // ASCII capture from canvas (for export)
  const captureAsciiFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    if (!canvas || !asciiCanvas) return null;

    const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!ctx) return null;

    const { cols, rows, charSet, threshold, contrast, color } = asciiSettings;

    // Read pixels from WebGL
    const width = canvas.width;
    const height = canvas.height;
    const pixels = new Uint8Array(width * height * 4);
    (ctx as WebGLRenderingContext).readPixels(0, 0, width, height, (ctx as WebGLRenderingContext).RGBA, (ctx as WebGLRenderingContext).UNSIGNED_BYTE, pixels);

    // Sample down to ASCII grid
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // Setup output canvas
    const outWidth = cols * CHAR_WIDTH;
    const outHeight = rows * CHAR_HEIGHT;
    asciiCanvas.width = outWidth;
    asciiCanvas.height = outHeight;

    const asciiCtx = asciiCanvas.getContext('2d');
    if (!asciiCtx) return null;

    // Clear with black background
    asciiCtx.fillStyle = '#000000';
    asciiCtx.fillRect(0, 0, outWidth, outHeight);

    // Draw ASCII
    asciiCtx.font = `${CHAR_HEIGHT}px monospace`;
    asciiCtx.fillStyle = color;

    for (let y = 0; y < rows; y++) {
      let row = '';
      for (let x = 0; x < cols; x++) {
        // Sample center of each cell (flip Y for WebGL)
        const sampleX = Math.floor((x + 0.5) * cellWidth);
        const sampleY = Math.floor((rows - y - 0.5) * cellHeight);
        const i = (sampleY * width + sampleX) * 4;

        const r = pixels[i] || 0;
        const g = pixels[i + 1] || 0;
        const b = pixels[i + 2] || 0;

        const rawLum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const luminance = Math.min(1, rawLum * contrast);

        if (luminance < threshold) {
          row += ' ';
        } else {
          row += luminanceToChar(luminance, charSet);
        }
      }
      asciiCtx.fillText(row, 0, (y + 1) * CHAR_HEIGHT - 2);
    }

    return asciiCanvas;
  }, [asciiSettings]);

  // Get filename for exports
  const getExportFilename = (ext: string) => {
    if (!selectedItem) return `model-ascii.${ext}`;
    if (selectedItem.type === 'globe') {
      const slug = selectedItem.globe.name.toLowerCase().replace(/\s+/g, '-');
      return `globe-${slug}-ascii.${ext}`;
    } else {
      const catSlug = selectedItem.model.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return `psx-${catSlug}-${selectedItem.model.name}-ascii.${ext}`;
    }
  };

  // Export static PNG
  const exportPng = useCallback(async () => {
    if (!selectedItem) return;
    setExporting(true);

    // Wait for render
    await new Promise(r => setTimeout(r, 500));

    const asciiCanvas = captureAsciiFrame();
    if (!asciiCanvas) {
      setExporting(false);
      return;
    }

    // Download
    const blob = await new Promise<Blob | null>(resolve =>
      asciiCanvas.toBlob(resolve, 'image/png')
    );
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getExportFilename('png');
      a.click();
      URL.revokeObjectURL(url);
    }

    setExporting(false);
  }, [selectedItem, captureAsciiFrame]);

  // Export spinning WebM
  const exportWebm = useCallback(async () => {
    if (!selectedItem || !canvasRef.current || !asciiCanvasRef.current) return;
    setExporting(true);

    const asciiCanvas = asciiCanvasRef.current;
    const fps = 10;
    const duration = 3.6; // 360° rotation
    const totalFrames = Math.floor(fps * duration);

    // Setup ASCII canvas size using current settings
    const { cols, rows } = asciiSettings;
    const outWidth = cols * CHAR_WIDTH;
    const outHeight = rows * CHAR_HEIGHT;
    asciiCanvas.width = outWidth;
    asciiCanvas.height = outHeight;

    // Setup MediaRecorder
    const stream = asciiCanvas.captureStream(fps);
    const chunks: Blob[] = [];

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2000000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getExportFilename('webm');
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    };

    mediaRecorder.start();

    // Capture frames
    const frameInterval = 1000 / fps;
    for (let i = 0; i < totalFrames; i++) {
      await new Promise(r => setTimeout(r, frameInterval));
      captureAsciiFrame();
    }

    mediaRecorder.stop();
  }, [selectedItem, captureAsciiFrame]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>3D Models</h2>
        <span style={styles.subtitle}>
          {totalModels} models ({DOMAIN_GLOBES.length} globes + {totalModels - DOMAIN_GLOBES.length} trophies)
        </span>
      </div>

      <div style={styles.layout}>
        {/* Sidebar - Categories and Models */}
        <div style={styles.sidebar}>
          {/* Categories */}
          <div style={styles.categoryList}>
            <div style={styles.sectionLabel}>Categories</div>
            {/* Domain Globes - special category */}
            <button
              onClick={() => {
                setSelectedCategory('Domain Globes');
                setSelectedItem(null);
              }}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === 'Domain Globes' ? styles.categoryBtnActive : {}),
              }}
            >
              Domain Globes
              <span style={styles.count}>{DOMAIN_GLOBES.length}</span>
            </button>
            {/* PSX trophy categories */}
            {psxCategories.map((cat: { name: string; count: number }) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedItem(null);
                }}
                style={{
                  ...styles.categoryBtn,
                  ...(selectedCategory === cat.name ? styles.categoryBtnActive : {}),
                }}
              >
                {cat.name}
                <span style={styles.count}>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Models list */}
          {selectedCategory && (
            <div style={styles.modelList}>
              <div style={styles.sectionLabel}>
                {selectedCategory} ({isGlobeCategory ? DOMAIN_GLOBES.length : models.length})
              </div>
              <div style={styles.modelScroll}>
                {isGlobeCategory ? (
                  // Globe items
                  DOMAIN_GLOBES.map((globe) => (
                    <button
                      key={globe.id}
                      onClick={() => setSelectedItem({ type: 'globe', globe })}
                      style={{
                        ...styles.modelBtn,
                        ...(selectedItem?.type === 'globe' && selectedItem.globe.id === globe.id
                          ? styles.modelBtnActive
                          : {}),
                      }}
                    >
                      <span style={{ color: globe.color }}>{globe.name}</span>
                      <span style={styles.globeTag}>d{globe.die}</span>
                    </button>
                  ))
                ) : (
                  // PSX model items
                  models.map((model: ModelInfo) => (
                    <button
                      key={model.file}
                      onClick={() => setSelectedItem({ type: 'model', model })}
                      style={{
                        ...styles.modelBtn,
                        ...(selectedItem?.type === 'model' && selectedItem.model.file === model.file
                          ? styles.modelBtnActive
                          : {}),
                      }}
                    >
                      {model.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main - 3D Viewer */}
        <div style={styles.main}>
          {selectedItem ? (
            <>
              {/* Controls */}
              <div style={styles.controls}>
                <span style={styles.modelName}>
                  {selectedItem.type === 'globe' ? selectedItem.globe.name : selectedItem.model.name}
                </span>
                {selectedItem.type === 'globe' && (
                  <span style={{ ...styles.globeInfo, color: selectedItem.globe.color }}>
                    {selectedItem.globe.element}
                  </span>
                )}

                {/* ASCII toggle switch */}
                <label style={styles.switchLabel}>
                  <span style={styles.switchText}>ASCII</span>
                  <div
                    onClick={() => setAsciiMode(!asciiMode)}
                    style={{
                      ...styles.switch,
                      ...(asciiMode ? styles.switchOn : {}),
                    }}
                  >
                    <div
                      style={{
                        ...styles.switchKnob,
                        ...(asciiMode ? styles.switchKnobOn : {}),
                      }}
                    />
                  </div>
                </label>

                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  style={{
                    ...styles.controlBtn,
                    ...(autoRotate ? styles.controlBtnActive : {}),
                  }}
                >
                  Auto-rotate
                </button>
                <div style={styles.exportGroup}>
                  <select
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value as 'png' | 'webm')}
                    style={styles.select}
                  >
                    <option value="png">Static PNG</option>
                    <option value="webm">Spinning WebM</option>
                  </select>
                  <button
                    onClick={exportType === 'png' ? exportPng : exportWebm}
                    disabled={exporting}
                    style={styles.exportBtn}
                  >
                    {exporting ? 'Exporting...' : 'Export ASCII'}
                  </button>
                </div>
              </div>

              {/* ASCII settings row - visible when ASCII mode on */}
              {asciiMode && (
                <div style={styles.settingsRow}>
                  {/* Grid size */}
                  <div style={styles.settingGroup}>
                    <span style={styles.settingLabel}>Grid</span>
                    <div style={styles.pills}>
                      {(Object.keys(GRID_PRESETS) as GridPreset[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => setGridPreset(p)}
                          style={{
                            ...styles.pill,
                            ...(gridPreset === p ? styles.pillActive : {}),
                          }}
                        >
                          {GRID_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Char set */}
                  <div style={styles.settingGroup}>
                    <span style={styles.settingLabel}>Chars</span>
                    <div style={styles.pills}>
                      {(Object.keys(CHAR_SETS) as CharSetName[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => setCharSetName(c)}
                          style={{
                            ...styles.pill,
                            ...(charSetName === c ? styles.pillActive : {}),
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contrast */}
                  <div style={styles.settingGroup}>
                    <span style={styles.settingLabel}>Contrast</span>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      style={styles.slider}
                    />
                    <span style={styles.settingVal}>{contrast}x</span>
                  </div>

                  {/* Threshold */}
                  <div style={styles.settingGroup}>
                    <span style={styles.settingLabel}>Thresh</span>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.05"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      style={styles.slider}
                    />
                    <span style={styles.settingVal}>{threshold.toFixed(2)}</span>
                  </div>

                  {/* Color */}
                  <div style={styles.settingGroup}>
                    <span style={styles.settingLabel}>Color</span>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={styles.colorPicker}
                    />
                  </div>
                </div>
              )}

              {/* 3D Canvas with ASCII overlay */}
              <div style={styles.canvasContainer}>
                {/* 3D Canvas - always renders, hidden when ASCII mode to prevent flicker */}
                <Canvas
                  ref={canvasRef}
                  shadows
                  camera={{ position: [0, 0, 5], fov: 50 }}
                  gl={{ preserveDrawingBuffer: true }}
                  style={{
                    background: '#0a0a0a',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: asciiMode ? 0 : 1,
                  }}
                >
                  {/* @ts-ignore - R3F intrinsic element */}
                  <ambientLight intensity={0.6} />
                  {/* @ts-ignore - R3F intrinsic element */}
                  <directionalLight
                    position={[10, 10, 10]}
                    intensity={1}
                    castShadow
                  />
                  {/* @ts-ignore - R3F intrinsic element */}
                  <directionalLight
                    position={[-5, -5, -5]}
                    intensity={0.3}
                  />
                  <Suspense fallback={null}>
                    {selectedItem.type === 'globe' ? (
                      <Globe color={selectedItem.globe.color} scale={selectedItem.globe.scale} />
                    ) : (
                      <Model path={selectedItem.model.path} />
                    )}
                    <CameraController
                      modelKey={selectedItem.type === 'globe'
                        ? `globe-${selectedItem.globe.id}`
                        : selectedItem.model.path}
                    />
                    <LiveAsciiRenderer
                      asciiCanvasRef={asciiCanvasRef}
                      enabled={asciiMode}
                      settings={asciiSettings}
                    />
                  </Suspense>
                </Canvas>

                {/* ASCII canvas - visible when ASCII mode */}
                <canvas
                  ref={asciiCanvasRef}
                  style={{
                    ...styles.asciiCanvas,
                    display: asciiMode ? 'block' : 'none',
                  }}
                />
              </div>
            </>
          ) : (
            <div style={styles.placeholder}>
              {selectedCategory
                ? 'Select a model from the list'
                : 'Select a category to browse models'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#e0e0e0',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#666',
  },
  layout: {
    display: 'flex',
    flex: 1,
    gap: '16px',
    minHeight: 0,
  },
  sidebar: {
    width: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: 0,
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '4px 0',
  },
  categoryBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#141414',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#222',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textAlign: 'left',
    flexShrink: 0,
    minHeight: '40px',
  },
  categoryBtnActive: {
    background: '#1a1a1a',
    borderColor: '#E90441',
    color: '#E90441',
  },
  count: {
    fontSize: '0.7rem',
    color: '#555',
  },
  modelList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  modelScroll: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  modelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#666',
    fontSize: '0.75rem',
    cursor: 'pointer',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 0,
    minHeight: '32px',
    lineHeight: '16px',
  },
  modelBtnActive: {
    background: '#1a1a1a',
    color: '#e0e0e0',
  },
  globeTag: {
    marginLeft: 'auto',
    fontSize: '0.6rem',
    color: '#555',
    fontFamily: 'monospace',
  },
  globeInfo: {
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: 0,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#141414',
    borderRadius: '8px',
  },
  modelName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#e0e0e0',
  },
  switchLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    marginRight: 'auto',
  },
  switchText: {
    fontSize: '0.75rem',
    color: '#888',
    fontWeight: 500,
  },
  switch: {
    width: '36px',
    height: '20px',
    background: '#333',
    borderRadius: '10px',
    position: 'relative',
    transition: 'background 150ms ease',
    cursor: 'pointer',
  },
  switchOn: {
    background: '#E90441',
  },
  switchKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '16px',
    height: '16px',
    background: '#fff',
    borderRadius: '50%',
    transition: 'left 150ms ease',
  },
  switchKnobOn: {
    left: '18px',
  },
  settingsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '10px 12px',
    background: '#0f0f0f',
    borderRadius: '6px',
    alignItems: 'center',
  },
  settingGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  settingLabel: {
    fontSize: '0.65rem',
    color: '#555',
    textTransform: 'uppercase',
    minWidth: '48px',
  },
  pills: {
    display: 'flex',
    gap: '4px',
  },
  pill: {
    padding: '4px 8px',
    background: '#1a1a1a',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#333',
    borderRadius: '12px',
    color: '#888',
    fontSize: '0.65rem',
    cursor: 'pointer',
  },
  pillActive: {
    background: '#E90441',
    borderColor: '#E90441',
    color: 'white',
  },
  slider: {
    width: '60px',
    accentColor: '#E90441',
  },
  settingVal: {
    fontSize: '0.65rem',
    color: '#888',
    fontFamily: 'monospace',
    minWidth: '32px',
  },
  colorPicker: {
    width: '28px',
    height: '22px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: 0,
  },
  controlBtn: {
    padding: '6px 12px',
    background: '#1a1a1a',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#333',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  controlBtnActive: {
    background: '#E90441',
    borderColor: '#E90441',
    color: 'white',
  },
  exportGroup: {
    display: 'flex',
    gap: '8px',
    marginLeft: 'auto',
  },
  select: {
    padding: '6px 10px',
    background: '#1a1a1a',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#333',
    borderRadius: '4px',
    color: '#e0e0e0',
    fontSize: '0.75rem',
  },
  exportBtn: {
    padding: '6px 12px',
    background: '#E90441',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#E90441',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  canvasContainer: {
    position: 'relative',
    flex: 1,
    borderRadius: '8px',
    overflow: 'hidden',
    minHeight: '300px',
    background: '#0a0a0a',
  },
  asciiCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: '#0a0a0a',
    imageRendering: 'pixelated',
    pointerEvents: 'none', // Let mouse events pass through to 3D canvas
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#444',
    fontSize: '1rem',
    background: '#0a0a0a',
    borderRadius: '8px',
  },
};
