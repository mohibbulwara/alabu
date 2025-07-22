
'use client';

import { createContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { auth, db, googleProvider } from '@/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, phone: string, pass: string, role: 'buyer' | 'seller', sellerDetails?: { shopName: string; shopAddress: string }) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserDoc = useCallback(async (firebaseUser: import('firebase/auth').User | null) => {
    if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ id: firebaseUser.uid, ...userDocSnap.data() } as User);
        } else {
          // This case handles users created via Google Sign-In who might not have a doc yet
          // Let's create one for them.
          const { displayName, email, photoURL } = firebaseUser;
          if (email && displayName) {
             const userData: Omit<User, 'id'> = {
                name: displayName,
                email: email,
                role: 'buyer',
                avatar: photoURL || `https://placehold.co/100x100.png?text=${displayName.charAt(0)}`,
                createdAt: serverTimestamp(),
              };
              await setDoc(doc(db, "users", firebaseUser.uid), userData);
              setUser({ id: firebaseUser.uid, ...userData } as User);
          } else {
             setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await fetchUserDoc(firebaseUser);
    });
    return () => unsubscribe();
  }, [fetchUserDoc]);

  const refreshUser = useCallback(async () => {
    await fetchUserDoc(auth.currentUser);
  }, [fetchUserDoc]);

  const login = useCallback(async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: 'destructive' });
      return false;
    }
  }, [toast]);
  
  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // The onAuthStateChanged listener will handle the user doc creation/fetching.
      return true;
    } catch (error: any) {
      toast({ title: "Google Sign-In Failed", description: error.message, variant: 'destructive' });
      return false;
    }
  }, [toast]);


  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      toast({ title: "Logout Failed", description: error.message, variant: 'destructive' });
    }
  }, [toast]);

  const register = useCallback(async (name: string, email: string, phone: string, pass: string, role: 'buyer' | 'seller', sellerDetails?: { shopName: string; shopAddress: string }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      const userData: Omit<User, 'id'> = {
        name,
        email,
        phone,
        role,
        avatar: `https://placehold.co/100x100.png?text=${name.charAt(0)}`,
        createdAt: serverTimestamp(),
      };
      
      if (role === 'seller') {
          userData.shopName = sellerDetails?.shopName;
          userData.shopAddress = sellerDetails?.shopAddress;
          userData.planType = 'pro'; // All new sellers get pro plan
          userData.productUploadCount = 0;
          userData.deliveredOrderCount = 0;
      }

      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      
      return true;
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: 'destructive' });
      return false;
    }
  }, [toast]);

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch(error: any) {
        toast({ title: "Password Reset Failed", description: error.message, variant: 'destructive' });
        return false;
    }
  }, [toast]);

  const isAuthenticated = !!user;

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    loginWithGoogle,
    logout,
    register,
    sendPasswordReset,
    refreshUser,
  }), [user, isAuthenticated, loading, login, loginWithGoogle, logout, register, sendPasswordReset, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
