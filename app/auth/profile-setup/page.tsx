'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Camera, Plus, X, Upload, CheckCircle2 } from 'lucide-react'
import { auth, saveUserProfile } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'

export default function ProfileSetupPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    course: '',
  })

  // photos[0] = required, photos[1] and photos[2] optional
  const [photos, setPhotos] = useState<Array<{ file: File; preview: string } | null>>([null, null, null])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handlePhotoSelect = (index: number, file: File) => {
    const preview = URL.createObjectURL(file)
    setPhotos((prev) => {
      const updated = [...prev]
      updated[index] = { file, preview }
      return updated
    })
    setError('')
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = [...prev]
      // Revoke old preview URL to free memory
      if (updated[index]) URL.revokeObjectURL(updated[index]!.preview)
      updated[index] = null
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) { setError('Please enter your name'); return }
    if (!formData.age || parseInt(formData.age) < 18) { setError('You must be 18 or older'); return }
    if (!formData.bio.trim()) { setError('Please write a short description'); return }
    if (!formData.course.trim()) { setError('Please enter your course'); return }
    if (!photos[0]) { setError('Please upload at least 1 photo (required)'); return }

    const user = auth.currentUser
    if (!user) { router.push('/auth/login'); return }

    setUploading(true)
    try {
      // Upload each selected photo to Cloudinary
      const uploadedUrls: string[] = []
      for (let i = 0; i < 3; i++) {
        if (photos[i]) {
          const url = await uploadToCloudinary(photos[i]!.file)
          uploadedUrls.push(url)
        }
      }

      await saveUserProfile(user.uid, {
        email: user.email || '',
        name: formData.name.trim(),
        age: parseInt(formData.age),
        bio: formData.bio.trim(),
        course: formData.course.trim(),
        photos: uploadedUrls,
        createdAt: Date.now(),
      })

      router.push('/app/home')
    } catch (err) {
      console.error(err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-brand flex flex-col items-center px-4 py-10 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-pink rounded-full flex items-center justify-center shadow-glow">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-white">Set Up Your Profile</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photos Section */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Photos <span className="text-brand-pink">*</span>
              <span className="text-brand-mutedText font-normal ml-1">(first required, up to 3)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  {photo ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full rounded-2xl overflow-hidden relative"
                    >
                      <img
                        src={photo.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-brand-pink px-1.5 py-0.5 rounded-full text-white font-medium">
                          Main
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs[index].current?.click()}
                      className={`w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all hover:bg-brand-pink/10 ${index === 0 ? 'border-brand-pink' : 'border-brand-deep hover:border-brand-pink'
                        }`}
                    >
                      {index === 0 ? (
                        <>
                          <Camera className="w-7 h-7 text-brand-pink mb-1" />
                          <span className="text-[10px] text-brand-pink font-medium">Required</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-brand-mutedText mb-1" />
                          <span className="text-[10px] text-brand-mutedText">Optional</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRefs[index]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handlePhotoSelect(index, e.target.files[0])
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Full Name <span className="text-brand-pink">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-2xl bg-brand-cardBg border border-brand-deep text-white placeholder-brand-mutedText focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Age <span className="text-brand-pink">*</span>
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="18+"
              min="18"
              max="30"
              className="w-full px-4 py-3 rounded-2xl bg-brand-cardBg border border-brand-deep text-white placeholder-brand-mutedText focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all"
            />
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Course / Major <span className="text-brand-pink">*</span>
            </label>
            <input
              type="text"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              placeholder="e.g. Computer Science, B.Tech"
              className="w-full px-4 py-3 rounded-2xl bg-brand-cardBg border border-brand-deep text-white placeholder-brand-mutedText focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all"
            />
          </div>

          {/* Description / Bio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-white">
                About Me <span className="text-brand-pink">*</span>
              </label>
              <span className="text-xs text-brand-mutedText">{formData.bio.length}/200</span>
            </div>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 200) })}
              placeholder="Tell others a little about yourself..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-brand-cardBg border border-brand-deep text-white placeholder-brand-mutedText focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all resize-none"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-4 rounded-2xl font-semibold text-lg text-white bg-gradient-pink hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Uploading photos...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Profile</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
