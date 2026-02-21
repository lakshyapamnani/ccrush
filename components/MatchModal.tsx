'use client'

import { motion } from 'framer-motion'
import { Heart, MessageCircle } from 'lucide-react'
import { User } from '@/lib/storage'
import { useRouter } from 'next/navigation'

interface MatchModalProps {
  user1: User
  user2: User
  onClose: () => void
}

export default function MatchModal({ user1, user2, onClose }: MatchModalProps) {
  const router = useRouter()

  const handleSendMessage = () => {
    router.push('/app/chat')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.3, opacity: 0, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-brand-cardBg to-brand-deep rounded-2xl p-8 w-full max-w-sm text-center relative overflow-hidden"
      >
        {/* Animated background decoration */}
        <div className="absolute inset-0 bg-gradient-pink/10 blur-3xl" />

        <div className="relative z-10">
          {/* Heart Animation */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-6"
          >
            <Heart className="w-16 h-16 text-brand-pink fill-brand-pink" />
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-2">It's a Match!</h1>
          <p className="text-brand-mutedText mb-8">You and {user2.name} liked each other</p>

          {/* User Avatars */}
          <div className="flex justify-center gap-4 mb-8 relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-pink"
            >
              <img
                src={user1.profilePhoto}
                alt={user1.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <div className="w-12 h-12 rounded-full bg-gradient-pink flex items-center justify-center flex-shrink-0 -mx-2">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-pink"
            >
              <img
                src={user2.profilePhoto}
                alt={user2.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSendMessage}
              className="w-full py-3 rounded-2xl bg-gradient-pink text-white font-semibold hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Send a Message
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl border-2 border-brand-pink text-white font-semibold hover:bg-brand-pink/10 transition-all"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
