/**
 * Video ASCII Tool - Convert MP4 videos to ASCII art videos
 */

import { useState, useRef, useCallback, useEffect } from 'react';
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

export function VideoAsciiTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [gridPreset, setGridPreset] = useState<GridPreset>('large');
  const [charSetName, setCharSetName] = useState<CharSetName>('minimal');
  const [threshold, setThreshold] = useState(0.0);
  const [color, setColor] = useState('#e0e0e0');
  const [fps, setFps] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);

  // Handle file drop/select
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setIsPlaying(false);
    setProgress(0);
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

  // Clean up video URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  // Draw ASCII frame
  const drawAsciiFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    if (!video || !canvas || !asciiCanvas) return;

    const { cols, rows } = GRID_PRESETS[gridPreset];
    const charSet = CHAR_SETS[charSetName];
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const asciiCtx = asciiCanvas.getContext('2d');
    if (!ctx || !asciiCtx) return;

    // Set sampling canvas size
    canvas.width = cols;
    canvas.height = rows;

    // Draw video frame to sampling canvas
    ctx.drawImage(video, 0, 0, cols, rows);
    const imageData = ctx.getImageData(0, 0, cols, rows);
    const pixels = imageData.data;

    // Set output canvas size (for recording)
    const charWidth = 10;
    const charHeight = 14;
    asciiCanvas.width = cols * charWidth;
    asciiCanvas.height = rows * charHeight;

    // Clear and set background
    asciiCtx.fillStyle = '#000000';
    asciiCtx.fillRect(0, 0, asciiCanvas.width, asciiCanvas.height);

    // Draw ASCII
    asciiCtx.font = `${charHeight}px monospace`;
    asciiCtx.fillStyle = color;

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
      asciiCtx.fillText(row, 0, (y + 1) * charHeight - 2);
    }
  }, [gridPreset, charSetName, threshold, color]);

  // Play preview
  const playPreview = useCallback(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    setIsPlaying(true);

    const render = () => {
      if (!video.paused && !video.ended) {
        drawAsciiFrame();
        setProgress((video.currentTime / video.duration) * 100);
        animationRef.current = requestAnimationFrame(render);
      } else {
        setIsPlaying(false);
      }
    };

    video.currentTime = 0;
    video.play();
    render();
  }, [videoUrl, drawAsciiFrame]);

  // Stop preview
  const stopPreview = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    setProgress(0);
  }, []);

  // Export as WebM
  const exportVideo = useCallback(async () => {
    const video = videoRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    if (!video || !asciiCanvas || !videoUrl) return;

    setIsRecording(true);
    setProgress(0);
    chunksRef.current = [];

    // Setup MediaRecorder
    const stream = asciiCanvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000,
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoFile?.name.replace(/\.[^.]+$/, '')}-ascii.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setIsRecording(false);
      setProgress(0);
    };

    // Start recording
    mediaRecorder.start();

    // Play and render at specified FPS
    const frameInterval = 1000 / fps;
    video.currentTime = 0;
    await video.play();

    const renderLoop = () => {
      if (!video.paused && !video.ended) {
        drawAsciiFrame();
        setProgress((video.currentTime / video.duration) * 100);
        setTimeout(renderLoop, frameInterval);
      } else {
        mediaRecorder.stop();
        video.pause();
      }
    };

    renderLoop();
  }, [videoUrl, videoFile, fps, drawAsciiFrame]);

  // Generate ffmpeg command for high-quality export
  const getFFmpegCommand = () => {
    if (!videoFile) return '';
    const { cols, rows } = GRID_PRESETS[gridPreset];
    const inputFile = videoFile.name;
    const outputFile = inputFile.replace(/\.[^.]+$/, '-ascii.mp4');

    // This is a conceptual command - actual implementation would need a custom script
    return `# ASCII Video Export (requires custom script)
# 1. Extract frames:
ffmpeg -i "${inputFile}" -vf "fps=${fps}" frames/frame_%04d.png

# 2. Run ASCII conversion script on each frame
# (converts to ${cols}x${rows} ASCII at threshold ${threshold})

# 3. Re-encode:
ffmpeg -framerate ${fps} -i frames/ascii_%04d.png -c:v libx264 -pix_fmt yuv420p "${outputFile}"`;
  };

  const [showCommand, setShowCommand] = useState(false);

  // Draw initial frame when video loads
  const handleVideoLoad = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      // Wait for seek to complete
      video.onseeked = () => {
        drawAsciiFrame();
        video.onseeked = null;
      };
    }
  }, [drawAsciiFrame]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Video ASCII</h2>
        <span style={styles.subtitle}>Convert MP4 to ASCII video</span>
      </div>

      {!videoUrl ? (
        // Drop zone
        <div
          style={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            style={styles.fileInput}
            id="video-input"
          />
          <label htmlFor="video-input" style={styles.dropLabel}>
            Drop MP4 here or click to select
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

            {/* FPS */}
            <div style={styles.row}>
              <span style={styles.label}>FPS</span>
              <div style={styles.pills}>
                {[10, 15, 24, 30].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    style={{ ...styles.pill, ...(fps === f ? styles.pillActive : {}) }}
                  >
                    {f}
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

          {/* Preview */}
          <div style={styles.preview}>
            {/* Original video (hidden but functional) */}
            <video
              ref={videoRef}
              src={videoUrl}
              style={styles.hiddenVideo}
              onLoadedData={handleVideoLoad}
              muted
            />

            {/* Sampling canvas (hidden) */}
            <canvas ref={canvasRef} style={styles.hiddenCanvas} />

            {/* ASCII output canvas */}
            <div style={styles.asciiContainer}>
              <canvas ref={asciiCanvasRef} style={styles.asciiCanvas} />
            </div>
          </div>

          {/* Progress bar */}
          {(isPlaying || isRecording) && (
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${progress}%` }} />
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              onClick={() => {
                setVideoUrl(null);
                setVideoFile(null);
              }}
              style={styles.actionBtn}
            >
              Clear
            </button>
            <button
              onClick={isPlaying ? stopPreview : playPreview}
              style={styles.actionBtn}
              disabled={isRecording}
            >
              {isPlaying ? 'Stop' : 'Preview'}
            </button>
            <button
              onClick={() => setShowCommand(!showCommand)}
              style={styles.actionBtn}
            >
              {showCommand ? 'Hide' : 'FFmpeg'}
            </button>
            <button
              onClick={exportVideo}
              style={styles.exportBtn}
              disabled={isRecording || isPlaying}
            >
              {isRecording ? 'Exporting...' : 'Export WebM'}
            </button>
          </div>

          {/* FFmpeg command */}
          {showCommand && (
            <div style={styles.commandSection}>
              <pre style={styles.command}>{getFFmpegCommand()}</pre>
              <button
                onClick={() => navigator.clipboard.writeText(getFFmpegCommand())}
                style={styles.copyBtn}
              >
                Copy
              </button>
            </div>
          )}
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
    flex: 1,
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...CHECKER_BG,
    borderRadius: '8px',
    overflow: 'hidden',
  },
  hiddenVideo: {
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
  progressContainer: {
    height: '4px',
    background: '#1a1a1a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: '#E90441',
    transition: 'width 100ms ease',
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
  commandSection: {
    position: 'relative',
    marginTop: '8px',
  },
  command: {
    margin: 0,
    padding: '12px',
    paddingRight: '70px',
    background: '#0a0a0a',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#222',
    borderRadius: '6px',
    fontSize: '0.7rem',
    color: '#4caf50',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '120px',
    overflow: 'auto',
  },
  copyBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '4px 10px',
    background: '#E90441',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#E90441',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
};
