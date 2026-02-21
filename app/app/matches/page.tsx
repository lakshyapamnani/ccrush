'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import {
  getCurrentUser,
  getUserMatches,
  getUserById,
  deleteMatch,
  getMatchMessages,
  User,
  Match,
} from '@/lib/storage'

interface MatchWithUser {
  match: Match
  user: User
  lastMessage: string | null
}

export default function MatchesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [matches, setMatches] = useState<MatchWithUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      loadMatches(user.id)
    }
  }, [])

  const loadMatches = (userId: string) => {
    const userMatches = getUserMatches(userId)
    const matchData: MatchWithUser[] = []

    userMatches.forEach((match) => {
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id
      const otherUser = getUserById(otherUserId)

      if (otherUser) {
        const messages = getMatchMessages(match.id)
        const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : null

        matchData.push({
          match,
          user: otherUser,
          lastMessage,
        })
      }
    })

    // Sort by last message time
    matchData.sort((a, b) => b.match.lastMessageTime - a.match.lastMessageTime)
    setMatches(matchData)
    setLoading(false)
  }

  const handleDeleteMatch = (matchId: string) => {
    deleteMatch(matchId)
    setMatches(matches.filter((m) => m.match.id !== matchId))
  }

  const handleOpenChat = (matchId: string) => {
    router.push(`/app/chat?matchId=${matchId}`)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-mutedText">Loading matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-brand px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-2">Your Matches</h1>
        <p className="text-brand-mutedText mb-8">{matches.length} connection{matches.length !== 1 ? 's' : ''}</p>

        {matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-brand-pink/20 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-brand-pink" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Matches Yet</h2>
            <p className="text-brand-mutedText">
              Keep swiping to find your perfect match!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((item, index) => (
              <motion.div
                key={item.match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-brand-cardBg rounded-2xl border border-brand-deep overflow-hidden hover:border-brand-pink transition-colors group"
              >
                <button
                  onClick={() => handleOpenChat(item.match.id)}
                  className="w-full p-4 flex items-center gap-4"
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-pink/50 group-hover:border-brand-pink transition-colors">
                    <img
                      src={item.user.profilePhoto}
                      alt={item.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {item.user.name}
                    </h3>
                    <p className="text-sm text-brand-mutedText truncate">
                      {item.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  {/* Message Icon */}
                  <MessageCircle className="w-5 h-5 text-brand-pink flex-shrink-0" />
                </button>

                {/* Delete Button */}
                <div className="px-4 pb-4 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteMatch(item.match.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
