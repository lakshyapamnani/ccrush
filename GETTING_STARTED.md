# College Crush - Getting Started Guide

Welcome to College Crush! This guide will help you get up and running with the app in just a few minutes.

## Quick Start

### 1. Installation

```bash
# Install dependencies
npm install
```

This will install all required packages including:
- Next.js 16 with App Router
- React 19
- Framer Motion for animations
- Tailwind CSS for styling
- Lucide React for icons
- UUID for unique IDs

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 3. Create Your Account

1. Click "Sign Up" on the landing page
2. Enter a college email (e.g., demo@college.edu, test@university.edu)
3. You'll receive a simulated 6-digit OTP (check browser console or wait for the popup)
4. Enter the OTP to verify
5. Set up your profile:
   - Upload a profile photo
   - Enter name, age, major, year
   - Add college name and bio
   - Select your interests (multiple)
   - Optionally add up to 5 gallery photos

### 4. Start Swiping!

- View profile cards one at a time
- Swipe right or click the Heart button to like
- Swipe left or click the X button to pass
- Click the Zap button for Super Like
- When it's a mutual match, you'll see the "It's a Match!" modal

### 5. Chat with Matches

- Go to the Chat section to message your matches
- Send text messages or images
- Check your match list to see conversations
- Last message preview in the matches list

## Testing with Demo Data

### Generate Sample Users

Open your browser console (F12 → Console) and run:

```javascript
import { generateDemoUsers } from '@/lib/demo-data'
generateDemoUsers()
```

This will create 5 sample users:
- Alex Chen (Computer Science, Stanford)
- Sarah Mitchell (Business, Harvard)
- Jordan Taylor (Engineering, MIT)
- Emma Rodriguez (Psychology, UC Berkeley)
- Marcus Williams (Medicine, Johns Hopkins)

Then sign in with any college email to see demo profiles!

### Clear All Data

To reset everything:

```javascript
import { clearDemoUsers } from '@/lib/demo-data'
clearDemoUsers()
```

Or use the delete account feature in the Profile section.

## Features Overview

### Landing Page
- Beautiful branding with College Crush logo
- Sign Up / Log In buttons
- Tagline: "Where campus hearts connect"

### Authentication
- Email-based signup with college domain validation
- OTP verification (6-digit code)
- Resend OTP after 60 seconds
- Login with same email verification flow

### Profile Setup (3-Step Process)
**Step 1**: Basic info
- Profile photo upload (circular with camera overlay)
- Name, age, major, year
- Instant photo preview

**Step 2**: Preferences
- College name
- Bio (up to 150 characters)
- Interest selection (15+ options)

**Step 3**: Gallery
- Add up to 5 additional photos
- Remove photos anytime
- Each with preview

### Home/Swipe Screen
- Large profile cards with image
- Gradient overlay for text readability
- Match percentage badge
- Profile info: name, age, major, year, college
- Bio preview
- Top 3 interests visible
- Three action buttons: Pass, Super Like, Like
- Drag to swipe functionality
- "No more profiles" state

### Matches Screen
- List of all matches
- Profile avatar
- Last message preview
- Match count badge
- Delete match option
- Tap to open chat

### Chat Screen
- Conversation with matched user
- Send text messages
- Send images
- Typing indicator
- Message timestamps
- Auto-scroll to latest
- Works on mobile and desktop

### Profile Screen
- View your profile
- Edit mode for updating
- Change profile photo
- Update bio and interests
- Manage gallery
- Logout button
- Delete account button

### Bottom Navigation
- 4 main sections: Swipe, Matches, Chat, Profile
- Notification badges for:
  - Match count
  - Unread messages
- Smooth transitions between screens

## Data & Storage

### LocalStorage Structure

All data is stored locally in your browser:

```
college_crush_users          → All user profiles
college_crush_swipes         → Like/pass/super-like records
college_crush_matches        → Mutual matches
college_crush_messages       → Chat messages
college_crush_auth_state     → Temp auth session (10 min)
college_crush_current_user   → Current logged-in user ID
```

### No Backend Required
- Works completely offline
- All data stays on your device
- No third-party services
- No sign-ups or logins on external servers

## Customization

### Change Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  brand: {
    dark: "#2B0F1E",      // Dark maroon background
    deep: "#3E0F2C",      // Deep plum
    pink: "#FF3C8E",      // Primary pink
    pinkLight: "#FF007A", // Accent pink
    // ... other colors
  }
}
```

### Change Fonts

The app uses Poppins font. To change:

1. Edit `app/layout.tsx`:
```typescript
import { YourFont } from 'next/font/google'
const font = YourFont({ ... })
```

2. Update `tailwind.config.ts`:
```typescript
fontFamily: {
  sans: ['var(--font-yourfont)', 'sans-serif'],
}
```

### Modify Interest List

In `app/auth/profile-setup/page.tsx` and `app/app/profile/page.tsx`:

```typescript
const INTERESTS = [
  'Your interests',
  'Go here',
  // ...
]
```

In `lib/storage.ts` for calculation adjustments:

```typescript
export function calculateMatchPercentage(user1, user2) {
  // Modify scoring logic
}
```

## Troubleshooting

### App Not Loading?
- Clear browser cache: Ctrl+Shift+Delete
- Check console for errors: F12 → Console
- Verify all dependencies: `npm install`

### Images Not Showing?
- Ensure file sizes are reasonable (< 5MB)
- Try JPG or PNG format
- Check browser console for errors

### Messages Not Saving?
- Check browser's LocalStorage is enabled
- Go to Settings → Privacy → Cookies and Site Data
- Ensure site data isn't being cleared

### OTP Not Appearing?
- Check browser console (F12 → Console)
- OTP is printed to console in development
- In production, you'd integrate real OTP service

### Can't Login?
- Email is case-sensitive for match purposes but case-insensitive for login
- Use the exact email you signed up with
- Check localStorage hasn't been cleared

## Deployment

### Deploy to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Connect to Vercel:
- Go to vercel.com
- Click "New Project"
- Import from GitHub
- Deploy

3. Production optimizations:
- Font loading is optimized with Poppins
- Images are optimized for mobile
- Code splitting via Next.js
- All data stays local (no API calls)

### Build for Production

```bash
npm run build
npm start
```

## Performance Tips

- LocalStorage is fast for < 5MB data
- App uses React code splitting automatically
- Images are cached by browser
- Animations use Framer Motion (GPU-accelerated)

For larger datasets, consider:
- IndexedDB instead of LocalStorage
- Web Workers for processing
- Service Workers for offline support

## Next Steps

1. **Customize**: Change colors, fonts, and interests to match your college
2. **Deploy**: Push to Vercel or your hosting platform
3. **Populate**: Add more users for testing
4. **Enhance**: Add backend integration for real data
5. **Scale**: Deploy for your entire campus!

## API Reference

For programmatic access to data:

```typescript
import {
  getCurrentUser,
  getUserById,
  getAllUsers,
  getUserMatches,
  getMatchMessages,
  recordSwipe,
  createMatch,
  // ... more functions in lib/storage.ts
} from '@/lib/storage'
```

See `lib/storage.ts` for complete API documentation.

## Support & FAQ

**Q: Can I run this without npm?**
A: No, Next.js requires Node.js and npm. Install from nodejs.org

**Q: Can I use this offline?**
A: Yes! The app works completely offline once loaded.

**Q: How do I backup my data?**
A: Export from browser console:
```javascript
localStorage.getItem('college_crush_users')
```

**Q: Can I delete my account?**
A: Yes, from the Profile section. Click "Delete Account" button.

**Q: Can I add a real backend?**
A: Yes! Uncomment code in `lib/storage.ts` and add API calls. See the README for integration examples.

## Keyboard Shortcuts

- `?` - Show this help
- `S` - Go to Swipe
- `M` - Go to Matches
- `C` - Go to Chat
- `P` - Go to Profile

(Not yet implemented, can be added easily!)

## Browser Requirements

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For mobile: iOS Safari 14+ or Android Chrome 90+

## Performance Targets

- Initial load: < 2 seconds
- Page transitions: < 500ms
- Chat messages: < 100ms
- Match detection: instant

## Development Tips

### Debug Mode
Add to any component:
```typescript
console.log('[v0] variable:', variable)
```

### React DevTools
Install browser extension for debugging React state and components.

### Network Tab
F12 → Network to see all requests (should be 0 for local storage)

## Troubleshooting Script

Copy-paste in browser console to diagnose issues:

```javascript
console.log('Users:', localStorage.getItem('college_crush_users')?.length || 0)
console.log('Swipes:', localStorage.getItem('college_crush_swipes')?.length || 0)
console.log('Matches:', localStorage.getItem('college_crush_matches')?.length || 0)
console.log('Current user:', localStorage.getItem('college_crush_current_user'))
```

---

Happy swiping! If you have questions, check the README.md or the code comments throughout the project.

**College Crush** - Where campus hearts connect. ❤️
