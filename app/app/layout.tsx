'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import BottomNavigation from '@/components/BottomNavigation'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-brand flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-brand flex flex-col">
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>
      <BottomNavigation />
    </div>
  )
}
