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

// Transform absolute paths to dev server URLs
const PSX_BASE_PATH = '/Users/kevin/Documents/PSX Mega Pack/Models/GLB';
function toModelUrl(absolutePath: string): string {
  // Convert "/Users/kevin/Documents/PSX Mega Pack/Models/GLB/Decals/foo.glb"
  // to "/psx-models/Decals/foo.glb"
  const relativePath = absolutePath.replace(PSX_BASE_PATH, '');
  return `/psx-models${relativePath}`;
}

// ASCII export settings (matching VideoAsciiTool defaults)
const ASCII_CONFIG = {
  cols: 120,
  rows: 68,
  charSet: ' .:#',
  threshold: 0.0,
  color: '#e0e0e0',
  charWidth: 10,
  charHeight: 14,
};

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

// Camera auto-fit component
function CameraController({ modelPath }: { modelPath: string }) {
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
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

      camera.position.set(center.x, center.y, center.z + cameraZ);
      camera.lookAt(center);
      camera.updateProjectionMatrix();

      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [modelPath, camera, scene]);

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

export function ModelBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'png' | 'webm'>('png');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Persisted settings
  const [autoRotate, setAutoRotate] = usePersistedState('model:autoRotate', true);

  const categories = psxModels.categories;
  const models = selectedCategory
    ? psxModels.models.filter((m: ModelInfo) => m.category === selectedCategory)
    : [];

  // ASCII capture from canvas
  const captureAsciiFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    if (!canvas || !asciiCanvas) return null;

    const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!ctx) return null;

    // Read pixels from WebGL
    const { cols, rows } = ASCII_CONFIG;
    const width = canvas.width;
    const height = canvas.height;
    const pixels = new Uint8Array(width * height * 4);
    (ctx as WebGLRenderingContext).readPixels(0, 0, width, height, (ctx as WebGLRenderingContext).RGBA, (ctx as WebGLRenderingContext).UNSIGNED_BYTE, pixels);

    // Sample down to ASCII grid
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // Setup output canvas
    const outWidth = cols * ASCII_CONFIG.charWidth;
    const outHeight = rows * ASCII_CONFIG.charHeight;
    asciiCanvas.width = outWidth;
    asciiCanvas.height = outHeight;

    const asciiCtx = asciiCanvas.getContext('2d');
    if (!asciiCtx) return null;

    // Clear with black background
    asciiCtx.fillStyle = '#000000';
    asciiCtx.fillRect(0, 0, outWidth, outHeight);

    // Draw ASCII
    asciiCtx.font = `${ASCII_CONFIG.charHeight}px monospace`;
    asciiCtx.fillStyle = ASCII_CONFIG.color;

    for (let y = 0; y < rows; y++) {
      let row = '';
      for (let x = 0; x < cols; x++) {
        // Sample center of each cell (flip Y for WebGL)
        const sampleX = Math.floor((x + 0.5) * cellWidth);
        const sampleY = Math.floor((rows - y - 0.5) * cellHeight);
        const i = (sampleY * width + sampleX) * 4;

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

        if (luminance < ASCII_CONFIG.threshold) {
          row += ' ';
        } else {
          row += luminanceToChar(luminance, ASCII_CONFIG.charSet);
        }
      }
      asciiCtx.fillText(row, 0, (y + 1) * ASCII_CONFIG.charHeight - 2);
    }

    return asciiCanvas;
  }, []);

  // Export static PNG
  const exportPng = useCallback(async () => {
    if (!selectedModel) return;
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
      const catSlug = selectedModel.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      a.download = `psx-${catSlug}-${selectedModel.name}-ascii.png`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExporting(false);
  }, [selectedModel, captureAsciiFrame]);

  // Export spinning WebM
  const exportWebm = useCallback(async () => {
    if (!selectedModel || !canvasRef.current || !asciiCanvasRef.current) return;
    setExporting(true);

    const asciiCanvas = asciiCanvasRef.current;
    const fps = 10;
    const duration = 3.6; // 360° rotation
    const totalFrames = Math.floor(fps * duration);

    // Setup ASCII canvas size
    const outWidth = ASCII_CONFIG.cols * ASCII_CONFIG.charWidth;
    const outHeight = ASCII_CONFIG.rows * ASCII_CONFIG.charHeight;
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
      const catSlug = selectedModel.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      a.download = `psx-${catSlug}-${selectedModel.name}-ascii.webm`;
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
  }, [selectedModel, captureAsciiFrame]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>3D Models</h2>
        <span style={styles.subtitle}>
          {psxModels.models.length} PSX models in {categories.length} categories
        </span>
      </div>

      <div style={styles.layout}>
        {/* Sidebar - Categories and Models */}
        <div style={styles.sidebar}>
          {/* Categories */}
          <div style={styles.categoryList}>
            <div style={styles.sectionLabel}>Categories</div>
            {categories.map((cat: { name: string; count: number }) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedModel(null);
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
                {selectedCategory} ({models.length})
              </div>
              <div style={styles.modelScroll}>
                {models.map((model: ModelInfo) => (
                  <button
                    key={model.file}
                    onClick={() => setSelectedModel(model)}
                    style={{
                      ...styles.modelBtn,
                      ...(selectedModel?.file === model.file ? styles.modelBtnActive : {}),
                    }}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main - 3D Viewer */}
        <div style={styles.main}>
          {selectedModel ? (
            <>
              {/* Controls */}
              <div style={styles.controls}>
                <span style={styles.modelName}>{selectedModel.name}</span>
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

              {/* 3D Canvas */}
              <div style={styles.canvasContainer}>
                <Canvas
                  ref={canvasRef}
                  shadows
                  camera={{ position: [0, 0, 5], fov: 50 }}
                  gl={{ preserveDrawingBuffer: true }}
                  style={{ background: '#0a0a0a' }}
                >
                  <ambientLight intensity={0.6} />
                  <directionalLight
                    position={[10, 10, 10]}
                    intensity={1}
                    castShadow
                  />
                  <directionalLight
                    position={[-5, -5, -5]}
                    intensity={0.3}
                  />
                  <Suspense fallback={null}>
                    <Model path={selectedModel.path} />
                    <CameraController modelPath={selectedModel.path} />
                  </Suspense>
                </Canvas>
              </div>

              {/* Hidden ASCII canvas for export */}
              <canvas ref={asciiCanvasRef} style={{ display: 'none' }} />
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
    padding: '8px 12px',
    background: '#141414',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#222',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textAlign: 'left',
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
    padding: '6px 10px',
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
  },
  modelBtnActive: {
    background: '#1a1a1a',
    color: '#e0e0e0',
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
    flex: 1,
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
    flex: 1,
    borderRadius: '8px',
    overflow: 'hidden',
    minHeight: '300px',
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
