'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, getUserProfile, onAuthStateChanged, type FirebaseUser, type UserProfile } from './firebase'

interface AuthContextType {
    user: FirebaseUser | null
    profile: UserProfile | null
    loading: boolean
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    refreshProfile: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const loadProfile = async (uid: string) => {
        try {
            const p = await getUserProfile(uid)
            setProfile(p)
        } catch {
            setProfile(null)
        }
    }

    const refreshProfile = async () => {
        if (user) await loadProfile(user.uid)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser)
            if (firebaseUser) {
                await loadProfile(firebaseUser.uid)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })
        return unsubscribe
    }, [])

    return (
        <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
