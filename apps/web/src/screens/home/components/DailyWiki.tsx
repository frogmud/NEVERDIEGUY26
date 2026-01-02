/**
 * DailyWiki - Wiki reading reward widget
 *
 * Displays today's featured wiki article with reward tracking.
 * Reading the article grants 100 gold (tracked via localStorage).
 */

import { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../../theme';
import { CardHeader, useMidnightCountdown, StatusBanner } from '../../../components/ds';
import { getEntitiesByCategory } from '../../../data/wiki';
import { getDailySeed, seededRandom, getDailyWikiStatus, setDailyWikiRead } from '../utils';

export function DailyWiki() {
  const navigate = useNavigate();
  const countdown = useMidnightCountdown();
  const [hasRead, setHasRead] = useState(() => getDailyWikiStatus().read);

  // Get today's random wiki article (deterministic based on date)
  const dailyArticle = useMemo(() => {
    const seed = getDailySeed();
    // Pick from interesting categories for daily reading
    const categories: Array<'enemies' | 'items' | 'domains' | 'wanderers' | 'pantheon'> = [
      'enemies', 'items', 'domains', 'wanderers', 'pantheon'
    ];
    const categoryIndex = seed % categories.length;
    const category = categories[categoryIndex];
    const entities = getEntitiesByCategory(category);
    const entityIndex = Math.floor(seededRandom(seed * 2) * entities.length);
    return entities[entityIndex];
  }, []);

  // Check for day change
  useEffect(() => {
    const checkDate = () => {
      const status = getDailyWikiStatus();
      setHasRead(status.read);
    };
    // Check every minute for day rollover
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (dailyArticle) {
      // Mark as read and navigate
      if (!hasRead) {
        setDailyWikiRead();
        setHasRead(true);
      }
      navigate(`/wiki/${dailyArticle.category}/${dailyArticle.slug}`);
    }
  };

  return (
    <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '30px', overflow: 'hidden', border: `1px solid ${tokens.colors.border}` }}>
      <CardHeader
        title="Daily Wiki"
        infoTooltip="Read wiki articles for rewards - resets at midnight EST"
        tooltipPlacement="top"
      />

      {/* Status banner - changes based on read status */}
      {hasRead ? (
        <StatusBanner variant="success">
          100 gold sent to your inbox. Refresh in {countdown}.
        </StatusBanner>
      ) : (
        <StatusBanner variant="warning">
          Read today's article for 100 gold! Resets in {countdown}.
        </StatusBanner>
      )}

      {/* Wiki book display */}
      <Box sx={{ bgcolor: tokens.colors.background.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Tooltip title={dailyArticle ? `Read: ${dailyArticle.name}` : "Diepedia - Read today's article"} arrow>
          <Box
            component="img"
            src="/assets/nav/nav2-wiki.svg"
            alt="Diepedia"
            onClick={handleClick}
            sx={{
              width: 100,
              height: 'auto',
              cursor: 'pointer',
              transition: 'transform 0.15s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          />
        </Tooltip>
      </Box>
    </Paper>
  );
}
