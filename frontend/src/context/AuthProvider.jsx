import { useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  // load user and token from localStorage so the user stays logged in on page refresh
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // function to log in the user and save their data and token to state and localStorage
  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  // function to log out the user and clear their data and token from state and localStorage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // function to update the user data in state and localStorage
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
