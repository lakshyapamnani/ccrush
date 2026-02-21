'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { UserProfile } from '@/lib/firebase'

interface SwipeCardProps {
  profile: UserProfile
  onPass: () => void
  onLike: () => void
  onSuperLike: () => void
}

export default function SwipeCard({
  profile,
  onPass,
  onLike,
}: SwipeCardProps) {
  const dragX = useRef(0)

  const mainPhoto = profile.photos?.[0] || ''
  const galleryPhotos = profile.photos?.slice(1) || []

  return (
    <motion.div
      drag="x"
      dragElastic={0.15}
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={(_, info) => { dragX.current = info.offset.x }}
      onDragEnd={(_, info) => {
        const offset = info.offset.x
        const velocity = info.velocity.x
        if (offset > 80 || velocity > 400) {
          onLike()
        } else if (offset < -80 || velocity < -400) {
          onPass()
        }
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      whileDrag={{ cursor: 'grabbing', scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="w-full h-full rounded-2xl bg-brand-cardBg shadow-glow-lg flex flex-col cursor-grab select-none overflow-hidden"
    >
      {/* Main Photo */}
      <div className="relative w-full flex-1 min-h-0 bg-brand-deep">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={profile.name}
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-brand-pink/20" />
          </div>
        )}

        {/* Swipe hint overlays */}
        <motion.div
          style={{ opacity: dragX.current > 40 ? Math.min((dragX.current - 40) / 60, 1) : 0 }}
          className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none"
        >
          <Heart className="w-16 h-16 text-green-400 fill-green-400" />
        </motion.div>
        <motion.div
          style={{ opacity: dragX.current < -40 ? Math.min((-dragX.current - 40) / 60, 1) : 0 }}
          className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none"
        >
          <X className="w-16 h-16 text-red-400" />
        </motion.div>
      </div>

      {/* Info */}
      <div className="flex-shrink-0 p-4 bg-brand-cardBg border-t border-brand-deep">
        <h2 className="text-xl font-bold text-white">
          {profile.name}, {profile.age}
        </h2>
        {profile.course && (
          <p className="text-sm text-brand-mutedText mt-0.5">{profile.course}</p>
        )}
        {profile.bio && (
          <p className="text-sm text-white/70 mt-2 line-clamp-2">{profile.bio}</p>
        )}
        {galleryPhotos.length > 0 && (
          <div className="flex gap-2 mt-3">
            {galleryPhotos.map((photo, i) => (
              <div key={i} className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img src={photo} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
