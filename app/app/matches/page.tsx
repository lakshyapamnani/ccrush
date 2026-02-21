'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { getMatchesForUser, getUserProfile, Match, UserProfile } from '@/lib/firebase'

interface MatchWithProfile {
  match: Match
  otherUser: UserProfile
}

export default function MatchesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [matches, setMatches] = useState<MatchWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        const rawMatches = await getMatchesForUser(user.uid)
        const enriched = await Promise.all(
          rawMatches.map(async (match) => {
            const otherUid = match.users[0] === user.uid ? match.users[1] : match.users[0]
            const otherUser = await getUserProfile(otherUid)
            return otherUser ? { match, otherUser } : null
          })
        )
        setMatches(enriched.filter(Boolean) as MatchWithProfile[])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-brand px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-extrabold text-[#111] mb-1">Matches</h1>
        <p className="text-brand-mutedText font-medium mb-8">
          {matches.length} connection{matches.length !== 1 ? 's' : ''}
        </p>

        {matches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 mt-4">
            <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-brand-pink" />
            </div>
            <h2 className="text-xl font-bold text-[#111] mb-2">No Connections Yet</h2>
            <p className="text-brand-mutedText">
              When you like someone, they'll appear here!
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
                className="bg-white rounded-2xl border border-brand-border overflow-hidden hover:border-brand-pink/50 shadow-sm transition-colors group"
              >
                <button
                  onClick={() => router.push(`/app/chat?matchId=${item.match.id}`)}
                  className="w-full p-4 flex items-center gap-4"
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-pink/20 group-hover:border-brand-pink transition-colors">
                    {item.otherUser.photos?.[0] ? (
                      <img
                        src={item.otherUser.photos[0]}
                        alt={item.otherUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-pink/10 flex items-center justify-center text-xl font-bold text-brand-pink">
                        {item.otherUser.name[0]}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-bold text-[#111]">
                      {item.otherUser.name}, {item.otherUser.age}
                    </h3>
                    <p className="text-sm text-brand-mutedText font-medium truncate">{item.otherUser.course}</p>
                  </div>

                  {/* Chat icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-deep flex items-center justify-center group-hover:bg-brand-pink transition-all">
                    <MessageCircle className="w-5 h-5 text-brand-mutedText group-hover:text-white" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
