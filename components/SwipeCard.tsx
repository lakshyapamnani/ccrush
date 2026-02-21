'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { UserProfile } from '@/lib/firebase'

interface SwipeCardProps {
  profile: UserProfile
  onPass: () => void
  onLike: () => void
  onSuperLike: () => void
}

export default function SwipeCard({ profile, onPass, onLike }: SwipeCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)

  const photos = profile.photos?.filter(Boolean) ?? []
  const totalPhotos = photos.length

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x > rect.width / 2) {
      setPhotoIndex((i) => Math.min(i + 1, totalPhotos - 1))
    } else {
      setPhotoIndex((i) => Math.max(i - 1, 0))
    }
  }

  return (
    <motion.div
      drag="x"
      dragElastic={0.15}
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={(_, info) => setDragOffset(info.offset.x)}
      onDragEnd={(_, info) => {
        setDragOffset(0)
        const offset = info.offset.x
        const velocity = info.velocity.x
        if (offset > 80 || velocity > 400) onLike()
        else if (offset < -80 || velocity < -400) onPass()
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      whileDrag={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="w-full h-full rounded-2xl bg-brand-cardBg shadow-glow-lg flex flex-col cursor-grab select-none overflow-hidden"
    >
      {/* Photo section — 1:1 square */}
      <div
        className="relative w-full aspect-square flex-shrink-0 bg-brand-deep overflow-hidden"
        onClick={handleTap}
      >
        {/* Photo dot indicators */}
        {totalPhotos > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-200 ${i === photoIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Photo */}
        <AnimatePresence mode="wait">
          {photos[photoIndex] ? (
            <motion.img
              key={photoIndex}
              src={photos[photoIndex]}
              alt={profile.name}
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full object-cover pointer-events-none"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-brand-pink/20" />
            </div>
          )}
        </AnimatePresence>

        {/* Left/Right tap zones (visual hint) */}
        {totalPhotos > 1 && (
          <>
            <div className="absolute left-0 top-0 w-1/2 h-full" />
            <div className="absolute right-0 top-0 w-1/2 h-full" />
          </>
        )}

        {/* Swipe overlays */}
        {dragOffset > 30 && (
          <div
            style={{ opacity: Math.min((dragOffset - 30) / 60, 1) }}
            className="absolute inset-0 bg-green-500/30 flex items-center justify-center pointer-events-none"
          >
            <div className="border-4 border-green-400 rounded-xl px-4 py-2">
              <Heart className="w-10 h-10 text-green-400 fill-green-400" />
            </div>
          </div>
        )}
        {dragOffset < -30 && (
          <div
            style={{ opacity: Math.min((-dragOffset - 30) / 60, 1) }}
            className="absolute inset-0 bg-red-500/30 flex items-center justify-center pointer-events-none"
          >
            <div className="border-4 border-red-400 rounded-xl px-4 py-2">
              <X className="w-10 h-10 text-red-400" />
            </div>
          </div>
        )}

        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Name overlay on photo */}
        <div className="absolute bottom-3 left-4 pointer-events-none">
          <h2 className="text-xl font-bold text-white drop-shadow">
            {profile.name}, {profile.age}
          </h2>
          {profile.course && (
            <p className="text-sm text-white/80 drop-shadow">{profile.course}</p>
          )}
        </div>
      </div>

      {/* Bio below photo */}
      {profile.bio && (
        <div className="flex-shrink-0 px-4 py-3 bg-brand-cardBg">
          <p className="text-sm text-white/75 line-clamp-3 leading-relaxed">{profile.bio}</p>
        </div>
      )}
    </motion.div>
  )
}
