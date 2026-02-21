import { v4 as uuidv4 } from 'uuid'

// Type definitions
export interface User {
  id: string
  email: string
  name: string
  age: number
  major: string
  year: string
  bio: string
  profilePhoto: string // base64 data URL
  gallery: string[] // array of base64 data URLs
  interests: string[]
  college: string
  createdAt: number
  isVerified: boolean
}

export interface SwipeRecord {
  userId: string
  targetUserId: string
  action: 'like' | 'pass' | 'super-like'
  timestamp: number
}

export interface Match {
  id: string
  user1Id: string
  user2Id: string
  createdAt: number
  lastMessageTime: number
}

export interface Message {
  id: string
  matchId: string
  senderId: string
  content: string
  type: 'text' | 'image'
  timestamp: number
  isRead: boolean
}

// Storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'college_crush_current_user',
  USERS: 'college_crush_users',
  SWIPES: 'college_crush_swipes',
  MATCHES: 'college_crush_matches',
  MESSAGES: 'college_crush_messages',
  AUTH_STATE: 'college_crush_auth_state',
} as const

// ============ USER MANAGEMENT ============

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'isVerified'>): User {
  const user: User = {
    ...userData,
    id: uuidv4(),
    createdAt: Date.now(),
    isVerified: true,
  }
  return user
}

export function saveUser(user: User): void {
  if (typeof window === 'undefined') return

  const users = getAllUsers()
  const existingIndex = users.findIndex((u) => u.id === user.id)

  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null

  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  if (!userId) return null

  const users = getAllUsers()
  return users.find((u) => u.id === userId) || null
}

export function setCurrentUser(userId: string | null): void {
  if (typeof window === 'undefined') return

  if (userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId)
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return []

  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}

export function getUserById(id: string): User | null {
  const users = getAllUsers()
  return users.find((u) => u.id === id) || null
}

export function userExists(email: string): boolean {
  const users = getAllUsers()
  return users.some((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function getUserByEmail(email: string): User | null {
  const users = getAllUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export function deleteUser(userId: string): void {
  if (typeof window === 'undefined') return

  const users = getAllUsers()
  const filtered = users.filter((u) => u.id !== userId)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered))

  // Clean up related data
  deleteAllSwipesForUser(userId)
  deleteAllMatchesForUser(userId)
  deleteAllMessagesForUser(userId)

  // Clear current user if deleting self
  if (getCurrentUser()?.id === userId) {
    setCurrentUser(null)
  }
}

// ============ SWIPE MANAGEMENT ============

export function recordSwipe(userId: string, targetUserId: string, action: SwipeRecord['action']): void {
  if (typeof window === 'undefined') return

  const swipes = getAllSwipes()

  // Prevent duplicate swipes on same user
  const existingSwipeIndex = swipes.findIndex(
    (s) => s.userId === userId && s.targetUserId === targetUserId
  )

  const swipe: SwipeRecord = {
    userId,
    targetUserId,
    action,
    timestamp: Date.now(),
  }

  if (existingSwipeIndex >= 0) {
    swipes[existingSwipeIndex] = swipe // Update existing
  } else {
    swipes.push(swipe)
  }

  localStorage.setItem(STORAGE_KEYS.SWIPES, JSON.stringify(swipes))
}

export function getAllSwipes(): SwipeRecord[] {
  if (typeof window === 'undefined') return []

  const data = localStorage.getItem(STORAGE_KEYS.SWIPES)
  return data ? JSON.parse(data) : []
}

export function getUserSwipes(userId: string): SwipeRecord[] {
  const swipes = getAllSwipes()
  return swipes.filter((s) => s.userId === userId)
}

export function hasUserSwiped(userId: string, targetUserId: string): boolean {
  const swipes = getAllSwipes()
  return swipes.some((s) => s.userId === userId && s.targetUserId === targetUserId)
}

export function getSwipeAction(userId: string, targetUserId: string): SwipeRecord['action'] | null {
  const swipes = getAllSwipes()
  const swipe = swipes.find((s) => s.userId === userId && s.targetUserId === targetUserId)
  return swipe?.action || null
}

export function deleteAllSwipesForUser(userId: string): void {
  if (typeof window === 'undefined') return

  const swipes = getAllSwipes()
  const filtered = swipes.filter((s) => s.userId !== userId && s.targetUserId !== userId)
  localStorage.setItem(STORAGE_KEYS.SWIPES, JSON.stringify(filtered))
}

// ============ MATCH MANAGEMENT ============

export function createMatch(user1Id: string, user2Id: string): Match {
  return {
    id: uuidv4(),
    user1Id,
    user2Id,
    createdAt: Date.now(),
    lastMessageTime: Date.now(),
  }
}

export function saveMatch(match: Match): void {
  if (typeof window === 'undefined') return

  const matches = getAllMatches()
  const existingIndex = matches.findIndex((m) => m.id === match.id)

  if (existingIndex >= 0) {
    matches[existingIndex] = match
  } else {
    matches.push(match)
  }

  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches))
}

export function getAllMatches(): Match[] {
  if (typeof window === 'undefined') return []

  const data = localStorage.getItem(STORAGE_KEYS.MATCHES)
  return data ? JSON.parse(data) : []
}

export function getUserMatches(userId: string): Match[] {
  const matches = getAllMatches()
  return matches.filter((m) => m.user1Id === userId || m.user2Id === userId)
}

export function getMatch(user1Id: string, user2Id: string): Match | null {
  const matches = getAllMatches()
  return (
    matches.find(
      (m) =>
        (m.user1Id === user1Id && m.user2Id === user2Id) ||
        (m.user1Id === user2Id && m.user2Id === user1Id)
    ) || null
  )
}

export function matchExists(user1Id: string, user2Id: string): boolean {
  return getMatch(user1Id, user2Id) !== null
}

export function deleteMatch(matchId: string): void {
  if (typeof window === 'undefined') return

  const matches = getAllMatches()
  const filtered = matches.filter((m) => m.id !== matchId)
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(filtered))

  // Delete associated messages
  deleteAllMessagesForMatch(matchId)
}

export function deleteAllMatchesForUser(userId: string): void {
  if (typeof window === 'undefined') return

  const matches = getAllMatches()
  matches.forEach((m) => {
    if (m.user1Id === userId || m.user2Id === userId) {
      deleteMatch(m.id)
    }
  })
}

// ============ MESSAGE MANAGEMENT ============

export function createMessage(
  matchId: string,
  senderId: string,
  content: string,
  type: 'text' | 'image' = 'text'
): Message {
  return {
    id: uuidv4(),
    matchId,
    senderId,
    content,
    type,
    timestamp: Date.now(),
    isRead: false,
  }
}

export function saveMessage(message: Message): void {
  if (typeof window === 'undefined') return

  const messages = getAllMessages()
  const existingIndex = messages.findIndex((m) => m.id === message.id)

  if (existingIndex >= 0) {
    messages[existingIndex] = message
  } else {
    messages.push(message)
  }

  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
}

export function getAllMessages(): Message[] {
  if (typeof window === 'undefined') return []

  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES)
  return data ? JSON.parse(data) : []
}

export function getMatchMessages(matchId: string): Message[] {
  const messages = getAllMessages()
  return messages.filter((m) => m.matchId === matchId).sort((a, b) => a.timestamp - b.timestamp)
}

export function getUnreadMessageCount(userId: string): number {
  const messages = getAllMessages()
  return messages.filter((m) => m.senderId !== userId && !m.isRead).length
}

export function markMessagesAsRead(matchId: string, userId: string): void {
  if (typeof window === 'undefined') return

  const messages = getAllMessages()
  messages.forEach((m) => {
    if (m.matchId === matchId && m.senderId !== userId) {
      m.isRead = true
    }
  })
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
}

export function deleteAllMessagesForMatch(matchId: string): void {
  if (typeof window === 'undefined') return

  const messages = getAllMessages()
  const filtered = messages.filter((m) => m.matchId !== matchId)
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered))
}

export function deleteAllMessagesForUser(userId: string): void {
  if (typeof window === 'undefined') return

  const matches = getAllMatches().filter((m) => m.user1Id === userId || m.user2Id === userId)
  matches.forEach((m) => {
    deleteAllMessagesForMatch(m.id)
  })
}

// ============ AUTH STATE ============

export interface AuthState {
  email: string
  otp: string
  expiresAt: number
}

export function saveAuthState(email: string, otp: string): void {
  if (typeof window === 'undefined') return

  const state: AuthState = {
    email,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  }

  localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(state))
}

export function getAuthState(): AuthState | null {
  if (typeof window === 'undefined') return null

  const data = localStorage.getItem(STORAGE_KEYS.AUTH_STATE)
  if (!data) return null

  const state: AuthState = JSON.parse(data)

  // Check if expired
  if (state.expiresAt < Date.now()) {
    clearAuthState()
    return null
  }

  return state
}

export function clearAuthState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.AUTH_STATE)
}

// ============ UTILITY FUNCTIONS ============

export function clearAllData(): void {
  if (typeof window === 'undefined') return

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function calculateMatchPercentage(user1: User, user2: User): number {
  let score = 50 // Base score

  // Major match
  if (user1.major === user2.major) score += 15

  // Interest overlap
  const commonInterests = user1.interests.filter((i) => user2.interests.includes(i))
  score += commonInterests.length * 5

  // Year similarity
  const yearDiff = Math.abs(parseInt(user1.year) - parseInt(user2.year))
  if (yearDiff === 0) score += 10
  else if (yearDiff === 1) score += 5

  // Age compatibility (within 4 years)
  const ageDiff = Math.abs(user1.age - user2.age)
  if (ageDiff <= 2) score += 10
  else if (ageDiff <= 4) score += 5

  return Math.min(100, Math.max(0, score))
}

export function getAvailableProfiles(currentUserId: string): User[] {
  const allUsers = getAllUsers()
  const swipedByUser = getUserSwipes(currentUserId).map((s) => s.targetUserId)

  return allUsers.filter((u) => u.id !== currentUserId && !swipedByUser.includes(u.id))
}
