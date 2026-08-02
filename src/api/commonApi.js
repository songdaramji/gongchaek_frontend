export const API_SERVER_HOST = (
  import.meta.env.VITE_API_SERVER_HOST || "http://localhost:8080"
).replace(/\/$/, "");
