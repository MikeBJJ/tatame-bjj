import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [saude, setSaude] = useState(null);

  useEffect(() => {
    api('/health').then(setSaude).catch(() => setSaude({ status: 'offline' }));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Bem-vindo, {user?.nome} ({user?.perfil})</p>
      <p>API: {saude ? saude.status : 'verificando...'}</p>
    </div>
  );
}