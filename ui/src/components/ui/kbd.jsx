/**
 * Keyboard shortcut display component
 */
export function Kbd({ children, className = '' }) {
  return (
    <kbd className={`px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded ${className}`}>
      {children}
    </kbd>
  );
}

/**
 * Shortcut help overlay
 */
export function ShortcutHelp({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Open global search' },
    { keys: ['⌘', 'N'], description: 'Create new project' },
    { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
    { keys: ['Esc'], description: 'Close modals' },
    { keys: ['↑', '↓'], description: 'Navigate results' },
    { keys: ['↵'], description: 'Select item' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-gray-700">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <Kbd key={i}>{key}</Kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full btn btn-secondary"
        >
          Close
        </button>
      </div>
    </div>
  );
}

