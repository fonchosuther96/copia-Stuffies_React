// src/services/apiClient.js

const API_BASE_URL = "http://localhost:8080"; // mismo puerto que Spring Boot

function getSessionToken() {
  try {
    const raw = localStorage.getItem("stuffies_session");
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.token || null;
  } catch {
    return null;
  }
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getSessionToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Error ${res.status} ${res.statusText} - ${
        errText || "Error en la API"
      }`
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

export const apiClient = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  del: (path) => request("DELETE", path),
};
