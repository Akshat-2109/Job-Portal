import axios from "axios";

import { clearUser } from "@/redux/authSlice";

/**
 * If the server says the session is invalid or expired (401) while the UI
 * still thinks the user is logged in, clear the stored user so the app
 * returns to the logged-out state instead of showing broken screens.
 */
const setupAxios = (store) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const { user } = store.getState().auth;

      if (status === 401 && user) {
        store.dispatch(clearUser());
      }

      return Promise.reject(error);
    },
  );
};

export default setupAxios;
