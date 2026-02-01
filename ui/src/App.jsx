import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ProjectsLibrary from './pages/ProjectsLibrary';
import ProjectDetail from './pages/ProjectDetail';
import InsightsExplorer from './pages/InsightsExplorer';
import ActionCenter from './pages/ActionCenter';
import PersonaGallery from './pages/PersonaGallery';
import PersonaDetail from './pages/PersonaDetail';
import CSATDashboard from './pages/CSATDashboard';
import ConnectionsDashboard from './pages/ConnectionsDashboard';
import FeedbackInbox from './pages/FeedbackInbox';
import SuggestionsBoard from './pages/SuggestionsBoard';
import AdminAnalytics from './pages/AdminAnalytics';
import { ShortcutHelp } from './components/ui/kbd';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Register global shortcuts
  useKeyboardShortcuts({
    'cmd+/': () => setShowShortcuts(true),
  });

  return (
    <>
      <ShortcutHelp 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsLibrary />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="insights" element={<InsightsExplorer />} />
        <Route path="actions" element={<ActionCenter />} />
        <Route path="personas" element={<PersonaGallery />} />
        <Route path="personas/:id" element={<PersonaDetail />} />
        <Route path="connections" element={<ConnectionsDashboard />} />
        <Route path="csat" element={<CSATDashboard />} />
        <Route path="feedback" element={<FeedbackInbox />} />
        <Route path="suggestions" element={<SuggestionsBoard />} />
        <Route path="admin/analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;

