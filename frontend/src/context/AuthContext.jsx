import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we know if a saved token is valid

  // On first load, if a token is saved, ask the backend who it belongs to.
  useEffect(() => {
    if (!api.getToken()) {
      setLoading(false);
      return;
    }
    api.getMe()
      .then((data) => setUser(data.user))
      .catch(() => api.clearToken())
      .finally(() => setLoading(false));
  }, []);

  // Log out if any API call reports an expired token.
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("focusai:unauthorized", handler);
    return () => window.removeEventListener("focusai:unauthorized", handler);
  }, []);

  const completeAuth = useCallback((data) => {
    api.setToken(data.token);
    setUser(data.user);
  }, []);

  const login = async (email, password) => completeAuth(await api.loginUser(email, password));
  const register = async (name, email, password) =>
    completeAuth(await api.registerUser(name, email, password));
  const googleLogin = async (credential) => completeAuth(await api.googleLogin(credential));
  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}