import { User, createUser, saveUser, setCurrentUser, getAllUsers } from './storage'

// Demo user data
const DEMO_USERS = [
  {
    name: 'Alex Johnson',
    age: 20,
    major: 'Computer Science',
    year: 'Junior',
    college: 'State University',
    bio: 'Coffee enthusiast, love hiking and indie films. Let\'s grab a coffee sometime!',
    interests: ['Coffee', 'Hiking', 'Movies', 'Gaming', 'Art', 'Music'],
    email: 'alex@state-university.edu',
    profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FF3C8E;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FF007A;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="500" fill="url(%23grad1)"%3E%3C/rect%3E%3Ctext x="200" y="250" font-size="48" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3EAlex%3C/text%3E%3C/svg%3E',
    gallery: [],
  },
  {
    name: 'Jordan Lee',
    age: 21,
    major: 'Business',
    year: 'Senior',
    college: 'State University',
    bio: 'Entrepreneur at heart, love networking and trying new restaurants.',
    interests: ['Business', 'Networking', 'Food', 'Travel', 'Reading', 'Sports'],
    email: 'jordan@state-university.edu',
    profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%233E0F2C;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FF3C8E;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="500" fill="url(%23grad2)"%3E%3C/rect%3E%3Ctext x="200" y="250" font-size="48" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3EJordan%3C/text%3E%3C/svg%3E',
    gallery: [],
  },
  {
    name: 'Casey Martinez',
    age: 19,
    major: 'Psychology',
    year: 'Sophomore',
    college: 'State University',
    bio: 'Psychology student interested in understanding human behavior and building genuine connections.',
    interests: ['Psychology', 'Reading', 'Volunteering', 'Yoga', 'Music', 'Animals'],
    email: 'casey@state-university.edu',
    profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Cdefs%3E%3ClinearGradient id="grad3" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FF007A;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%233E0F2C;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="500" fill="url(%23grad3)"%3E%3C/rect%3E%3Ctext x="200" y="250" font-size="48" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3ECasey%3C/text%3E%3C/svg%3E',
    gallery: [],
  },
  {
    name: 'Morgan Taylor',
    age: 22,
    major: 'Engineering',
    year: 'Senior',
    college: 'State University',
    bio: 'Engineering student who loves problem-solving and creating things. Also passionate about outdoor activities.',
    interests: ['Engineering', 'Tech', 'Hiking', 'Photography', 'Cooking', 'Cycling'],
    email: 'morgan@state-university.edu',
    profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Cdefs%3E%3ClinearGradient id="grad4" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%232B0F1E;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FF3C8E;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="500" fill="url(%23grad4)"%3E%3C/rect%3E%3Ctext x="200" y="250" font-size="48" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3EMorgan%3C/text%3E%3C/svg%3E',
    gallery: [],
  },
  {
    name: 'Riley Chen',
    age: 20,
    major: 'Art',
    year: 'Junior',
    college: 'State University',
    bio: 'Artist and creative soul. Love museums, live music, and coffee dates.',
    interests: ['Art', 'Music', 'Coffee', 'Museums', 'Fashion', 'Writing'],
    email: 'riley@state-university.edu',
    profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Cdefs%3E%3ClinearGradient id="grad5" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FF3C8E;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%232B0F1E;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="500" fill="url(%23grad5)"%3E%3C/rect%3E%3Ctext x="200" y="250" font-size="48" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3ERiley%3C/text%3E%3C/svg%3E',
    gallery: [],
  },
]

// Demo current user
const DEMO_CURRENT_USER = {
  name: 'Demo User',
  age: 21,
  major: 'Computer Science',
  year: 'Junior',
  college: 'State University',
  bio: 'College student looking to connect with like-minded people. Love tech, games, and meeting new friends!',
  interests: ['Tech', 'Gaming', 'Movies', 'Coffee', 'Sports', 'Travel', 'Music', 'Art'],
  email: 'demo@state-university.edu',
  profilePhoto: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Cdefs%3E%3ClinearGradient id="grad0" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FF3C8E;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FF007A;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="500" fill="url(%23grad0)"%3E%3C/rect%3E%3Ctext x="200" y="250" font-size="48" fill="white" text-anchor="middle" dy=".3em" font-weight="bold"%3EDemo%3C/text%3E%3C/svg%3E',
  gallery: [],
}

export function initializeDemoData(): void {
  if (typeof window === 'undefined') return

  // Clear existing data
  localStorage.clear()

  // Create demo current user
  const currentUser = createUser(DEMO_CURRENT_USER)
  saveUser(currentUser)
  setCurrentUser(currentUser.id)

  // Create other demo users
  DEMO_USERS.forEach((userData) => {
    const user = createUser(userData)
    saveUser(user)
  })
}

export function loginAsDemo(): string | null {
  if (typeof window === 'undefined') return null

  initializeDemoData()

  // Get the current user we just created
  const allUsers = getAllUsers()
  const demoUser = allUsers.find((u) => u.email === DEMO_CURRENT_USER.email)

  if (demoUser) {
    setCurrentUser(demoUser.id)
    return demoUser.id
  }

  return null
}
