'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Edit2, Camera, CheckCircle2, X } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { signOut, saveUserProfile } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import ProfileFeedCard from '@/components/ProfileFeedCard'

const PROMPT_CHOICES = [
  "I'm looking for...",
  "A random fact I love is...",
  "My simple pleasures...",
  "I geek out on...",
  "Typical Sunday...",
  "Let's make sure we're on the same page about...",
  "My most irrational fear...",
  "We'll get along if...",
  "I'm weirdly attracted to...",
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading, refreshProfile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Edit form state — mirrors Firebase profile fields
  const [form, setForm] = useState({
    name: '',
    age: '',
    bio: '',
    course: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    interests: [] as string[],
    prompts: [] as { question: string; answer: string }[],
  })
  const [editPhotos, setEditPhotos] = useState<string[]>([])

  const startEditing = () => {
    if (!profile) return
    setForm({
      name: profile.name,
      age: String(profile.age),
      bio: profile.bio || '',
      course: profile.course || '',
      gender: profile.gender ?? '',
      interests: profile.interests || [],
      prompts: profile.prompts || [],
    })
    setEditPhotos([...profile.photos])
    setIsEditing(true)
  }

  const handlePhotoReplace = async (index: number, file: File) => {
    try {
      const url = await uploadToCloudinary(file)
      setEditPhotos((prev) => {
        const updated = [...prev]
        updated[index] = url
        return updated
      })
    } catch {
      alert('Photo upload failed. Please try again.')
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return
    setSaving(true)
    try {
      await saveUserProfile(user.uid, {
        email: profile.email,
        name: form.name.trim(),
        age: parseInt(form.age) || profile.age,
        bio: form.bio.trim(),
        course: form.course.trim(),
        gender: (form.gender || profile.gender || 'other') as 'male' | 'female' | 'other',
        interests: form.interests.filter(Boolean),
        prompts: form.prompts.filter((p) => p.question && p.answer.trim()),
        photos: editPhotos,
        createdAt: profile.createdAt,
      })
      await refreshProfile()
      setIsEditing(false)
    } catch {
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    // For now just sign out; full account deletion requires re-auth
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-brand-mutedText text-lg">Profile not found.</p>
        <button
          onClick={() => router.push('/auth/profile-setup')}
          className="px-6 py-3 rounded-2xl bg-gradient-pink text-white font-semibold hover:shadow-glow transition-all"
        >
          Complete Profile Setup
        </button>
      </div>
    )
  }

  const mainPhoto = profile.photos?.[0] || ''
  const galleryPhotos = profile.photos?.slice(1) || []

  return (
    <div className="bg-gradient-brand px-4 py-8 pb-8 min-h-screen">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-[#111]">Profile</h1>
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startEditing}
              className="p-2 rounded-lg bg-brand-pink/10 hover:bg-brand-pink/20 text-brand-pink transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            /* ── VIEW MODE ─────────────────────────────── */
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Profile Preview Explanation */}
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-[#111] mb-1">Profile Preview</h2>
                <p className="text-sm text-brand-mutedText">This is exactly how others see you on the feed.</p>
              </div>

              {/* Feed Card Render for Preview */}
              <ProfileFeedCard profile={profile} isPreview={true} />

              {/* Actions */}
              <div className="space-y-3 pt-6 border-t border-brand-border">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full py-3 rounded-2xl bg-white border border-brand-border text-[#111] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <LogOut className="w-5 h-5 text-gray-400" /> Log Out
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 rounded-2xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Delete Account
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ── EDIT MODE ─────────────────────────────── */
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Photo edit grid */}
              <div>
                <label className="block text-sm font-bold text-[#111] mb-3">Photos</label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <label key={i} className="relative aspect-square cursor-pointer group">
                      {editPhotos[i] ? (
                        <img
                          src={editPhotos[i]}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover rounded-2xl shadow-sm border border-brand-border"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl border border-dashed border-gray-300 bg-white flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handlePhotoReplace(i, e.target.files[0])}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111] mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-brand-border text-[#111] font-medium focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111] mb-2">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  min="18"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-brand-border text-[#111] font-medium focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111] mb-2">Course / Major</label>
                <input
                  type="text"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-brand-border text-[#111] font-medium focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111] mb-3">Gender</label>
                <div className="flex gap-3">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold capitalize transition-all ${form.gender === g
                        ? 'bg-gradient-pink text-white shadow-glow'
                        : 'bg-white border border-brand-border text-[#444] shadow-sm hover:border-brand-pink/50'
                        }`}
                    >
                      {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '⚧ Other'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-bold text-[#111]">About Me</label>
                  <span className="text-xs text-brand-mutedText">{form.bio.length}/200</span>
                </div>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 200) })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-brand-border text-[#111] font-medium focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all resize-none shadow-sm"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-bold text-[#111]">Interests</label>
                  <span className="text-xs text-brand-mutedText">{form.interests.length}/5</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.interests.map((interest, i) => (
                    <span key={i} className="px-3 py-1.5 bg-brand-deep text-[#444] rounded-full text-sm font-semibold border border-brand-border flex items-center gap-2">
                      {interest}
                      <button type="button" onClick={() => setForm({ ...form, interests: form.interests.filter((_, idx) => idx !== i) })} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                {form.interests.length < 5 && (
                  <input
                    type="text"
                    placeholder="Add an interest and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const val = e.currentTarget.value.trim()
                        if (val && !form.interests.includes(val)) {
                          setForm({ ...form, interests: [...form.interests, val] })
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-brand-border text-[#111] font-medium focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all shadow-sm"
                  />
                )}
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-bold text-[#111]">Prompts</label>
                  <span className="text-xs text-brand-mutedText">{form.prompts.length}/3</span>
                </div>

                <div className="space-y-4 mb-4">
                  {form.prompts.map((prompt, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-brand-border bg-brand-deep relative">
                      <button type="button" onClick={() => setForm({ ...form, prompts: form.prompts.filter((_, idx) => idx !== i) })} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                      <select
                        value={prompt.question}
                        onChange={(e) => {
                          const newPrompts = [...form.prompts]
                          newPrompts[i].question = e.target.value
                          setForm({ ...form, prompts: newPrompts })
                        }}
                        className="w-full mb-2 bg-transparent text-sm font-bold text-brand-mutedText focus:outline-none"
                      >
                        <option value="" disabled>Select a prompt...</option>
                        {PROMPT_CHOICES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <textarea
                        value={prompt.answer}
                        onChange={(e) => {
                          const newPrompts = [...form.prompts]
                          newPrompts[i].answer = e.target.value
                          setForm({ ...form, prompts: newPrompts })
                        }}
                        placeholder="Your answer..."
                        rows={2}
                        className="w-full bg-transparent text-[#111] font-bold text-lg resize-none focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                {form.prompts.length < 3 && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, prompts: [...form.prompts, { question: '', answer: '' }] })}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-brand-border text-brand-mutedText font-bold hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    Add a Prompt
                  </button>
                )}
              </div>

              {/* Spacer for bottom bar */}
              <div className="h-24"></div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Bottom Action Bar (Moved outside AnimatePresence so it's not clipped) */}
        {isEditing && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-brand-border z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
            <div className="max-w-md mx-auto flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 rounded-2xl bg-white border border-brand-border text-[#444] font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-4 rounded-2xl bg-[#111] text-white font-bold hover:bg-black hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h2 className="text-2xl font-extrabold text-[#111] mb-2">Delete Account?</h2>
              <p className="text-[#666] font-medium mb-8">This action cannot be undone and your profile will be permanently removed.</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-sm"
                >
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-3 rounded-2xl border border-gray-200 text-[#444] font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
