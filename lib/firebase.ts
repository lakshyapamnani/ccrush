import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { getDatabase, ref, set, get } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCJ0nwpVjY2aH41xNdGeuaRFaOmIBKK378',
  authDomain: 'collegecrush-69b8b.firebaseapp.com',
  databaseURL: 'https://collegecrush-69b8b-default-rtdb.firebaseio.com',
  projectId: 'collegecrush-69b8b',
  storageBucket: 'collegecrush-69b8b.firebasestorage.app',
  messagingSenderId: '187089416761',
  appId: '1:187089416761:web:a47e773825b13e9ae313e8',
  measurementId: 'G-PJWFQ095J8',
}

// Initialize Firebase (prevent duplicate init in Next.js hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getDatabase(app)

const googleProvider = new GoogleAuthProvider()

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export async function signOut() {
  return firebaseSignOut(auth)
}

export { onAuthStateChanged }
export type { FirebaseUser }

// ── Profile helpers ───────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string
  email: string
  name: string
  age: number
  bio: string
  course: string
  photos: string[] // Cloudinary URLs; index 0 is required
  createdAt: number
}

export async function saveUserProfile(uid: string, profile: Omit<UserProfile, 'uid'>): Promise<void> {
  await set(ref(db, `users/${uid}/profile`), profile)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await get(ref(db, `users/${uid}/profile`))
  if (snapshot.exists()) {
    return { uid, ...snapshot.val() } as UserProfile
  }
  return null
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const snapshot = await get(ref(db, 'users'))
  if (!snapshot.exists()) return []

  const profiles: UserProfile[] = []
  snapshot.forEach((child) => {
    const profileData = child.val()?.profile
    if (profileData && profileData.name) {
      profiles.push({ uid: child.key as string, ...profileData })
    }
  })
  return profiles
}
