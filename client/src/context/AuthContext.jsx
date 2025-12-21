import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null); // DB user
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔥 1. Listen to Firebase login/logout in REAL TIME
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      setFirebaseUser(fbUser);
      setUser(null);

      if (fbUser) {
        // 🔥 Auto-refreshes token automatically
        const token = await fbUser.getIdToken();

        try {
          const res = await axiosInstance.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data.user);
        } catch (err) {
          console.error("Backend user fetch failed", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 2. Logout (Firebase + backend)
  const logout = async () => {
    await signOut(auth); // Clears firebase token
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, user, setUser, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
