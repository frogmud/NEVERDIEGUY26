/**
 * vtracer Tool - Generate vectorization commands (simplified)
 */

import { useState } from 'react';
import type { VtracerPreset } from '../types';
import { getVtracerCommand, VTRACER_PRESETS } from '../utils/vtracer';

interface Props {
  assetPath?: string;
  entity?: unknown;
  assetsDir?: FileSystemDirectoryHandle | null;
}

const PRESET_LABELS: Record<VtracerPreset, string> = {
  'icon-16': '16',
  'icon-32': '32',
  'icon-64': '64',
  'portrait-60': '60',
  'portrait-120': '120',
  'portrait-240': '240',
};

export function VtracerTool({ assetPath }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<VtracerPreset>('icon-64');
  const [colorCount, setColorCount] = useState(24);
  const [copied, setCopied] = useState(false);

  if (!assetPath) {
    return <div style={styles.noAsset}>No asset selected</div>;
  }

  const config = VTRACER_PRESETS[selectedPreset];
  const outputPath = assetPath.replace(/\.[^.]+$/, `-${selectedPreset}.svg`);
  const command = getVtracerCommand(assetPath, outputPath, selectedPreset, colorCount);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={styles.container}>
      {/* Top row: Preview + Controls */}
      <div style={styles.topRow}>
        {/* Preview */}
        <div style={styles.previewSection}>
          <img src={assetPath} alt="Original" style={styles.originalImg} />
          <div style={{ ...styles.targetBox, width: config.size, height: config.size }}>
            <img src={assetPath} alt="Target" style={styles.targetImg} />
          </div>
          <span style={styles.sizeLabel}>{config.size}px</span>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          {/* Preset pills */}
          <div style={styles.presetRow}>
            <span style={styles.label}>Size</span>
            <div style={styles.pills}>
              {(Object.keys(VTRACER_PRESETS) as VtracerPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSelectedPreset(preset)}
                  style={{
                    ...styles.pill,
                    ...(selectedPreset === preset ? styles.pillActive : {}),
                  }}
                >
                  {PRESET_LABELS[preset]}
                </button>
              ))}
            </div>
          </div>

          {/* Color slider */}
          <div style={styles.sliderRow}>
            <span style={styles.label}>Colors</span>
            <input
              type="range"
              min="8"
              max="64"
              step="8"
              value={colorCount}
              onChange={(e) => setColorCount(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.sliderVal}>{colorCount}</span>
          </div>
        </div>
      </div>

      {/* Command */}
      <div style={styles.commandSection}>
        <pre style={styles.command}>{command}</pre>
        <button onClick={copyCommand} style={styles.copyBtn}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Output */}
      <code style={styles.output}>{outputPath}</code>
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
  },
  noAsset: {
    color: '#666',
    padding: '48px',
    textAlign: 'center',
  },
  topRow: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  previewSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    ...CHECKER_BG,
    borderRadius: '8px',
  },
  originalImg: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
  },
  targetBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  targetImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    imageRendering: 'pixelated',
  },
  sizeLabel: {
    fontSize: '0.75rem',
    color: '#666',
  },
  controls: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  presetRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    fontSize: '0.75rem',
    color: '#666',
    width: '50px',
    textTransform: 'uppercase',
  },
  pills: {
    display: 'flex',
    gap: '4px',
  },
  pill: {
    padding: '6px 12px',
    background: '#1a1a1a',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#333',
    borderRadius: '16px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  pillActive: {
    background: '#E90441',
    borderColor: '#E90441',
    color: 'white',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  slider: {
    flex: 1,
    maxWidth: '200px',
    accentColor: '#E90441',
  },
  sliderVal: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: 'monospace',
    width: '24px',
  },
  commandSection: {
    position: 'relative',
  },
  command: {
    margin: 0,
    padding: '12px',
    paddingRight: '70px',
    background: '#0a0a0a',
    border: '1px solid #222',
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
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
  output: {
    display: 'block',
    padding: '8px 12px',
    background: '#141414',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: '#666',
  },
};
