# College Crush - Campus Dating App

A fully functional, production-ready campus dating application built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Framer Motion. The app works completely offline using LocalStorage for all data persistence.

## Features

### Authentication System
- College email verification with domain validation (@college.edu, .ac.uk, etc.)
- 6-digit OTP verification with resend functionality
- Email-based login/signup with OTP security

### Profile Management
- Circular profile photo upload with camera overlay
- 5-image gallery with add/remove functionality
- Rich profile information: name, age, major, year, college, bio
- Interest selection from 15+ categories with visual feedback
- Edit profile with save functionality
- Account deletion with confirmation

### Swipe Interface (Tinder-Style)
- Swipeable card stack with smooth animations
- Profile cards display: photo, name, age, major, year, college, bio, interests
- Real-time compatibility percentage calculation
- Three action buttons: Pass (X), Like (Heart), Super Like (Zap)
- Drag-to-swipe gesture support
- "No more profiles" state with restart option

### Match System
- Mutual match detection (both users must like each other)
- Animated "It's a Match!" modal with both avatars
- Match counter in bottom navigation
- Match deletion capability

### Messaging
- Real-time chat between matched users
- Text and image message support
- Typing indicator animation
- Message timestamps
- Unread message counter
- Auto-scroll to latest messages
- Image upload and sharing

### Navigation
- Bottom navigation bar with 4 sections: Swipe, Matches, Chat, Profile
- Notification badges for matches and unread messages
- Smooth page transitions with Framer Motion

### Design System
- Dark maroon-to-plum gradient background (#2B0F1E to #3E0F2C)
- Vibrant pink gradient buttons (#FF3C8E to #FF007A)
- Soft glow effects and shadow animations
- Rounded 2xl cards throughout
- Smooth transitions and micro-interactions
- Mobile-first responsive design

## Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout with Poppins font
│   ├── page.tsx                   # Landing page
│   ├── globals.css                # Global styles & design tokens
│   ├── auth/
│   │   ├── layout.tsx
│   │   ├── signup/page.tsx        # Signup with email & OTP
│   │   ├── login/page.tsx         # Login with email & OTP
│   │   └── profile-setup/page.tsx # Profile creation (3 steps)
│   └── app/
│       ├── layout.tsx             # App wrapper with auth check
│       ├── home/page.tsx          # Swipe interface
│       ├── matches/page.tsx       # Match list
│       ├── chat/page.tsx          # Chat interface
│       └── profile/page.tsx       # Profile view & settings
│
├── components/
│   ├── BottomNavigation.tsx      # Navigation bar with badges
│   ├── OTPVerification.tsx       # OTP input component
│   ├── SwipeCard.tsx            # Draggable profile card
│   └── MatchModal.tsx           # Match celebration modal
│
├── lib/
│   └── storage.ts               # Complete LocalStorage API
│
├── tailwind.config.ts           # Tailwind with custom colors & animations
└── package.json                 # Dependencies
```

## Data Layer (LocalStorage)

All data is persisted in browser LocalStorage with the following structure:

### Collections
- **Users**: User profiles with all information
- **Swipes**: Swipe records (like/pass/super-like) with timestamps
- **Matches**: Mutual match records between users
- **Messages**: Chat messages with sender, content, timestamp
- **AuthState**: Temporary auth session data (10-min expiry)

### Key Functions

```typescript
// User Management
getCurrentUser()                    // Get logged-in user
saveUser(user)                     // Create/update user
getUserById(id)                    // Get user by ID
userExists(email)                  // Check if email registered
deleteUser(userId)                 // Delete account

// Swipe Management
recordSwipe(userId, targetId, action) // Record a swipe
hasUserSwiped(userId, targetId)    // Check if swiped
getAvailableProfiles(userId)       // Get unswiped profiles

// Match Management
getMatch(user1Id, user2Id)         // Get match between users
getUserMatches(userId)             // Get all user matches
matchExists(user1Id, user2Id)      // Check if match exists
deleteMatch(matchId)               // Delete a match

// Message Management
saveMessage(message)               // Save message
getMatchMessages(matchId)          // Get chat history
getUnreadMessageCount(userId)      // Count unread messages
markMessagesAsRead(matchId, userId) // Mark as read

// Utilities
calculateMatchPercentage(user1, user2) // 0-100% compatibility
generateOTP()                      // Generate 6-digit OTP
clearAllData()                     // Wipe all storage
```

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.4
- **TypeScript**: 5.7.3
- **Styling**: Tailwind CSS 4.2.0
- **Animations**: Framer Motion 11.0.3
- **UI Components**: Lucide React (icons)
- **UUID**: uuid 9.0.1
- **Data**: LocalStorage (no backend)

## How It Works

### Landing Page
Users land on a beautiful landing page with College Crush branding, tagline, and Sign Up/Log In buttons.

### Authentication Flow
1. Enter college email (validated against .edu, .college, .ac.uk domains)
2. Receive 6-digit OTP via simulation
3. Enter OTP to verify
4. Proceed to profile creation or login

### Profile Setup (3 Steps)
1. **Step 1**: Photo upload, name, age, major, year
2. **Step 2**: College name, bio (150 chars), interest selection
3. **Step 3**: Add up to 5 gallery photos (optional)

### Home/Swipe Screen
- View available profiles one by one
- Swipe right (or tap Like) to like a profile
- Swipe left (or tap Pass) to skip
- Super Like for special interest
- Automatic match detection when mutual
- Celebratory match modal with CTA buttons

### Matches Screen
- View all matches in list form
- Last message preview
- Tap to open chat
- Delete match option

### Chat Screen
- Real-time messaging with matched users
- Send text messages
- Share images
- Typing indicator
- Message timestamps
- Auto-scroll to latest

### Profile Screen
- View profile information
- Edit profile (photo, bio, gallery, interests)
- View match count
- Toggle privacy settings
- Logout button
- Delete account button

## Key Features

### Match Compatibility Algorithm
Calculates 0-100% match score based on:
- Major match (+15%)
- Common interests (+5% per shared interest)
- Year similarity (+10% for same year, +5% for adjacent)
- Age compatibility (+10% if within 2 years, +5% if within 4 years)

### Data Validation
- College email domain validation
- Age minimum (18+)
- Bio character limit (150)
- Gallery size limit (5 images)
- Duplicate swipe prevention
- OTP expiration (10 minutes)

### Edge Cases Handled
- No profiles available → show "no more profiles" state
- Same user swipe prevention
- Duplicate swipe updates instead of creating new records
- Automatic cleanup on account deletion
- Message deletion cascade on match deletion
- OTP auto-expiration

## Deployment

### Vercel Deployment
1. Push to GitHub
2. Connect to Vercel project
3. Deploy with automatic Poppins font loading
4. All data stored locally in browser

### Local Development
```bash
npm install
npm run dev
# App runs on http://localhost:3000
```

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Privacy & Data
- All data stored in browser LocalStorage
- No backend servers
- No data transmission
- No third-party analytics
- User data remains on device
- Complete user control (delete anytime)

## Future Enhancement Ideas
- Backend integration (Firebase, Supabase, PostgreSQL)
- Real OTP via email/SMS
- Image optimization & compression
- Profile verification system
- Report/block users
- Advanced filtering
- Notification system
- Read receipts
- Voice/video call integration
- Premium features

## License
MIT License - feel free to use and modify this project.

## Support
For issues or questions, please create an issue in the repository.

---

**College Crush** - Where campus hearts connect. Built with ❤️ for college communities.
