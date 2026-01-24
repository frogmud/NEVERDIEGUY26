/**
 * ASCII Tool - Convert images to ASCII art SVG (simplified)
 */

import { useState, useEffect } from 'react';
import type { WikiEntity } from '../types';
import {
  imageToAsciiGrid,
  asciiGridToSvg,
  ASCII_GRID_PRESETS,
  type AsciiGridPreset,
} from '../utils/ascii';
import { CHAR_SETS, type CharSetName } from '../utils/charSets';
import { usePersistedState } from '../utils/usePersistedState';

interface Props {
  assetPath?: string;
  entity: WikiEntity;
  assetsDir?: FileSystemDirectoryHandle | null;
}

const GRID_LABELS: Record<AsciiGridPreset, string> = {
  small: '28x16',
  medium: '40x24',
  large: '56x32',
};

export function AsciiTool({ assetPath, entity }: Props) {
  const [asciiGrid, setAsciiGrid] = useState<string[] | null>(null);
  const [svgOutput, setSvgOutput] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Persisted settings
  const [gridPreset, setGridPreset] = usePersistedState<AsciiGridPreset>('entity:gridPreset', 'medium');
  const [charSetName, setCharSetName] = usePersistedState<CharSetName>('entity:charSetName', 'dense');
  const [threshold, setThreshold] = usePersistedState('entity:threshold', 0.15);
  const [color, setColor] = usePersistedState('entity:color', '#e0e0e0');

  const generate = async () => {
    if (!assetPath) return;
    setGenerating(true);
    try {
      const { cols, rows } = ASCII_GRID_PRESETS[gridPreset];
      const grid = await imageToAsciiGrid(assetPath, {
        cols,
        rows,
        charSet: CHAR_SETS[charSetName],
        threshold,
      });
      setAsciiGrid(grid);
      setSvgOutput(asciiGridToSvg(grid, { color }));
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Auto-regenerate when settings or asset changes
  useEffect(() => {
    if (assetPath) generate();
  }, [assetPath, gridPreset, charSetName, threshold, color]);

  const save = async () => {
    if (!svgOutput) return;
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${entity.slug}-ascii.svg`,
        types: [{ description: 'SVG', accept: { 'image/svg+xml': ['.svg'] } }],
      });
      const w = await handle.createWritable();
      await w.write(svgOutput);
      await w.close();
    } catch {}
  };

  const copy = () => asciiGrid && navigator.clipboard.writeText(asciiGrid.join('\n'));

  if (!assetPath) {
    return <div style={styles.noAsset}>No asset selected</div>;
  }

  return (
    <div style={styles.container}>
      {/* Controls row */}
      <div style={styles.controls}>
        {/* Grid size */}
        <div style={styles.row}>
          <span style={styles.label}>Grid</span>
          <div style={styles.pills}>
            {(Object.keys(ASCII_GRID_PRESETS) as AsciiGridPreset[]).map((p) => (
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

        {/* Loading indicator */}
        {generating && <span style={styles.loading}>...</span>}
      </div>

      {/* Preview */}
      <div style={styles.preview}>
        <div style={styles.previewBox}>
          <img src={assetPath} alt="Original" style={styles.origImg} />
        </div>
        <div style={styles.asciiBox}>
          {asciiGrid ? (
            <pre style={{ ...styles.ascii, color }}>{asciiGrid.join('\n')}</pre>
          ) : (
            <span style={styles.placeholder}>...</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button onClick={copy} style={styles.actionBtn}>Copy Text</button>
        <button onClick={save} style={styles.saveBtn}>Save SVG</button>
      </div>
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
  loading: {
    marginLeft: 'auto',
    color: '#666',
    fontSize: '0.75rem',
  },
  preview: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '16px',
  },
  previewBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    ...CHECKER_BG,
    borderRadius: '8px',
  },
  origImg: {
    maxWidth: '120px',
    maxHeight: '120px',
    objectFit: 'contain',
  },
  asciiBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    background: '#0a0a0a',
    borderRadius: '8px',
    overflow: 'auto',
    minHeight: '150px',
  },
  ascii: {
    margin: 0,
    fontSize: '6px',
    lineHeight: 1,
    fontFamily: 'monospace',
    whiteSpace: 'pre',
  },
  placeholder: {
    color: '#444',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '6px 12px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '6px 12px',
    background: '#E90441',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
};
