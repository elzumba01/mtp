/**
 * Cliente HTTP centralizado. Usa fetch nativo (Vite proxea /api → http://localhost:4000).
 * Inyecta automáticamente el JWT y maneja errores con mensajes legibles.
 */

let _token = null;
export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem('mtp_token', t);
  else localStorage.removeItem('mtp_token');
}
export function getToken() {
  if (_token) return _token;
  _token = localStorage.getItem('mtp_token');
  return _token;
}

async function request(method, url, { body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let payload = body;
  if (body && !isForm) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`/api${url}`, { method, headers, body: payload });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg = (data && data.error) || res.statusText || 'Error de red';
    throw new Error(msg);
  }
  return data;
}
function safeJson(s) { try { return JSON.parse(s); } catch { return s; } }

export const api = {
  get:  (u) => request('GET',  u),
  post: (u, b) => request('POST',  u, { body: b }),
  patch:(u, b) => request('PATCH', u, { body: b }),
  del:  (u) => request('DELETE', u),
  upload: (u, formData) => request('POST', u, { body: formData, isForm: true }),
};
