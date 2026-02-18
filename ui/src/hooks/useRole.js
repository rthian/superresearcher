import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../api/auth.js';

const RoleContext = createContext({ role: 'admin', isViewer: false, isAdmin: true });

export function RoleProvider({ children }) {
  const [role, setRole] = useState('admin');

  useEffect(() => {
    authAPI.getRole()
      .then((data) => setRole(data.role || 'admin'))
      .catch(() => setRole('admin'));
  }, []);

  const value = {
    role,
    isViewer: role === 'viewer',
    isAdmin: role === 'admin',
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
