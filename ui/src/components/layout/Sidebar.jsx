import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiFolder, 
  FiZap, 
  FiCheckSquare, 
  FiUsers,
  FiLink,
  FiBarChart2,
  FiMessageSquare,
  FiTrendingUp,
  FiTarget,
  FiGlobe,
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Projects', href: '/projects', icon: FiFolder },
  { name: 'Insights', href: '/insights', icon: FiZap },
  { name: 'Actions', href: '/actions', icon: FiCheckSquare },
  { name: 'Personas', href: '/personas', icon: FiUsers },
  { name: 'Connections', href: '/connections', icon: FiLink },
  { name: 'CSAT & NPS', href: '/csat', icon: FiBarChart2 },
  { name: 'ROI Tracker', href: '/roi', icon: FiTarget },
  { name: 'Competitive Intel', href: '/competitive', icon: FiGlobe },
  { name: 'Feedback', href: '/feedback', icon: FiMessageSquare, badge: 0 },
  { name: 'Suggestions', href: '/suggestions', icon: FiTrendingUp },
];

function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">SuperResearcher</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
            {item.badge > 0 && (
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">Version 1.0.0</p>
      </div>
    </div>
  );
}

export default Sidebar;

