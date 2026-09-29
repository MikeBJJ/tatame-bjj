const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export function getToken() {
  return localStorage.getItem('tbjj_token');
}

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

export const authApi = {
  login: (login, senha) => api('/auth/login', { method: 'POST', body: { login, senha } })
};