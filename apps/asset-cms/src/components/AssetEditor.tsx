/**
 * Asset Editor - View and process individual assets
 */

import { useState } from 'react';
import type { WikiEntity } from '../types';
import { VtracerTool } from './VtracerTool';
import { AsciiTool } from './AsciiTool';

interface Props {
  entity: WikiEntity;
  assetsDir: FileSystemDirectoryHandle | null;
  onClose: () => void;
}

type Tool = 'preview' | 'vtracer' | 'ascii';

const PREVIEW_SIZES = [16, 32, 64, 120, 240];

export function AssetEditor({ entity, assetsDir, onClose }: Props) {
  const [activeTool, setActiveTool] = useState<Tool>('preview');

  // Get primary asset path
  const assetPath = entity.image || entity.portrait || entity.sprites?.[0];
  const allAssets = [
    entity.image,
    entity.portrait,
    ...(entity.sprites || []),
  ].filter(Boolean) as string[];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onClose} style={styles.backButton}>
          Back
        </button>
        <div style={styles.entityInfo}>
          <h2 style={styles.title}>{entity.name}</h2>
          <span style={styles.slug}>{entity.slug}</span>
        </div>
      </div>

      {/* Tool Tabs */}
      <div style={styles.tabs}>
        {(['preview', 'vtracer', 'ascii'] as Tool[]).map((tool) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            style={{
              ...styles.tab,
              ...(activeTool === tool ? styles.tabActive : {}),
            }}
          >
            {tool === 'vtracer' ? 'Vectorize' : tool.charAt(0).toUpperCase() + tool.slice(1)}
          </button>
        ))}
      </div>

      {/* Tool Content */}
      <div style={styles.content}>
        {activeTool === 'preview' && (
          <PreviewPanel assetPath={assetPath} allAssets={allAssets} entity={entity} />
        )}
        {activeTool === 'vtracer' && (
          <VtracerTool
            assetPath={assetPath}
            entity={entity}
            assetsDir={assetsDir}
          />
        )}
        {activeTool === 'ascii' && (
          <AsciiTool
            assetPath={assetPath}
            entity={entity}
            assetsDir={assetsDir}
          />
        )}
      </div>
    </div>
  );
}

function PreviewPanel({
  assetPath,
  allAssets,
  entity,
}: {
  assetPath?: string;
  allAssets: string[];
  entity: WikiEntity;
}) {
  return (
    <div style={styles.previewPanel}>
      {/* Main Preview */}
      <div style={styles.mainPreview}>
        {assetPath ? (
          <img src={assetPath} alt={entity.name} style={styles.mainImage} />
        ) : (
          <div style={styles.noAsset}>No asset found</div>
        )}
      </div>

      {/* Asset Info */}
      <div style={styles.assetInfo}>
        <h3 style={styles.sectionTitle}>Asset Path</h3>
        <code style={styles.path}>{assetPath || 'N/A'}</code>

        {/* Size Previews */}
        <h3 style={styles.sectionTitle}>Size Preview</h3>
        <div style={styles.sizeGrid}>
          {PREVIEW_SIZES.map((size) => (
            <div key={size} style={styles.sizePreview}>
              <div
                style={{
                  ...styles.sizeBox,
                  width: Math.min(size, 100),
                  height: Math.min(size, 100),
                }}
              >
                {assetPath && (
                  <img
                    src={assetPath}
                    alt={`${size}px`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
              <span style={styles.sizeLabel}>{size}px</span>
            </div>
          ))}
        </div>

        {/* All Assets */}
        {allAssets.length > 1 && (
          <>
            <h3 style={styles.sectionTitle}>All Assets ({allAssets.length})</h3>
            <div style={styles.assetList}>
              {allAssets.map((path, i) => (
                <div key={i} style={styles.assetItem}>
                  <img src={path} alt="" style={styles.assetThumb} />
                  <code style={styles.assetPath}>{path.split('/').pop()}</code>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Entity Metadata */}
        <h3 style={styles.sectionTitle}>Metadata</h3>
        <div style={styles.metadata}>
          <div><strong>Category:</strong> {entity.category}</div>
          {entity.rarity && <div><strong>Rarity:</strong> {entity.rarity}</div>}
          {entity.itemType && <div><strong>Type:</strong> {entity.itemType}</div>}
          {entity.subtype && <div><strong>Subtype:</strong> {entity.subtype}</div>}
        </div>
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
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  backButton: {
    padding: '8px 16px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#888',
    cursor: 'pointer',
  },
  entityInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#e0e0e0',
    margin: 0,
  },
  slug: {
    fontSize: '0.875rem',
    color: '#666',
    fontFamily: 'monospace',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px',
  },
  tab: {
    padding: '8px 16px',
    background: '#1a1a1a',
    border: 'none',
    borderRadius: '4px',
    color: '#888',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  tabActive: {
    background: '#E90441',
    color: 'white',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
  previewPanel: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  mainPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...CHECKER_BG,
    borderRadius: '8px',
    padding: '32px',
    minHeight: '300px',
  },
  mainImage: {
    maxWidth: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
  },
  noAsset: {
    color: '#666',
    fontSize: '1rem',
  },
  assetInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#888',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  path: {
    display: 'block',
    padding: '8px 12px',
    background: '#141414',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#888',
    wordBreak: 'break-all',
  },
  sizeGrid: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  sizePreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  sizeBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...CHECKER_BG,
    borderRadius: '4px',
    padding: '4px',
  },
  sizeLabel: {
    fontSize: '0.7rem',
    color: '#666',
  },
  assetList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  assetItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    background: '#141414',
    borderRadius: '4px',
  },
  assetThumb: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
  },
  assetPath: {
    fontSize: '0.75rem',
    color: '#888',
  },
  metadata: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '0.875rem',
    color: '#888',
  },
};
