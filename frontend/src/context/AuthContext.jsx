import { createContext, useContext, useState } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('tbjj_user') || 'null')
  );

  async function login(login, senha) {
    const data = await authApi.login(login, senha);
    localStorage.setItem('tbjj_token', data.token);
    localStorage.setItem('tbjj_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('tbjj_token');
    localStorage.removeItem('tbjj_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);