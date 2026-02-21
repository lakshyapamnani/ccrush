'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import {
  getMatchesForUser,
  getUserProfile,
  sendMessage,
  subscribeToMessages,
  Match,
  UserProfile,
  ChatMessage,
} from '@/lib/firebase'

interface ConvItem {
  matchId: string
  otherUser: UserProfile
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMatchId = searchParams.get('matchId')
  const { user } = useAuth()

  const [convs, setConvs] = useState<ConvItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialMatchId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load all matches
  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        const rawMatches = await getMatchesForUser(user.uid)
        const items = await Promise.all(
          rawMatches.map(async (m: Match) => {
            const otherUid = m.users[0] === user.uid ? m.users[1] : m.users[0]
            const profile = await getUserProfile(otherUid)
            return profile ? { matchId: m.id, otherUser: profile } : null
          })
        )
        const filtered = items.filter(Boolean) as ConvItem[]
        setConvs(filtered)

        // Auto-select from URL or first
        const toSelect = initialMatchId ?? filtered[0]?.matchId ?? null
        setSelectedId(toSelect)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, initialMatchId])

  // Subscribe to messages for selected match
  useEffect(() => {
    if (!selectedId) return
    const conv = convs.find((c) => c.matchId === selectedId)
    setOtherUser(conv?.otherUser ?? null)

    const unsub = subscribeToMessages(selectedId, (msgs) => {
      setMessages(msgs)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })
    return unsub
  }, [selectedId, convs])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedId || !text.trim()) return
    await sendMessage(selectedId, user.uid, text.trim())
    setText('')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    )
  }

  if (convs.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">No Matches Yet</h2>
        <p className="text-brand-mutedText">Match with someone first to start chatting!</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-brand">
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex md:w-1/3 border-r border-brand-deep flex-col">
          <div className="p-4 border-b border-brand-deep">
            <h2 className="text-lg font-bold text-white">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {convs.map((c) => (
              <button key={c.matchId} onClick={() => setSelectedId(c.matchId)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${selectedId === c.matchId ? 'bg-brand-pink/20 border border-brand-pink' : 'hover:bg-white/5'
                  }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-brand-pink/50">
                  {c.otherUser.photos?.[0]
                    ? <img src={c.otherUser.photos[0]} alt={c.otherUser.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-brand-deep flex items-center justify-center text-white font-bold">{c.otherUser.name[0]}</div>
                  }
                </div>
                <p className="font-semibold text-white truncate">{c.otherUser.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {selectedId && otherUser ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-deep bg-brand-cardBg">
              <button onClick={() => router.back()} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-pink flex-shrink-0">
                {otherUser.photos?.[0]
                  ? <img src={otherUser.photos[0]} alt={otherUser.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-brand-deep flex items-center justify-center text-white font-bold">{otherUser.name[0]}</div>
                }
              </div>
              <div>
                <p className="font-semibold text-white">{otherUser.name}</p>
                <p className="text-xs text-brand-pink">Matched ✨</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-brand-mutedText text-sm">Say hi to {otherUser.name}! 👋</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderUid === user?.uid
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe
                        ? 'bg-gradient-pink text-white rounded-br-none'
                        : 'bg-brand-cardBg text-white rounded-bl-none border border-brand-deep'
                      }`}>
                      <p className="break-words">{msg.text}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-brand-mutedText'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-brand-deep bg-brand-cardBg">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message ${otherUser.name}...`}
                  className="flex-1 px-4 py-3 rounded-2xl bg-brand-deep border border-brand-deep text-white placeholder-brand-mutedText focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all"
                />
                <button type="submit" disabled={!text.trim()}
                  className="p-3 rounded-full bg-gradient-pink text-white hover:shadow-glow disabled:opacity-50 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-brand-mutedText">
            Select a match to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
