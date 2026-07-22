import { useState, useEffect } from "react";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "../firebase.js";

/**
 * useAuth Hook
 * ─────────────────
 * Single source of truth for Firebase auth state.
 * Automatically refreshes ID tokens before they expire.
 * 
 * Usage:
 *   const { user, loading, token, getFreshToken } = useAuth();
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Get fresh token immediately
        const freshToken = await firebaseUser.getIdToken(true);
        setToken(freshToken);
        localStorage.setItem("token", freshToken);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Get a fresh token (forces refresh, useful before API calls)
   */
  const getFreshToken = async () => {
    if (!auth.currentUser) return null;
    const fresh = await auth.currentUser.getIdToken(true);
    setToken(fresh);
    localStorage.setItem("token", fresh);
    return fresh;
  };

  /**
   * Get current token (may be cached, no network request)
   */
  const getCurrentToken = async () => {
    if (!auth.currentUser) return null;
    const current = await auth.currentUser.getIdToken(false);
    setToken(current);
    localStorage.setItem("token", current);
    return current;
  };

  return {
    user,
    loading,
    token,
    getFreshToken,
    getCurrentToken,
    isAuthenticated: !!user,
    uid: user?.uid || null,
    email: user?.email || null,
    displayName: user?.displayName || null,
  };
}

export default useAuth;