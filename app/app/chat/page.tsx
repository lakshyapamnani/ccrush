'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react'
import {
  getCurrentUser,
  getUserMatches,
  getMatchMessages,
  createMessage,
  saveMessage,
  markMessagesAsRead,
  getUserById,
  User,
  Message,
} from '@/lib/storage'

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMatchId = searchParams.get('matchId')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [matches, setMatches] = useState<{ id: string; user: User }[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(initialMatchId)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedOtherUser, setSelectedOtherUser] = useState<User | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      loadMatches(user.id)
    }
  }, [])

  const loadMatches = (userId: string) => {
    const userMatches = getUserMatches(userId)
    const matchList = userMatches.map((match) => {
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id
      const otherUser = getUserById(otherUserId)
      return { id: match.id, user: otherUser! }
    })

    setMatches(matchList)

    if (initialMatchId && matchList.some((m) => m.id === initialMatchId)) {
      setSelectedMatchId(initialMatchId)
      loadMessages(initialMatchId, userId)
    } else if (matchList.length > 0) {
      setSelectedMatchId(matchList[0].id)
      loadMessages(matchList[0].id, userId)
    }

    setLoading(false)
  }

  const loadMessages = (matchId: string, userId: string) => {
    const msgs = getMatchMessages(matchId)
    setMessages(msgs)
    markMessagesAsRead(matchId, userId)

    // Set other user
    const match = matches.find((m) => m.id === matchId)
    if (match) {
      setSelectedOtherUser(match.user)
    }

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSelectMatch = (matchId: string) => {
    if (currentUser) {
      setSelectedMatchId(matchId)
      loadMessages(matchId, currentUser.id)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser || !selectedMatchId || !messageText.trim()) return

    const newMessage = createMessage(selectedMatchId, currentUser.id, messageText)
    saveMessage(newMessage)
    setMessages([...messages, newMessage])
    setMessageText('')

    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (currentUser && selectedMatchId) {
        const newMessage = createMessage(
          selectedMatchId,
          currentUser.id,
          reader.result as string,
          'image'
        )
        saveMessage(newMessage)
        setMessages([...messages, newMessage])
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-brand-mutedText">Loading...</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">No Matches Yet</h2>
        <p className="text-brand-mutedText">
          Make a match to start chatting!
        </p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-brand">
      <div className="flex-1 flex overflow-hidden">
        {/* Matches List - Desktop/Tablet view would show, mobile shows selected only */}
        <div className="hidden md:flex md:w-1/3 border-r border-brand-deep flex-col">
          <div className="p-4 border-b border-brand-deep">
            <h2 className="text-lg font-bold text-white">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 p-3">
            {matches.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleSelectMatch(item.id)}
                whileHover={{ scale: 1.02 }}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedMatchId === item.id
                    ? 'bg-brand-pink/20 border border-brand-pink'
                    : 'hover:bg-white/5'
                }`}
              >
                <p className="font-semibold text-white">{item.user.name}</p>
                <p className="text-xs text-brand-mutedText">Tap to open</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedMatchId && currentUser && selectedOtherUser && (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-deep bg-brand-cardBg">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="md:hidden p-2 hover:bg-white/10 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <img
                  src={selectedOtherUser.profilePhoto}
                  alt={selectedOtherUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-brand-pink"
                />
                <div>
                  <p className="font-semibold text-white">{selectedOtherUser.name}</p>
                  <p className="text-xs text-brand-mutedText">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      msg.senderId === currentUser.id
                        ? 'bg-gradient-pink text-white rounded-br-none'
                        : 'bg-brand-cardBg text-white rounded-bl-none border border-brand-deep'
                    }`}
                  >
                    {msg.type === 'image' ? (
                      <img
                        src={msg.content}
                        alt="Shared image"
                        className="max-w-xs rounded-lg max-h-64 object-cover"
                      />
                    ) : (
                      <p className="break-words">{msg.content}</p>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        msg.senderId === currentUser.id
                          ? 'text-white/70'
                          : 'text-brand-mutedText'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-center"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-mutedText animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-brand-mutedText animate-pulse delay-75" />
                  <div className="w-2 h-2 rounded-full bg-brand-mutedText animate-pulse delay-150" />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-brand-deep bg-brand-cardBg">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(e.target.files[0])
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full hover:bg-white/10 transition-colors text-brand-pink"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-brand-deep border border-brand-deep text-white placeholder-brand-mutedText focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-3 rounded-full bg-gradient-pink text-white hover:shadow-glow disabled:opacity-50 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
