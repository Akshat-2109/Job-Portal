// Base URL of the backend, configured per environment (see .env.example).
// Falls back to the local dev server.
const SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

const API_ROOT = `${SERVER_URL}/api/v1`;

export const API_BASE_URL = `${API_ROOT}/user`;
export const JOB_API_END_POINT = `${API_ROOT}/job`;
export const APPLICATION_API_END_POINT = `${API_ROOT}/application`;
export const COMPANY_API_END_POINT = `${API_ROOT}/company`;
export const COMPANY_UPDATE_API_END_POINT = `${COMPANY_API_END_POINT}/update`;
