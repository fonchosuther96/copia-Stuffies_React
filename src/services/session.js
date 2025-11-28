// src/services/session.js
export const getSession = () =>
  JSON.parse(localStorage.getItem("stuffies_session") || "null");

export const setSession = (data) =>
  localStorage.setItem("stuffies_session", JSON.stringify(data));

export const clearSession = () =>
  localStorage.removeItem("stuffies_session");
