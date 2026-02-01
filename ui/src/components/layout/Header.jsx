import { useState } from 'react';
import { FiSearch, FiBell, FiUser } from 'react-icons/fi';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import GlobalSearch from '../search/GlobalSearch';

function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Register Cmd+K shortcut
  useKeyboardShortcuts({
    'cmd+k': () => setIsSearchOpen(true),
  });

  return (
    <>
      <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
        <div className="flex items-center flex-1 max-w-2xl">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="relative w-full"
          >
            <div className="flex items-center w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
              <FiSearch className="mr-3 text-gray-400 w-5 h-5" />
              <span className="text-gray-500">Search projects, insights, actions...</span>
              <kbd className="ml-auto px-2 py-1 text-xs bg-gray-100 rounded border border-gray-300">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>
      
      <div className="flex items-center gap-4 ml-6">
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <FiBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <FiUser className="w-4 h-4 text-primary-700" />
          </div>
          <span className="text-sm font-medium">User</span>
        </button>
      </div>
    </header>
    
    <GlobalSearch 
      isOpen={isSearchOpen} 
      onClose={() => setIsSearchOpen(false)} 
    />
    </>
  );
}

export default Header;

