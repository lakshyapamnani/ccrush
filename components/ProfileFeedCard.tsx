'use client'

import { motion } from 'framer-motion'
import { Heart, X, Zap } from 'lucide-react'
import { UserProfile } from '@/lib/firebase'

interface ProfileFeedCardProps {
    profile: UserProfile
    onPass?: () => void
    onLike?: () => void
    onSuperLike?: () => void
    isPreview?: boolean
}

export default function ProfileFeedCard({ profile, onPass, onLike, onSuperLike, isPreview }: ProfileFeedCardProps) {
    const photos = profile.photos?.filter(Boolean) ?? []

    return (
        <div className="w-full bg-white rounded-3xl shadow-card overflow-hidden flex flex-col mb-8 relative">
            <div className="p-6 pb-4">
                <h2 className="text-3xl font-extrabold text-[#111] leading-tight flex items-baseline gap-2">
                    {profile.name} <span className="text-xl text-brand-mutedText font-medium">{profile.age}</span>
                </h2>
                {profile.course && (
                    <p className="text-[#444] font-medium mt-1">{profile.course}</p>
                )}
            </div>

            {profile.interests && profile.interests.length > 0 && (
                <div className="px-6 pb-6 flex flex-wrap gap-2">
                    {profile.interests.map((interest, i) => (
                        <span key={i} className="px-3 py-1.5 bg-brand-deep text-[#444] rounded-full text-sm font-semibold border border-brand-border shadow-sm">
                            {interest}
                        </span>
                    ))}
                </div>
            )}

            {photos[0] && (
                <div className="w-full aspect-[4/5] bg-brand-deep relative border-y border-brand-border">
                    <img src={photos[0]} alt={profile.name} className="w-full h-full object-cover" />
                </div>
            )}

            {profile.prompts?.[0] && (
                <div className="px-8 py-12 bg-white flex flex-col justify-center min-h-[220px]">
                    <h3 className="text-sm font-bold text-brand-mutedText mb-3 uppercase tracking-wider">{profile.prompts[0].question}</h3>
                    <p className="text-3xl font-extrabold text-[#111] leading-tight">{profile.prompts[0].answer}</p>
                </div>
            )}

            {profile.bio && (
                <div className="p-8 bg-brand-deep border-y border-brand-border text-[#111]">
                    <h3 className="text-xs uppercase tracking-wider text-brand-mutedText font-bold mb-2">About Me</h3>
                    <p className="text-lg font-medium leading-relaxed">{profile.bio}</p>
                </div>
            )}

            {photos[1] && (
                <div className="w-full aspect-[4/5] bg-brand-deep relative border-y border-brand-border">
                    <img src={photos[1]} alt={profile.name} className="w-full h-full object-cover" />
                </div>
            )}

            {profile.prompts?.[1] && (
                <div className="px-8 py-12 bg-white flex flex-col justify-center min-h-[220px]">
                    <h3 className="text-sm font-bold text-brand-mutedText mb-3 uppercase tracking-wider">{profile.prompts[1].question}</h3>
                    <p className="text-3xl font-extrabold text-[#111] leading-tight">{profile.prompts[1].answer}</p>
                </div>
            )}

            {photos[2] && (
                <div className="w-full aspect-[4/5] bg-brand-deep relative border-y border-brand-border">
                    <img src={photos[2]} alt={profile.name} className="w-full h-full object-cover" />
                </div>
            )}

            {profile.prompts?.[2] && (
                <div className="px-8 py-12 bg-white flex flex-col justify-center min-h-[220px]">
                    <h3 className="text-sm font-bold text-brand-mutedText mb-3 uppercase tracking-wider">{profile.prompts[2].question}</h3>
                    <p className="text-3xl font-extrabold text-[#111] leading-tight">{profile.prompts[2].answer}</p>
                </div>
            )}

            {/* Floating Action Bar */}
            {!isPreview && (
                <div className="sticky bottom-6 left-0 right-0 flex justify-center gap-6 mt-6 pb-6 z-10 pointer-events-none">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onPass}
                        className="pointer-events-auto w-16 h-16 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                        <X className="w-7 h-7" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onSuperLike}
                        className="pointer-events-auto w-16 h-16 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center text-brand-pink transition-colors">
                        <Zap className="w-7 h-7" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onLike}
                        className="pointer-events-auto w-16 h-16 rounded-full bg-brand-pink shadow-glow flex items-center justify-center text-white transition-all">
                        <Heart className="w-7 h-7 fill-white" />
                    </motion.button>
                </div>
            )}
        </div>
    )
}
