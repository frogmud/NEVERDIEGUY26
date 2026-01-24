/**
 * Entity Browser - Grid view of wiki entities
 */

import { useState, useEffect } from 'react';
import type { WikiEntity, WikiCategory, AssetStatus } from '../types';

interface Props {
  entities: WikiEntity[];
  category: WikiCategory;
  onSelectEntity: (entity: WikiEntity) => void;
}

export function EntityBrowser({ entities, category, onSelectEntity }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{category}</h2>
        <span style={styles.count}>{entities.length} entities</span>
      </div>

      <div style={styles.grid}>
        {entities.map((entity) => (
          <EntityCard
            key={entity.slug}
            entity={entity}
            onClick={() => onSelectEntity(entity)}
          />
        ))}
      </div>

      {entities.length === 0 && (
        <div style={styles.empty}>No entities found</div>
      )}
    </div>
  );
}

function EntityCard({
  entity,
  onClick,
}: {
  entity: WikiEntity;
  onClick: () => void;
}) {
  const [status, setStatus] = useState<AssetStatus>('exists');
  const [imageError, setImageError] = useState(false);

  // Get the primary asset path
  const assetPath = entity.image || entity.portrait || entity.sprites?.[0];

  // Check if asset exists by trying to load it
  useEffect(() => {
    if (!assetPath) {
      setStatus('missing');
      return;
    }

    const img = new Image();
    img.onload = () => setStatus('exists');
    img.onerror = () => setStatus('error');
    img.src = assetPath;
  }, [assetPath]);

  const statusColor = {
    exists: '#2d7a2d',
    missing: '#7a7a2d',
    error: '#7a2d2d',
  }[status];

  return (
    <div style={styles.card} onClick={onClick}>
      {/* Status indicator */}
      <div style={{ ...styles.statusDot, background: statusColor }} />

      {/* Thumbnail */}
      <div style={styles.thumbnail}>
        {assetPath && !imageError ? (
          <img
            src={assetPath}
            alt={entity.name}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={styles.placeholder}>?</div>
        )}
      </div>

      {/* Info */}
      <div style={styles.info}>
        <div style={styles.name}>{entity.name}</div>
        <div style={styles.slug}>{entity.slug}</div>
        {entity.rarity && (
          <div style={{ ...styles.rarity, color: getRarityColor(entity.rarity) }}>
            {entity.rarity}
          </div>
        )}
      </div>
    </div>
  );
}

function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    Common: '#9e9e9e',
    Uncommon: '#4caf50',
    Rare: '#2196f3',
    Epic: '#9c27b0',
    Legendary: '#ff9800',
    Unique: '#E90441',
  };
  return colors[rarity] || '#888';
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
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    textTransform: 'capitalize',
    color: '#e0e0e0',
  },
  count: {
    color: '#888',
    fontSize: '0.875rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
  },
  card: {
    position: 'relative',
    background: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  statusDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  thumbnail: {
    width: '100%',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...CHECKER_BG,
    borderRadius: '4px',
    marginBottom: '8px',
    overflow: 'hidden',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  placeholder: {
    color: '#555',
    fontSize: '2rem',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  name: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#e0e0e0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  slug: {
    fontSize: '0.75rem',
    color: '#666',
    fontFamily: 'monospace',
  },
  rarity: {
    fontSize: '0.7rem',
    fontWeight: 500,
    marginTop: '2px',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    padding: '48px',
  },
};
