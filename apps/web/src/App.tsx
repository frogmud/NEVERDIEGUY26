import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, GlobalStyles } from '@mui/material';
import { Shell } from './components/Shell';
import { tokens } from './theme';
import { RunProvider, PartyProvider } from './contexts';

// Global CSS animations for cross-browser compatibility
const globalAnimations = {
  '@keyframes flyDice': {
    '0%': {
      transform: 'translate(0, 0) scale(1) rotate(0deg)',
      opacity: 1,
    },
    '50%': {
      opacity: 1,
    },
    '100%': {
      transform: 'translate(var(--fly-dx), var(--fly-dy)) scale(0.3) rotate(720deg)',
      opacity: 0,
    },
  },
};

// Loading fallback for lazy routes
function RouteLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <CircularProgress sx={{ color: tokens.colors.primary }} />
    </Box>
  );
}

// ============ EAGER LOADED (Critical Path) ============
import { Home } from './screens/home/Home';
import { NotFound } from './screens/NotFound';
import { NotFoundStandalone } from './screens/NotFoundStandalone';

// ============ LAZY LOADED ============

// Wiki
const WikiIndex = lazy(() => import('./screens/wiki/WikiIndex').then(m => ({ default: m.WikiIndex })));
const WikiEntity = lazy(() => import('./screens/wiki/WikiEntity').then(m => ({ default: m.WikiEntity })));

// Redirect old faction URLs to new format
function FactionRedirect() {
  const { id } = useParams();
  return <Navigate to={`/wiki/factions/${id}`} replace />;
}

// Help (minimal)
const HelpCenter = lazy(() => import('./screens/help/HelpCenter').then(m => ({ default: m.HelpCenter })));
const FAQ = lazy(() => import('./screens/help/FAQ').then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import('./screens/help/Contact').then(m => ({ default: m.Contact })));
const Sitemap = lazy(() => import('./screens/help/Sitemap').then(m => ({ default: m.Sitemap })));
const GettingStarted = lazy(() => import('./screens/help/GettingStarted').then(m => ({ default: m.GettingStarted })));
const DiceTypes = lazy(() => import('./screens/help/DiceTypes').then(m => ({ default: m.DiceTypes })));
const CombatSystem = lazy(() => import('./screens/help/CombatSystem').then(m => ({ default: m.CombatSystem })));

// Settings (restructured with sidebar)
const SettingsIndex = lazy(() => import('./screens/settings/SettingsIndex').then(m => ({ default: m.SettingsIndex })));

// Play (3D Phaser games)
const PlayHub = lazy(() => import('./screens/play/PlayHub').then(m => ({ default: m.PlayHub })));
const PlayResults = lazy(() => import('./screens/play/PlayResults').then(m => ({ default: m.PlayResults })));
const DiceMeteor = lazy(() => import('./screens/play/DiceMeteor').then(m => ({ default: m.DiceMeteor })));
const ExitGameConfirm = lazy(() => import('./screens/play/ExitGameConfirm').then(m => ({ default: m.ExitGameConfirm })));
const ExitGameSummary = lazy(() => import('./screens/play/ExitGameSummary').then(m => ({ default: m.ExitGameSummary })));
const Inventory = lazy(() => import('./screens/play/Inventory').then(m => ({ default: m.Inventory })));
const MatchStats = lazy(() => import('./screens/play/MatchStats').then(m => ({ default: m.MatchStats })));
const LootDrop = lazy(() => import('./screens/play/LootDrop').then(m => ({ default: m.LootDrop })));
const Globe3D = lazy(() => import('./screens/play/Globe3D').then(m => ({ default: m.Globe3D })));
const MultiplayerHub = lazy(() => import('./screens/play/MultiplayerHub').then(m => ({ default: m.MultiplayerHub })));

// Graveyard (run history)
const Graveyard = lazy(() => import('./screens/graveyard/Graveyard').then(m => ({ default: m.Graveyard })));

// Game
const LocationSelector = lazy(() => import('./screens/game/LocationSelector').then(m => ({ default: m.LocationSelector })));
const FastTravel = lazy(() => import('./screens/game/FastTravel').then(m => ({ default: m.FastTravel })));

// Search
const SearchPage = lazy(() => import('./screens/search/SearchPage').then(m => ({ default: m.SearchPage })));

// Notifications (minimal)
const NotificationCenter = lazy(() => import('./screens/notifications/NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const LevelUp = lazy(() => import('./screens/notifications/LevelUp').then(m => ({ default: m.LevelUp })));

// Errors
const NetworkErrorDemo = lazy(() => import('./screens/errors/NetworkError').then(m => ({ default: m.NetworkErrorDemo })));
const MaintenanceModeDemo = lazy(() => import('./screens/errors/MaintenanceMode').then(m => ({ default: m.MaintenanceModeDemo })));
const ServerError = lazy(() => import('./screens/errors/ServerError').then(m => ({ default: m.ServerError })));
const OfflineState = lazy(() => import('./screens/errors/OfflineState').then(m => ({ default: m.OfflineState })));

// Legal
const Terms = lazy(() => import('./screens/legal/Terms').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('./screens/legal/Privacy').then(m => ({ default: m.Privacy })));
const AboutUs = lazy(() => import('./screens/legal/AboutUs').then(m => ({ default: m.AboutUs })));

// Design System (footer link)
const DesignSystem = lazy(() => import('./screens/design-system/DesignSystem').then(m => ({ default: m.DesignSystem })));
const ComponentDetail = lazy(() => import('./screens/design-system/ComponentDetail').then(m => ({ default: m.ComponentDetail })));

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <GlobalStyles styles={globalAnimations} />
      <Routes>
        {/* Auth routes redirect to home (MVP: no login required) */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/" replace />} />
        <Route path="/reset-password" element={<Navigate to="/" replace />} />
        <Route path="/reset-success" element={<Navigate to="/" replace />} />
        <Route path="/logout" element={<Navigate to="/" replace />} />
        <Route path="/404" element={<NotFoundStandalone />} />

        {/* Removed routes redirect to home */}
        <Route path="/progress/*" element={<Navigate to="/" replace />} />
        <Route path="/shop/*" element={<Navigate to="/" replace />} />
        <Route path="/profile/*" element={<Navigate to="/" replace />} />
        <Route path="/user/*" element={<Navigate to="/" replace />} />
        <Route path="/leaderboard" element={<Navigate to="/" replace />} />
        <Route path="/history" element={<Navigate to="/graveyard" replace />} />
        <Route path="/rewards/*" element={<Navigate to="/" replace />} />

        {/* Routes with shell */}
        <Route element={<Shell />}>
          {/* Home */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          {/* Play - 3D Phaser Games */}
          <Route path="/play" element={<Suspense fallback={<RouteLoader />}><RunProvider><PlayHub /></RunProvider></Suspense>} />
          <Route path="/play/results" element={<Suspense fallback={<RouteLoader />}><PlayResults /></Suspense>} />
          <Route path="/play/meteor" element={<Suspense fallback={<RouteLoader />}><DiceMeteor /></Suspense>} />
          {/* Multiplayer - Divine Drama Engine */}
          <Route path="/play/multiplayer" element={<Suspense fallback={<RouteLoader />}><PartyProvider><RunProvider><MultiplayerHub /></RunProvider></PartyProvider></Suspense>} />
          <Route path="/play/multiplayer/:roomCode" element={<Suspense fallback={<RouteLoader />}><PartyProvider><RunProvider><MultiplayerHub /></RunProvider></PartyProvider></Suspense>} />
          {/* MVP: Replays/Tournaments hidden until backend ready */}
          {/* <Route path="/play/replays" element={<Suspense fallback={<RouteLoader />}><ReplayList /></Suspense>} /> */}
          {/* <Route path="/play/tournament" element={<Suspense fallback={<RouteLoader />}><TournamentBracket /></Suspense>} /> */}
          <Route path="/play/globe" element={<Suspense fallback={<RouteLoader />}><Globe3D /></Suspense>} />
          <Route path="/play/stats/:threadId" element={<Suspense fallback={<RouteLoader />}><MatchStats /></Suspense>} />
          <Route path="/play/exit-confirm" element={<Suspense fallback={<RouteLoader />}><ExitGameConfirm /></Suspense>} />
          <Route path="/play/exit-summary" element={<Suspense fallback={<RouteLoader />}><ExitGameSummary /></Suspense>} />
          <Route path="/inventory" element={<Suspense fallback={<RouteLoader />}><Inventory /></Suspense>} />
          <Route path="/loot" element={<Suspense fallback={<RouteLoader />}><LootDrop /></Suspense>} />
          <Route path="/graveyard" element={<Suspense fallback={<RouteLoader />}><Graveyard /></Suspense>} />

          {/* Wiki */}
          <Route path="/wiki" element={<Suspense fallback={<RouteLoader />}><WikiIndex /></Suspense>} />
          <Route path="/wiki/faction/:id" element={<FactionRedirect />} />
          <Route path="/wiki/:category" element={<Suspense fallback={<RouteLoader />}><WikiIndex /></Suspense>} />
          <Route path="/wiki/:category/:id" element={<Suspense fallback={<RouteLoader />}><WikiEntity /></Suspense>} />

          {/* Search */}
          <Route path="/search" element={<Suspense fallback={<RouteLoader />}><SearchPage /></Suspense>} />

          {/* Notifications */}
          <Route path="/notifications" element={<Suspense fallback={<RouteLoader />}><NotificationCenter /></Suspense>} />
          <Route path="/notifications/level-up" element={<Suspense fallback={<RouteLoader />}><LevelUp /></Suspense>} />

          {/* Game */}
          <Route path="/game/location" element={<Suspense fallback={<RouteLoader />}><LocationSelector /></Suspense>} />
          <Route path="/game/fast-travel" element={<Suspense fallback={<RouteLoader />}><FastTravel /></Suspense>} />

          {/* Settings */}
          <Route path="/settings" element={<Suspense fallback={<RouteLoader />}><SettingsIndex /></Suspense>} />

          {/* Help */}
          <Route path="/help" element={<Suspense fallback={<RouteLoader />}><HelpCenter /></Suspense>} />
          <Route path="/help/faq" element={<Suspense fallback={<RouteLoader />}><FAQ /></Suspense>} />
          <Route path="/help/contact" element={<Suspense fallback={<RouteLoader />}><Contact /></Suspense>} />
          <Route path="/help/sitemap" element={<Suspense fallback={<RouteLoader />}><Sitemap /></Suspense>} />
          <Route path="/help/guide/basics" element={<Suspense fallback={<RouteLoader />}><GettingStarted /></Suspense>} />
          <Route path="/help/guide/dice" element={<Suspense fallback={<RouteLoader />}><DiceTypes /></Suspense>} />
          <Route path="/help/guide/combat" element={<Suspense fallback={<RouteLoader />}><CombatSystem /></Suspense>} />

          {/* Legal */}
          <Route path="/terms" element={<Suspense fallback={<RouteLoader />}><Terms /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<RouteLoader />}><Privacy /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<RouteLoader />}><AboutUs /></Suspense>} />

          {/* Design System */}
          <Route path="/design-system" element={<Suspense fallback={<RouteLoader />}><DesignSystem /></Suspense>} />
          <Route path="/design-system/:componentId" element={<Suspense fallback={<RouteLoader />}><ComponentDetail /></Suspense>} />

          {/* Errors */}
          <Route path="/errors/network" element={<Suspense fallback={<RouteLoader />}><NetworkErrorDemo /></Suspense>} />
          <Route path="/maintenance" element={<Suspense fallback={<RouteLoader />}><MaintenanceModeDemo /></Suspense>} />
          <Route path="/error/500" element={<Suspense fallback={<RouteLoader />}><ServerError /></Suspense>} />
          <Route path="/offline" element={<Suspense fallback={<RouteLoader />}><OfflineState /></Suspense>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
