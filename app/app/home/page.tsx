'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Zap, AlertTriangle } from 'lucide-react'
import {
  getAllUserProfiles,
  UserProfile,
  recordSwipe,
  getSwipeAction,
  createMatch,
} from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import SwipeCard from '@/components/SwipeCard'

export default function HomePage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matchFlash, setMatchFlash] = useState<string | null>(null)

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const all = await getAllUserProfiles()
        const others = all.filter((p) => p.uid !== user?.uid)
        setProfiles(others)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    if (user) loadProfiles()
  }, [user])

  const nextCard = () => setCurrentIndex((prev) => prev + 1)

  const handlePass = async () => {
    const target = profiles[currentIndex]
    if (user && target) {
      await recordSwipe(user.uid, target.uid, 'pass')
    }
    nextCard()
  }

  const handleLike = async () => {
    const target = profiles[currentIndex]
    if (user && target) {
      await recordSwipe(user.uid, target.uid, 'like')
      // Check if target already liked current user → mutual match
      const theirAction = await getSwipeAction(target.uid, user.uid)
      if (theirAction === 'like' || theirAction === 'super-like') {
        await createMatch(user.uid, target.uid)
        setMatchFlash(target.name)
        setTimeout(() => setMatchFlash(null), 2500)
      }
    }
    nextCard()
  }

  const handleSuperLike = async () => {
    const target = profiles[currentIndex]
    if (user && target) {
      await recordSwipe(user.uid, target.uid, 'super-like')
      const theirAction = await getSwipeAction(target.uid, user.uid)
      if (theirAction === 'like' || theirAction === 'super-like') {
        await createMatch(user.uid, target.uid)
        setMatchFlash(target.name)
        setTimeout(() => setMatchFlash(null), 2500)
      }
    }
    nextCard()
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-mutedText">Loading profiles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Could not load profiles</h2>
        <p className="text-brand-mutedText text-sm mb-4">{error}</p>
        <p className="text-xs text-brand-mutedText">
          Update Firebase Rules: <span className="text-brand-pink">Realtime Database → Rules</span> and set{' '}
          <code className="bg-brand-cardBg px-1 rounded">{'"users": {".read": "auth != null"}'}</code>
        </p>
      </div>
    )
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-pink/20 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-brand-pink" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {profiles.length === 0 ? 'No Profiles Yet' : "You're All Caught Up!"}
        </h2>
        <p className="text-brand-mutedText mb-8">
          {profiles.length === 0
            ? 'Be the first — invite friends to join!'
            : "You've reviewed everyone. Check back later!"}
        </p>
        {currentIndex >= profiles.length && profiles.length > 0 && (
          <button onClick={() => setCurrentIndex(0)}
            className="px-6 py-3 rounded-2xl bg-gradient-pink text-white font-semibold hover:shadow-glow transition-all">
            Start Over
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-brand flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* Match flash banner */}
      <AnimatePresence>
        {matchFlash && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-0 right-0 flex justify-center z-50"
          >
            <div className="bg-gradient-pink text-white font-bold px-6 py-3 rounded-2xl shadow-glow-lg text-center">
              🎉 It's a Match with {matchFlash}! Check your Matches tab.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Discover</h1>
          <p className="text-brand-mutedText">Swipe to find your match</p>
        </div>

        <div className="w-full h-96 mb-8">
          <AnimatePresence mode="wait">
            {profiles[currentIndex] && (
              <SwipeCard
                key={profiles[currentIndex].uid}
                profile={profiles[currentIndex]}
                onPass={handlePass}
                onLike={handleLike}
                onSuperLike={handleSuperLike}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-4 justify-center">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePass}
            className="w-16 h-16 rounded-full bg-brand-cardBg border-2 border-brand-deep hover:border-brand-mutedText flex items-center justify-center text-white transition-colors">
            <X className="w-6 h-6" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleSuperLike}
            className="w-16 h-16 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/50 flex items-center justify-center text-blue-400 transition-colors">
            <Zap className="w-6 h-6" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleLike}
            className="w-16 h-16 rounded-full bg-gradient-pink hover:shadow-glow-lg flex items-center justify-center text-white transition-all">
            <Heart className="w-6 h-6 fill-white" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
