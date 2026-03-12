import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  userRole: 'user' | 'admin' | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, isAuthReady: false, userRole: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const pendingRole = localStorage.getItem('pendingRole');
        const userRef = doc(db, 'users', currentUser.uid);
        
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const currentRole = userSnap.data().role;
            // For prototype: allow switching roles if a new one was selected at login
            if (pendingRole && pendingRole !== currentRole) {
              try {
                await updateDoc(userRef, { role: pendingRole });
              } catch (err) {
                console.warn("Could not update role in Firestore, but updating in UI:", err);
              }
              setUserRole(pendingRole as 'user' | 'admin');
            } else {
              setUserRole(currentRole as 'user' | 'admin');
            }
          } else {
            // Create new user document
            const roleToSet = pendingRole || 'user';
            const userData: any = {
              uid: currentUser.uid,
              email: currentUser.email,
              role: roleToSet,
              createdAt: serverTimestamp()
            };
            if (currentUser.displayName) userData.displayName = currentUser.displayName;
            if (currentUser.photoURL) userData.photoURL = currentUser.photoURL;
            
            try {
              await setDoc(userRef, userData);
            } catch (err) {
              console.warn("Could not create user in Firestore, but updating in UI:", err);
            }
            setUserRole(roleToSet as 'user' | 'admin');
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          // Fallback to allow login even if DB fails
          setUserRole((pendingRole as 'user' | 'admin') || 'user');
        } finally {
          localStorage.removeItem('pendingRole');
        }
      } else {
        setUserRole(null);
      }
      
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthReady, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};
