import { createContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, signupUser } from "../services/authService";
import { connectSocket, disconnectSocket } from "../services/socket";
import i18n from "../i18n";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyUserSession = (userData) => {
    localStorage.setItem("language", userData.preferredLanguage || "en");
    i18n.changeLanguage(userData.preferredLanguage || "en");
    setUser(userData);
    
    // Connect WebSocket when user logs in
    if (userData?.accessToken) {
      connectSocket(userData.accessToken);
    }
  };

  const signup = async (payload) => {
    const userData = await signupUser(payload);
    applyUserSession(userData);
    return userData;
  };

  const login = async (payload) => {
    const userData = await loginUser(payload);
    applyUserSession(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (_error) {
      // Clear local UI state even if the cookie is already gone.
    }
    disconnectSocket();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      applyUserSession({
        ...(user || {}),
        ...currentUser
      });
      return currentUser;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const currentUser = await getCurrentUser();
        applyUserSession(currentUser);
      } catch (_error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        refreshUser,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
