/*import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserInfo {
    uid: string;
    email: string;
    name?: string;
    surname?: string;
}

interface AuthContextType {
    user: UserInfo | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const docRef = doc(db, 'users', firebaseUser.uid);
                const docSnap = await getDoc(docRef);
                const data = docSnap.data();

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email ?? '',
                    name: data?.name ?? '',
                    surname: data?.surname ?? '',
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};*/

///yeniiii
/*
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface UserInfo {
    uid: string;
    name: string;
    surname: string;
    email: string;
    age?: string;
    profession?: string;
    disease?: string;
}

interface AuthContextType {
    user: UserInfo | null;
    loading: boolean;
    updateUserInfo: (userInfo: Partial<UserInfo>) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userDocRef);

                const data = userSnap.data();

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email ?? '',
                    name: data?.name ?? '',
                    surname: data?.surname ?? '',
                    age: data?.age ?? '',
                    profession: data?.profession ?? '',
                    disease: data?.disease ?? '',
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateUserInfo = async (userInfo: Partial<UserInfo>) => {
        if (user?.uid) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, userInfo);
            setUser({ ...user, ...userInfo });
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, updateUserInfo, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
*/


import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface UserInfo {
    uid: string;
    name: string;
    surname: string;
    email: string;
    age?: string;
    profession?: string;
    disease?: string;
}

interface AuthContextType {
    user: UserInfo | null;
    loading: boolean;
    updateUserInfo: (userInfo: Partial<UserInfo>) => Promise<void>;
    logout: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userDocRef);
                const data = userSnap.data();
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email ?? '',
                    name: data?.name ?? '',
                    surname: data?.surname ?? '',
                    age: data?.age ?? '',
                    profession: data?.profession ?? '',
                    disease: data?.disease ?? '',
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const updateUserInfo = async (userInfo: Partial<UserInfo>) => {
        if (user?.uid) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, userInfo);
            setUser({ ...user, ...userInfo });
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, updateUserInfo, logout, signOut: logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};