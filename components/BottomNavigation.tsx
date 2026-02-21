'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, User, Flame } from 'lucide-react'
import { getCurrentUser, getUserMatches, getUnreadMessageCount } from '@/lib/storage'
import { useEffect, useState } from 'react'

export default function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      const count = getUnreadMessageCount(user.id)
      setUnreadCount(count)
    }
  }, [pathname])

  const navItems = [
    {
      icon: Flame,
      label: 'Swipe',
      href: '/app/home',
      active: pathname === '/app/home',
    },
    {
      icon: Heart,
      label: 'Matches',
      href: '/app/matches',
      active: pathname === '/app/matches',
      badge:
        currentUser && getUserMatches(currentUser.id).length > 0
          ? getUserMatches(currentUser.id).length
          : 0,
    },
    {
      icon: MessageCircle,
      label: 'Chat',
      href: '/app/chat',
      active: pathname === '/app/chat',
      badge: unreadCount,
    },
    {
      icon: User,
      label: 'Profile',
      href: '/app/profile',
      active: pathname === '/app/profile',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-brand-dark to-brand-dark/80 backdrop-blur-md border-t border-brand-deep">
      <div className="max-w-md mx-auto flex items-center justify-around h-24 px-4">
        {navItems.map((item) => (
          <motion.button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="relative flex flex-col items-center gap-1 p-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`relative p-2 rounded-lg transition-colors ${
                item.active ? 'bg-brand-pink/20' : 'hover:bg-white/5'
              }`}
            >
              <item.icon
                className={`w-6 h-6 ${
                  item.active ? 'text-brand-pink' : 'text-brand-mutedText'
                }`}
              />
              {item.badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </motion.div>
              )}
            </div>
            <span className={`text-xs font-medium ${
              item.active ? 'text-brand-pink' : 'text-brand-mutedText'
            }`}>
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
