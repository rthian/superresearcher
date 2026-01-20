import { useEffect } from 'react';

/**
 * Hook for registering keyboard shortcuts
 * @param {Object} shortcuts - Map of key combos to handlers
 * @example
 * useKeyboardShortcuts({
 *   'cmd+k': () => openSearch(),
 *   'cmd+n': () => createNew(),
 * })
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? event.metaKey : event.ctrlKey;
      
      // Build the key combination string
      let combo = [];
      if (cmdKey) combo.push('cmd');
      if (event.shiftKey) combo.push('shift');
      if (event.altKey) combo.push('alt');
      
      // Add the main key (lowercase)
      const key = event.key.toLowerCase();
      if (!['meta', 'control', 'shift', 'alt'].includes(key)) {
        combo.push(key);
      }
      
      const comboString = combo.join('+');
      
      // Check if we have a handler for this combo
      if (shortcuts[comboString]) {
        event.preventDefault();
        shortcuts[comboString](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

