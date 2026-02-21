'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Edit2, Camera, CheckCircle2, X } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { signOut, saveUserProfile } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'

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
  })
  const [editPhotos, setEditPhotos] = useState<string[]>([])

  const startEditing = () => {
    if (!profile) return
    setForm({
      name: profile.name,
      age: String(profile.age),
      bio: profile.bio,
      course: profile.course,
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
    <div className="bg-gradient-brand px-4 py-8 pb-8">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isEditing ? () => setIsEditing(false) : startEditing}
            className="p-2 rounded-lg bg-brand-pink/20 hover:bg-brand-pink/30 text-brand-pink transition-colors"
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
          </motion.button>
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
              {/* Profile Photo */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-pink shadow-glow">
                  {mainPhoto ? (
                    <img src={mainPhoto} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-brand-cardBg flex items-center justify-center">
                      <Camera className="w-10 h-10 text-brand-mutedText" />
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <motion.div whileHover={{ y: -2 }} className="bg-brand-cardBg rounded-2xl border border-brand-deep p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {profile.name}, {profile.age}
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="text-brand-mutedText">
                    <span className="text-white font-semibold">Course:</span> {profile.course}
                  </p>
                  <p className="text-brand-mutedText">
                    <span className="text-white font-semibold">Email:</span> {profile.email}
                  </p>
                </div>
              </motion.div>

              {/* Bio */}
              <motion.div whileHover={{ y: -2 }} className="bg-brand-cardBg rounded-2xl border border-brand-deep p-6">
                <h3 className="font-semibold text-white mb-3">About Me</h3>
                <p className="text-brand-mutedText text-sm">{profile.bio}</p>
              </motion.div>

              {/* Gallery */}
              {galleryPhotos.length > 0 && (
                <motion.div whileHover={{ y: -2 }} className="bg-brand-cardBg rounded-2xl border border-brand-deep p-6">
                  <h3 className="font-semibold text-white mb-4">Photos</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {galleryPhotos.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-brand-deep">
                        <img src={photo} alt={`Photo ${i + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full py-3 rounded-2xl bg-brand-cardBg border border-brand-deep hover:border-brand-pink text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Log Out
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 rounded-2xl bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-2 transition-colors"
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
                <label className="block text-sm font-medium text-white mb-3">Photos</label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <label key={i} className="relative aspect-square cursor-pointer group">
                      {editPhotos[i] ? (
                        <img
                          src={editPhotos[i]}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl border-2 border-dashed border-brand-deep flex items-center justify-center">
                          <Camera className="w-6 h-6 text-brand-mutedText" />
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
                <label className="block text-sm font-medium text-white mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-brand-cardBg border border-brand-deep text-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  min="18"
                  className="w-full px-4 py-3 rounded-2xl bg-brand-cardBg border border-brand-deep text-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Course / Major</label>
                <input
                  type="text"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-brand-cardBg border border-brand-deep text-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-white">About Me</label>
                  <span className="text-xs text-brand-mutedText">{form.bio.length}/200</span>
                </div>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 200) })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-brand-cardBg border border-brand-deep text-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-2xl bg-gradient-pink text-white font-semibold hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
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
              className="bg-brand-cardBg rounded-2xl p-6 max-w-sm w-full border border-brand-deep"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Delete Account?</h2>
              <p className="text-brand-mutedText mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border border-brand-deep text-white font-semibold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-400 font-semibold hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
