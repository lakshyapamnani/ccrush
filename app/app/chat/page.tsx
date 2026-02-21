'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, MoreVertical, Plus, Smile, Heart } from 'lucide-react'
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
  const [isSending, setIsSending] = useState(false)
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
    if (!user || !selectedId || !text.trim() || isSending) return
    setIsSending(true)
    try {
      await sendMessage(selectedId, user.uid, text.trim())
      setText('')
    } catch (err) {
      console.error('Failed to send:', err)
    } finally {
      setIsSending(false)
    }
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
    <div className="h-[100dvh] flex flex-col bg-brand-deep overflow-hidden">
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar — hidden on mobile if chat is selected */}
        <div className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-white/5 flex-col bg-brand-deep`}>
          <div className="p-4 border-b border-white/5 bg-brand-deep/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Chats</h2>
            <MoreVertical className="w-5 h-5 text-brand-mutedText cursor-pointer hover:text-white transition-colors" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {convs.map((c) => (
              <button key={c.matchId} onClick={() => setSelectedId(c.matchId)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${selectedId === c.matchId ? 'bg-brand-pink/20' : 'hover:bg-white/5'}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-pink/20 p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {c.otherUser.photos?.[0]
                      ? <img src={c.otherUser.photos[0]} alt={c.otherUser.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-brand-pink/30 flex items-center justify-center text-white font-bold">{c.otherUser.name[0]}</div>
                    }
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-white truncate">{c.otherUser.name}</p>
                    <span className="text-[10px] text-brand-mutedText">12:34 PM</span>
                  </div>
                  <p className="text-sm text-brand-mutedText truncate">Tap to chat ✨</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {selectedId && otherUser ? (
          <div className={`${selectedId ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col bg-[#2B0F1E]`}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-brand-deep/80 backdrop-blur-md sticky top-0 z-10">
              <button onClick={() => setSelectedId(null)} className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-pink/30 p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {otherUser.photos?.[0]
                    ? <img src={otherUser.photos[0]} alt={otherUser.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-brand-pink/30 flex items-center justify-center text-white font-bold">{otherUser.name[0]}</div>
                  }
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white leading-tight">{otherUser.name}</p>
                <p className="text-[10px] text-brand-pink animate-pulse">online</p>
              </div>
              <MoreVertical className="w-5 h-5 text-brand-mutedText cursor-pointer hover:text-white transition-colors" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative" style={{
              backgroundImage: 'radial-gradient(rgba(235, 78, 142, 0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                  <div className="p-4 rounded-full bg-brand-pink/10">
                    <Heart className="w-8 h-8 text-brand-pink" />
                  </div>
                  <p className="text-brand-mutedText text-sm">You matched with each other ✨</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.senderUid === user?.uid
                const showAvatar = !isMe && (idx === 0 || messages[idx - 1]?.senderUid !== msg.senderUid)

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                  >
                    {!isMe && (
                      <div className="w-6 h-6 flex-shrink-0">
                        {showAvatar && (
                          <img src={otherUser.photos?.[0]} className="w-full h-full rounded-full object-cover border border-brand-pink/20" />
                        )}
                      </div>
                    )}
                    <div className={`relative max-w-[80%] px-4 py-2.5 shadow-lg group ${isMe
                      ? 'bg-brand-pink text-white rounded-2xl rounded-tr-none'
                      : 'bg-brand-cardBg text-white rounded-2xl rounded-tl-none border border-white/5'
                      }`}>
                      {/* Tail for WhatsApp bubble look */}
                      <div className={`absolute top-0 w-3 h-3 ${isMe
                        ? '-right-1.5 bg-brand-pink clip-path-tail-right'
                        : '-left-1.5 bg-brand-cardBg clip-path-tail-left'}`}>
                      </div>

                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 opacity-60`}>
                        <span className="text-[9px]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          <div className="flex">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15L6 12l1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-brand-deep border-t border-white/5 backdrop-blur-md">
              <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                <div className="flex-1 flex items-end gap-2 p-1.5 bg-brand-cardBg rounded-[24px] border border-white/10 shadow-inner group focus-within:border-brand-pink/50 transition-all">
                  <button type="button" className="p-2.5 text-brand-mutedText hover:text-white transition-colors">
                    <Smile className="w-6 h-6" />
                  </button>
                  <textarea
                    rows={1}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(e)
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 max-h-32 bg-transparent text-white placeholder-brand-mutedText resize-none py-2.5 focus:outline-none text-sm"
                  />
                  <button type="button" className="p-2.5 text-brand-mutedText hover:text-white transition-colors">
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!text.trim() || isSending}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${text.trim() ? 'bg-brand-pink shadow-glow scale-110' : 'bg-brand-cardBg text-brand-mutedText'
                    }`}
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className={`w-5 h-5 ${text.trim() ? 'text-white' : 'text-brand-mutedText'}`} />
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#2B0F1E] text-brand-mutedText space-y-4">
            <div className="w-24 h-24 rounded-full bg-brand-pink/5 flex items-center justify-center">
              <Plus className="w-12 h-12 text-brand-pink/20" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white/80">College Crush Chat</p>
              <p className="text-sm">Select a match to start your conversation ✨</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

