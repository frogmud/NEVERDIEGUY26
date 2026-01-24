/**
 * Image ASCII Tool - Convert images to ASCII art with video-style settings
 */

import { useState, useRef, useCallback, useEffect, WheelEvent, MouseEvent } from 'react';
import { CHAR_SETS, luminanceToChar, type CharSetName } from '../utils/charSets';

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

export function ImageAsciiTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gridPreset, setGridPreset] = useState<GridPreset>('large');
  const [charSetName, setCharSetName] = useState<CharSetName>('minimal');
  const [threshold, setThreshold] = useState(0.0);
  const [color, setColor] = useState('#e0e0e0');
  const [asciiText, setAsciiText] = useState<string | null>(null);

  // Pan/zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle file drop/select
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setAsciiText(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Clean up image URL on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  // Generate ASCII from image
  const generateAscii = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    if (!img || !canvas || !asciiCanvas || !imageUrl) return;

    const { cols, rows } = GRID_PRESETS[gridPreset];
    const charSet = CHAR_SETS[charSetName];
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const asciiCtx = asciiCanvas.getContext('2d');
    if (!ctx || !asciiCtx) return;

    // Set sampling canvas size
    canvas.width = cols;
    canvas.height = rows;

    // Draw image to sampling canvas
    ctx.drawImage(img, 0, 0, cols, rows);
    const imageData = ctx.getImageData(0, 0, cols, rows);
    const pixels = imageData.data;

    // Build ASCII text
    const lines: string[] = [];
    for (let y = 0; y < rows; y++) {
      let row = '';
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        luminance *= a / 255;

        if (luminance < threshold) {
          row += ' ';
        } else {
          row += luminanceToChar(luminance, charSet);
        }
      }
      lines.push(row);
    }
    setAsciiText(lines.join('\n'));

    // Set output canvas size (for PNG export)
    const charWidth = 10;
    const charHeight = 14;
    asciiCanvas.width = cols * charWidth;
    asciiCanvas.height = rows * charHeight;

    // Clear and set background
    asciiCtx.fillStyle = '#000000';
    asciiCtx.fillRect(0, 0, asciiCanvas.width, asciiCanvas.height);

    // Draw ASCII to canvas
    asciiCtx.font = `${charHeight}px monospace`;
    asciiCtx.fillStyle = color;

    for (let y = 0; y < rows; y++) {
      asciiCtx.fillText(lines[y], 0, (y + 1) * charHeight - 2);
    }
  }, [imageUrl, gridPreset, charSetName, threshold, color]);

  // Regenerate when settings change
  useEffect(() => {
    if (imageUrl && imgRef.current?.complete) {
      generateAscii();
    }
  }, [gridPreset, charSetName, threshold, color, generateAscii]);

  // Generate when image loads
  const handleImageLoad = useCallback(() => {
    generateAscii();
  }, [generateAscii]);

  // Export PNG
  const exportPng = useCallback(() => {
    const asciiCanvas = asciiCanvasRef.current;
    if (!asciiCanvas || !imageFile) return;

    asciiCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${imageFile.name.replace(/\.[^.]+$/, '')}-ascii.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  }, [imageFile]);

  // Copy text
  const copyText = useCallback(() => {
    if (asciiText) {
      navigator.clipboard.writeText(asciiText);
    }
  }, [asciiText]);

  // Zoom handler
  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.25, Math.min(4, z * delta)));
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Image ASCII</h2>
        <span style={styles.subtitle}>Convert images to ASCII art</span>
      </div>

      {!imageUrl ? (
        // Drop zone
        <div
          style={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={styles.fileInput}
            id="image-input"
          />
          <label htmlFor="image-input" style={styles.dropLabel}>
            Drop image here or click to select
          </label>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div style={styles.controls}>
            {/* Grid size */}
            <div style={styles.row}>
              <span style={styles.label}>Grid</span>
              <div style={styles.pills}>
                {(Object.keys(GRID_PRESETS) as GridPreset[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setGridPreset(p)}
                    style={{ ...styles.pill, ...(gridPreset === p ? styles.pillActive : {}) }}
                  >
                    {GRID_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Char set */}
            <div style={styles.row}>
              <span style={styles.label}>Chars</span>
              <div style={styles.pills}>
                {(Object.keys(CHAR_SETS) as CharSetName[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCharSetName(c)}
                    style={{ ...styles.pill, ...(charSetName === c ? styles.pillActive : {}) }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold */}
            <div style={styles.row}>
              <span style={styles.label}>Thresh</span>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.val}>{threshold.toFixed(2)}</span>
            </div>

            {/* Color */}
            <div style={styles.row}>
              <span style={styles.label}>Color</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={styles.colorPicker}
              />
            </div>
          </div>

          {/* Preview with pan/zoom */}
          <div
            ref={previewRef}
            style={styles.preview}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Hidden source image */}
            <img
              ref={imgRef}
              src={imageUrl}
              onLoad={handleImageLoad}
              style={styles.hiddenImg}
              alt=""
            />

            {/* Sampling canvas (hidden) */}
            <canvas ref={canvasRef} style={styles.hiddenCanvas} />

            {/* ASCII output canvas */}
            <div
              style={{
                ...styles.asciiContainer,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                cursor: isPanning ? 'grabbing' : 'grab',
              }}
            >
              <canvas ref={asciiCanvasRef} style={styles.asciiCanvas} />
            </div>

            {/* Zoom indicator */}
            <div style={styles.zoomBadge}>
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              onClick={() => {
                setImageUrl(null);
                setImageFile(null);
                setAsciiText(null);
                resetView();
              }}
              style={styles.actionBtn}
            >
              Clear
            </button>
            <button onClick={resetView} style={styles.actionBtn}>
              Reset View
            </button>
            <button onClick={copyText} style={styles.actionBtn} disabled={!asciiText}>
              Copy Text
            </button>
            <button onClick={exportPng} style={styles.exportBtn} disabled={!asciiText}>
              Export PNG
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Checkered pattern for alpha transparency
const CHECKER_BG: React.CSSProperties = {
  background: `
    linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
  `,
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
  backgroundColor: '#0a0a0a',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
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
  dropZone: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    border: '2px dashed #333',
    borderRadius: '12px',
    background: '#0a0a0a',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  fileInput: {
    display: 'none',
  },
  dropLabel: {
    color: '#666',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '12px',
    background: '#141414',
    borderRadius: '8px',
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '0.7rem',
    color: '#666',
    textTransform: 'uppercase',
    width: '40px',
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
    width: '80px',
    accentColor: '#E90441',
  },
  val: {
    fontSize: '0.65rem',
    color: '#888',
    fontFamily: 'monospace',
    width: '28px',
  },
  colorPicker: {
    width: '28px',
    height: '22px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: 0,
  },
  preview: {
    position: 'relative',
    flex: 1,
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...CHECKER_BG,
    borderRadius: '8px',
    overflow: 'hidden',
  },
  hiddenImg: {
    display: 'none',
  },
  hiddenCanvas: {
    display: 'none',
  },
  asciiContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  asciiCanvas: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    imageRendering: 'pixelated',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '8px 16px',
    background: '#1a1a1a',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#333',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  exportBtn: {
    marginLeft: 'auto',
    padding: '8px 16px',
    background: '#E90441',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#E90441',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  zoomBadge: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    padding: '4px 8px',
    background: 'rgba(0,0,0,0.7)',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: '#888',
    fontFamily: 'monospace',
    pointerEvents: 'none',
  },
};
