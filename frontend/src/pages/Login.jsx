import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    try {
      await login(loginInput, senha);
      navigate('/');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <h1>Tatame BJJ</h1>
        <p>Sistema de Gestão para Academia de Jiu-Jitsu</p>
        <label>Usuário (CPF ou login)</label>
        <input value={loginInput} onChange={(e) => setLoginInput(e.target.value)} />
        <label>Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        {erro && <div className="alert alert-danger">{erro}</div>}
        <button className="btn btn-primary" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="login-hint">
          <b>Demonstração:</b> admin/123456, professor/123456, aluno/123456
        </div>
      </form>
    </div>
  );
}