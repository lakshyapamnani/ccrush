# College Crush - Configuration Guide

This guide explains how to customize College Crush for your specific use case.

## Design Customization

### 1. Color Scheme

Edit `/vercel/share/v0-project/tailwind.config.ts`:

```typescript
colors: {
  brand: {
    dark: "#YOUR_PRIMARY_COLOR",      // Background color
    deep: "#YOUR_SECONDARY_COLOR",    // Card borders
    pink: "#YOUR_ACCENT_COLOR_1",     // Primary buttons
    pinkLight: "#YOUR_ACCENT_COLOR_2", // Secondary accent
    accent: "#YOUR_ACCENT_COLOR_3",   // Highlights
    mutedText: "#YOUR_TEXT_COLOR",    // Muted text
    cardBg: "#YOUR_CARD_COLOR",       // Card backgrounds
    success: "#YOUR_SUCCESS_COLOR",   // Success states
  },
}
```

### 2. Design Tokens

Edit `/vercel/share/v0-project/app/globals.css`:

```css
:root {
  --background: #2B0F1E;
  --foreground: #FFFFFF;
  --card: #1a0f16;
  /* ... all design tokens ... */
}
```

### 3. Typography

Edit `/vercel/share/v0-project/app/layout.tsx`:

```typescript
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})
```

Change `Poppins` to any Google Font:
- Inter
- Roboto
- DM Sans
- Outfit
- Space Mono

### 4. Logo & Branding

Replace in components:

**Landing page** (`app/page.tsx`):
```typescript
<h1 className="text-4xl font-bold text-white">College Crush</h1>
```

**App logo** (Bottom navigation header):
Edit `components/BottomNavigation.tsx`

### 5. Brand Name

Find-and-replace all instances:
- `College Crush` → Your app name
- `college_crush_` → your_app_
- `brand-pink` → your-color

## Feature Customization

### 1. Authentication

**Change Email Validation Pattern**

File: `app/auth/signup/page.tsx`

```typescript
const validateEmail = (email: string): boolean => {
  // Current: college emails only
  const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|college)$/i
  
  // Option 1: Any email
  // const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i
  
  // Option 2: Specific domain
  // const regex = /^[^\s@]+@yourdomain\.edu$/i
  
  return collegeEmailRegex.test(email)
}
```

**Change OTP Length**

File: `lib/storage.ts`

```typescript
export function generateOTP(): string {
  // Current: 6-digit
  return Math.floor(100000 + Math.random() * 900000).toString()
  
  // For 4-digit:
  // return Math.floor(1000 + Math.random() * 9000).toString()
  
  // For 8-digit:
  // return Math.floor(10000000 + Math.random() * 90000000).toString()
}
```

**Change OTP Expiration**

File: `lib/storage.ts`

```typescript
export function saveAuthState(email: string, otp: string): void {
  const state: AuthState = {
    email,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // Currently 10 minutes
    // Change to: Date.now() + 5 * 60 * 1000 // 5 minutes
    // or: Date.now() + 24 * 60 * 60 * 1000 // 1 day
  }
  localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(state))
}
```

### 2. User Profile

**Add/Remove Profile Fields**

File: `lib/storage.ts`

```typescript
export interface User {
  id: string
  email: string
  name: string
  age: number
  major: string
  year: string
  bio: string
  profilePhoto: string
  gallery: string[]
  interests: string[]
  college: string
  // Add new fields:
  // phone?: string
  // location?: string
  // verified?: boolean
  createdAt: number
  isVerified: boolean
}
```

Then update forms in:
- `app/auth/profile-setup/page.tsx`
- `app/app/profile/page.tsx`

**Change Bio Character Limit**

File: `app/auth/profile-setup/page.tsx` and `app/app/profile/page.tsx`

```typescript
// Current: 150
if (formData.bio.length > 150) {
  setError('Bio must be 150 characters or less')
}

// Change 150 to your desired limit
```

Also update:
```typescript
bio: e.target.value.slice(0, 150) // Change 150
```

**Change Gallery Photo Limit**

File: `app/auth/profile-setup/page.tsx` and `app/app/profile/page.tsx`

```typescript
// Current: 5
if (formData.gallery.length >= 5) {
  setError('Maximum 5 photos allowed')
}

// Change 5 to your desired limit
```

### 3. Interests

**Modify Interest List**

Files to update:
- `app/auth/profile-setup/page.tsx`
- `app/app/profile/page.tsx`

```typescript
const INTERESTS = [
  // Current interests
  'Sports', 'Music', 'Gaming', 'Art', 'Travel', 'Fitness',
  
  // Replace with your interests
  // 'Your Interest 1', 'Your Interest 2', ...
]
```

**Adjust Interest Matching Weight**

File: `lib/storage.ts`

```typescript
export function calculateMatchPercentage(user1: User, user2: User): number {
  let score = 50
  
  // Common interests - change multiplier (currently 5 per interest)
  const commonInterests = user1.interests.filter((i) => user2.interests.includes(i))
  score += commonInterests.length * 5 // Change 5 to 10 for more weight
  
  // Change other weights as needed:
  // Major match (+15%)
  // Year similarity (+10%)
  // Age compatibility (+10%)
}
```

### 4. Swipe Interface

**Change Match Percentage Calculation**

File: `lib/storage.ts` - `calculateMatchPercentage()` function

Adjust weights:
```typescript
if (user1.major === user2.major) score += 15  // Change 15
const commonInterests = user1.interests.filter(...)
score += commonInterests.length * 5  // Change 5
```

**Modify Swipe Gesture Sensitivity**

File: `components/SwipeCard.tsx`

```typescript
const handleDragEnd = (info: any) => {
  const swipeThreshold = 100  // Change sensitivity (pixels)
  const swipeVelocityThreshold = 500  // Change velocity threshold
  
  // Decrease numbers for easier swiping
  // Increase numbers for harder swiping
}
```

**Add Undo Feature**

File: `app/app/home/page.tsx`

```typescript
// Add state
const [previousCards, setPreviousCards] = useState<User[]>([])

// Modify handlePass and handleLike
const handleLike = () => {
  setPreviousCards([...previousCards, profiles[currentIndex]])
  // ... rest of code
}

// Add undo button
<button onClick={() => { /* undo logic */ }}>
  Undo
</button>
```

### 5. Matching Rules

**Change to "One-Way Like" System**

File: `app/app/home/page.tsx`

```typescript
// Current: requires mutual like
if (targetAction === 'like') {
  // Match!
}

// Change to: all likes create matches
const newMatch = createMatch(currentUser.id, targetUser.id)
saveMatch(newMatch)
```

**Add Blocking/Reporting**

File: `lib/storage.ts`

```typescript
export interface User {
  // Add fields
  blockedUsers: string[]
  reportedUsers: string[]
}

// Add functions
export function blockUser(userId: string, blockedId: string) {
  const user = getUserById(userId)
  if (user) {
    user.blockedUsers.push(blockedId)
    saveUser(user)
  }
}

export function reportUser(userId: string, reportedId: string, reason: string) {
  // Save to storage or send to backend
}
```

## Feature Toggles

### 1. Disable Gallery

File: `app/auth/profile-setup/page.tsx`

```typescript
{step === 3 && (
  <motion.div>
    {/* Gallery section - comment out */}
  </motion.div>
)}
```

### 2. Disable Super Like

File: `app/app/home/page.tsx`

```typescript
{/* Hide Super Like button */}
{/* <motion.button onClick={handleSuperLike}> ... </motion.button> */}
```

### 3. Require Photo Verification

File: `app/auth/profile-setup/page.tsx`

```typescript
// Add verification state
const [photoVerified, setPhotoVerified] = useState(false)

// Add verification logic before profile creation
if (!photoVerified) {
  setError('Please verify your photo')
  return
}
```

### 4. Add Age Range Filter

File: `app/app/home/page.tsx`

```typescript
// Add preference
const [ageRange, setAgeRange] = useState({ min: 18, max: 30 })

// Filter profiles
const available = getAvailableProfiles(user.id)
const filtered = available.filter(p => p.age >= ageRange.min && p.age <= ageRange.max)
```

## Branding Customization

### 1. Change App Metadata

File: `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: 'Your App Name - Campus Dating',
  description: 'Your app description here',
  // ... update icons
}
```

### 2. Update Favicon & Icons

Replace in `/public`:
- `icon.svg` - App icon
- `apple-icon.png` - iOS icon
- `icon-light-32x32.png` - Light mode
- `icon-dark-32x32.png` - Dark mode

### 3. Add Custom Fonts

File: `app/layout.tsx`

```typescript
import { YourCustomFont } from 'next/font/local'

const customFont = YourCustomFont({ src: './path/to/font.ttf' })
```

## Internationalization (i18n)

### 1. Add Multi-Language Support

Install:
```bash
npm install next-intl
```

Create translation files:
```
/locales
  /en
    common.json
    auth.json
  /es
    common.json
```

### 2. Implement Translations

```typescript
import { useTranslations } from 'next-intl'

export default function Component() {
  const t = useTranslations()
  return <h1>{t('landing.title')}</h1>
}
```

## Backend Integration

### 1. Replace LocalStorage with API

File: `lib/storage.ts`

```typescript
export async function saveUser(user: User) {
  // Replace localStorage code with:
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  return response.json()
}
```

### 2. Add Authentication

Install:
```bash
npm install next-auth
```

Integrate in `app/api/auth/[...nextauth].ts`

### 3. Connect Database

```typescript
// Use Supabase, Firebase, or any PostgreSQL database
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

export async function getUserById(id: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  return data
}
```

## Analytics Integration

### 1. Add Google Analytics

Install:
```bash
npm install @next/third-parties
```

```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout() {
  return (
    <html>
      <body>
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

### 2. Add PostHog Analytics

```bash
npm install posthog-js next-posthog
```

## Performance Optimization

### 1. Image Optimization

Replace with Next.js Image:

```typescript
import Image from 'next/image'

<Image
  src={user.profilePhoto}
  alt="Profile"
  width={200}
  height={200}
/>
```

### 2. Code Splitting

Already handled by Next.js App Router.

### 3. Caching Strategy

File: `app/app/home/page.tsx`

```typescript
// Add revalidation
export const revalidateData = 3600 // 1 hour
```

## Testing

### 1. Add Unit Tests

Install:
```bash
npm install -D jest @testing-library/react
```

Create tests:
```typescript
// tests/storage.test.ts
import { createUser, saveUser, getUserById } from '@/lib/storage'

describe('User Storage', () => {
  it('should save and retrieve user', () => {
    const user = createUser({ ... })
    saveUser(user)
    expect(getUserById(user.id)).toEqual(user)
  })
})
```

### 2. Add E2E Tests

Install:
```bash
npm install -D playwright
```

## Deployment Customization

### 1. Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_APP_NAME=College Crush
NEXT_PUBLIC_COLLEGE_DOMAIN=*.edu
```

Use in code:
```typescript
const domain = process.env.NEXT_PUBLIC_COLLEGE_DOMAIN
```

### 2. Vercel Deployment

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_COLLEGE_DOMAIN": "@college_domain"
  }
}
```

---

For more customization help, check the code comments or the README.md file.
