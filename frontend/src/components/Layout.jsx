import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Tatame BJJ</div>
        <nav>
          <button onClick={() => navigate('/')}>Dashboard</button>
          {/* itens de menu por perfil entram no passo 3 */}
        </nav>
        <div className="sidebar-foot">
          <strong>{user?.nome}</strong>
          <span>{user?.perfil}</span>
          <button onClick={sair}>Sair</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}