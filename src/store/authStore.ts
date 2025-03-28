import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../config/firebase';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const token = await userCredential.user.getIdToken();
          set({ user: userCredential.user, token });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const token = await userCredential.user.getIdToken();
          set({ user: userCredential.user, token });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          await firebaseSignOut(auth);
          set({ user: null, token: null });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      setUser: (user) => set({ user }),

      fetchToken: async () => {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          set({ token });
        }
      }
    }),
    {
      name: 'auth-storage', // Key for localStorage
      getStorage: () => localStorage
    }
  )
);

// Sync Firebase Auth with Zustand Store
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken();
    useAuthStore.setState({ user, token });
  } else {
    useAuthStore.setState({ user: null, token: null });
  }
});
