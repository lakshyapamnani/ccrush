'use client'

import { motion } from 'framer-motion'
import { User } from '@/lib/storage'

interface SwipeCardProps {
  profile: User
  matchPercentage: number
  onPass: () => void
  onLike: () => void
  onSuperLike: () => void
}

export default function SwipeCard({
  profile,
  matchPercentage,
  onPass,
  onLike,
  onSuperLike,
}: SwipeCardProps) {
  const handleDragEnd = (event: any, info: any) => {
    try {
      const swipeThreshold = 100
      const swipeVelocityThreshold = 500

      // Safe access with fallback values - handle undefined info
      if (!info) return

      const offsetX = info.offset?.x ?? 0
      const velocityX = info.velocity?.x ?? 0

      if (offsetX > swipeThreshold || velocityX > swipeVelocityThreshold) {
        onLike()
      } else if (offsetX < -swipeThreshold || velocityX < -swipeVelocityThreshold) {
        onPass()
      }
    } catch (error) {
      console.error('Drag error:', error)
    }
  }

  return (
    <motion.div
      drag="x"
      dragElastic={0.2}
      dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={(event, info) => handleDragEnd(event, info)}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full h-full rounded-2xl overflow-y-auto overflow-x-hidden cursor-grab active:cursor-grabbing bg-brand-cardBg shadow-glow-lg flex flex-col hide-scrollbar"
    >
      {/* Image Section */}
      <div className="relative w-full h-64 bg-brand-cardBg flex-shrink-0">
        {profile.profilePhoto ? (
          <img
            src={profile.profilePhoto}
            alt={profile.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%233E0F2C" width="100" height="100"/%3E%3C/svg%3E'
            }}
          />
        ) : (
          <div className="w-full h-full bg-brand-cardBg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brand-pink/20 mx-auto mb-4" />
              <p className="text-brand-mutedText">No photo</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Card Section */}
      <div className="w-full bg-brand-cardBg border-t border-brand-secondary/30 p-4 pb-8 flex-shrink-0">
        <div className="space-y-4">
          {/* Match Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-pink/90 backdrop-blur-sm">
            <span className="text-xs font-bold text-white">{matchPercentage}% Match</span>
          </div>

          {/* Name and Age */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              {profile.name[0].toUpperCase()}, {profile.age}
            </h2>
            <p className="text-sm text-brand-mutedText">
              {profile.major} • {profile.year}
            </p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-xs font-semibold text-brand-mutedText mb-1">About</p>
              <p className="text-sm text-white/80 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Interests Section */}
          <div>
            <p className="text-xs font-semibold text-brand-mutedText mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 text-xs rounded-full bg-brand-pink/20 text-brand-pink border border-brand-pink/40"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t border-brand-secondary/30 pt-3 mt-3">
            <p className="text-xs text-brand-mutedText">
              <span className="font-semibold">College:</span> {profile.college}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
