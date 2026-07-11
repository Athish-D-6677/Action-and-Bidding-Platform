import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth, googleProvider } from '../firebase';
import { setCredentials, logout } from '../store';
import api from '../api';

export function useFirebaseAuth() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result   = await signInWithPopup(auth, googleProvider);
      const idToken  = await result.user.getIdToken();

      // Exchange Firebase ID token for a backend JWT
      const { data } = await api.post('/auth/firebase', { idToken });
      dispatch(setCredentials(data));
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Google sign-in failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const firebaseLogout = async () => {
    await signOut(auth);
    dispatch(logout());
  };

  return { signInWithGoogle, firebaseLogout, loading, error };
}
