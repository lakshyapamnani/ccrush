'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export default function LandingPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      if (profile) {
        router.push('/app/home')
      } else {
        router.push('/auth/profile-setup')
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-brand flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-brand flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-8 max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative w-20 h-20 bg-gradient-pink rounded-full flex items-center justify-center shadow-glow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold text-white text-center">College Crush</h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg text-center text-brand-mutedText"
        >
          Where campus hearts connect
        </motion.p>

        {/* Divider */}
        <div className="w-12 h-1 bg-gradient-pink rounded-full" />

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col gap-3 w-full"
        >
          <button
            onClick={() => router.push('/auth/signup')}
            className="w-full py-4 rounded-2xl font-semibold text-lg text-white bg-gradient-pink hover:shadow-glow transition-shadow duration-300"
          >
            Sign Up
          </button>

          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-4 rounded-2xl font-semibold text-lg text-white border-2 border-brand-pink hover:bg-brand-pink/10 transition-colors duration-300"
          >
            Log In
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-sm text-center text-brand-mutedText mt-4"
        >
          Swipe, Connect, and Find Your Campus Match
        </motion.p>
      </motion.div>
    </div>
  )
}
