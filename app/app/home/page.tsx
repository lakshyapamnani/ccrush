'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Zap } from 'lucide-react'
import {
  getCurrentUser,
  getAvailableProfiles,
  recordSwipe,
  getMatch,
  createMatch,
  saveMatch,
  calculateMatchPercentage,
  User,
} from '@/lib/storage'
import SwipeCard from '@/components/SwipeCard'
import MatchModal from '@/components/MatchModal'

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [profiles, setProfiles] = useState<User[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchedUser, setMatchedUser] = useState<User | null>(null)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      const available = getAvailableProfiles(user.id)
      setProfiles(available)
      setLoading(false)
    }
  }, [])

  const handlePass = () => {
    if (currentUser && profiles[currentIndex]) {
      recordSwipe(currentUser.id, profiles[currentIndex].id, 'pass')
      nextCard()
    }
  }

  const handleLike = () => {
    if (currentUser && profiles[currentIndex]) {
      const targetUser = profiles[currentIndex]
      recordSwipe(currentUser.id, targetUser.id, 'like')

      // Check for mutual match
      const existingMatch = getMatch(currentUser.id, targetUser.id)
      if (!existingMatch) {
        // Check if target user has already liked current user
        const { getUserSwipes, getSwipeAction } = require('@/lib/storage')
        const targetSwipes = getUserSwipes(targetUser.id)
        const targetAction = getSwipeAction(targetUser.id, currentUser.id)

        if (targetAction === 'like') {
          // Mutual match!
          const newMatch = createMatch(currentUser.id, targetUser.id)
          saveMatch(newMatch)
          setMatchedUser(targetUser)
          setShowMatchModal(true)
        }
      }

      nextCard()
    }
  }

  const handleSuperLike = () => {
    if (currentUser && profiles[currentIndex]) {
      const targetUser = profiles[currentIndex]
      recordSwipe(currentUser.id, targetUser.id, 'super-like')

      // Check for any match (super-like always matches)
      const existingMatch = getMatch(currentUser.id, targetUser.id)
      if (!existingMatch) {
        const newMatch = createMatch(currentUser.id, targetUser.id)
        saveMatch(newMatch)
        setMatchedUser(targetUser)
        setShowMatchModal(true)
      }

      nextCard()
    }
  }

  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1)
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

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-brand-mutedText">Loading...</p>
      </div>
    )
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-pink/20 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-brand-pink" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No More Profiles</h2>
        <p className="text-brand-mutedText mb-8">
          You've reviewed all available profiles. Check back later for new matches!
        </p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="px-6 py-3 rounded-2xl bg-gradient-pink text-white font-semibold hover:shadow-glow transition-all"
        >
          Start Over
        </button>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]
  const matchPercentage = calculateMatchPercentage(currentUser, currentProfile)

  return (
    <div className="min-h-screen bg-gradient-brand flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Discover</h1>
          <p className="text-brand-mutedText">Swipe to find your match</p>
        </div>

        {/* Card Stack */}
        <div className="w-full h-96 mb-8">
          <AnimatePresence mode="wait">
            {currentProfile && (
              <SwipeCard
                key={currentProfile.id}
                profile={currentProfile}
                matchPercentage={matchPercentage}
                onPass={handlePass}
                onLike={handleLike}
                onSuperLike={handleSuperLike}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-brand-cardBg border-2 border-brand-deep hover:border-brand-mutedText flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSuperLike}
            className="w-16 h-16 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/50 flex items-center justify-center text-blue-400 transition-colors"
          >
            <Zap className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-gradient-pink hover:shadow-glow-lg flex items-center justify-center text-white transition-all"
          >
            <Heart className="w-6 h-6 fill-white" />
          </motion.button>
        </div>
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatchModal && matchedUser && (
          <MatchModal
            user1={currentUser}
            user2={matchedUser}
            onClose={() => {
              setShowMatchModal(false)
              nextCard()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
