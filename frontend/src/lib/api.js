export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const getToken = () => localStorage.getItem('nexus_admin_token');
export const setToken = (t) => localStorage.setItem('nexus_admin_token', t);
export const clearToken = () => localStorage.removeItem('nexus_admin_token');

export async function apiFetch(path, { method = 'GET', body, formData, auth = false } = {}) {
  const headers = {};
  if (auth) headers.Authorization = `Bearer ${getToken()}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData ?? (body ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401 && auth) {
    clearToken();
    window.location.href = '/admin';
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.error || `Request failed (${res.status})`);
  return data;
}
