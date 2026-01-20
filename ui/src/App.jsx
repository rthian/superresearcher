import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ProjectsLibrary from './pages/ProjectsLibrary';
import ProjectDetail from './pages/ProjectDetail';
import InsightsExplorer from './pages/InsightsExplorer';
import ActionCenter from './pages/ActionCenter';
import PersonaGallery from './pages/PersonaGallery';
import FeedbackInbox from './pages/FeedbackInbox';
import SuggestionsBoard from './pages/SuggestionsBoard';
import AdminAnalytics from './pages/AdminAnalytics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsLibrary />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="insights" element={<InsightsExplorer />} />
        <Route path="actions" element={<ActionCenter />} />
        <Route path="personas" element={<PersonaGallery />} />
        <Route path="feedback" element={<FeedbackInbox />} />
        <Route path="suggestions" element={<SuggestionsBoard />} />
        <Route path="admin/analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
}

export default App;

