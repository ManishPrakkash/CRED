# CRED Points Management System 🏆

A modern mobile application built with React Native and Expo for managing CRED (Credit/Recognition/Engagement/Development) points in educational institutions. This system enables advisors to manage classes, staff to submit work requests, and provides real-time tracking of points and activities.

## 📱 Features

### For Staff Members
- **Join Multiple Classes** - Enter class codes to join different classes managed by advisors
- **Submit Work Requests** - Request CRED points for completed work with descriptions and attachments
- **Track Points** - View current CRED points balance and monthly statistics
- **Activity History** - Monitor request status (pending, approved, rejected) with detailed timeline
- **Leaderboard** - Compare performance with peers in real-time rankings
- **Notifications** - Receive instant updates on request approvals, rejections, and corrections
- **Profile Management** - Manage account settings and view personal statistics

### For Advisors (HOD)
- **Class Management** - Create and manage multiple classes with unique join codes
- **Request Review** - Approve, reject, or request corrections on staff submissions
- **Performance Analytics** - View comprehensive statistics across all classes
- **Staff Monitoring** - Track individual and class-wide performance metrics
- **Bulk Operations** - Manage multiple requests efficiently
- **Leaderboard Insights** - Monitor top performers and engagement levels

## 🚀 Tech Stack

- **Framework**: [Expo SDK 54](https://expo.dev) with React Native 0.81
- **Language**: TypeScript
- **Routing**: Expo Router (File-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: [Supabase](https://supabase.com) (PostgreSQL database, Authentication)
- **State Management**: React Context API
- **Icons**: Lucide React Native
- **UI Components**: Custom components with Linear Gradients
- **Storage**: AsyncStorage for local data persistence
- **Animations**: React Native Reanimated

## 📁 Project Structure

```
CRED/
├── app/                        
│   ├── _layout.tsx             
│   ├── index.tsx              
│   ├── login.tsx               
│   ├── joinClass.tsx          
│   ├── request.tsx             
│   ├── requestDetail.tsx      
│   ├── leaderboard.tsx       
│   ├── profile.tsx             
│   ├── classManagement.tsx     
│   └── notifications.tsx       
├── components/                 
│   ├── dashboards/
│   │   ├── StudentDashboard.tsx
│   │   ├── AdvisorDashboard.tsx
│   │   └── RepresentativeDashboard.tsx
│   ├── requests/
│   │   ├── RepresentativeRequest.tsx
│   │   └── AdvisorRequest.tsx   
│   ├── BottomNav.tsx            
│   ├── ClassLeaderboard.tsx    
│   ├── DeleteClassModal.tsx     
│   └── LeaveClassModal.tsx      
├── contexts/                    
│   ├── AuthContext.tsx         
│   └── ClassContext.tsx        
├── services/                     
│   ├── supabaseAuth.ts         
│   ├── supabaseClasses.ts       
│   ├── supabaseRequests.ts     
│   ├── supabaseActivities.ts   
│   └── notificationService.ts 
├── lib/                         
│   ├── supabase.ts            
│   ├── types.ts                
│   └── styles.ts                
├── constants/                   
│   └── theme.ts                 
└── schema.sql                    

```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CRED
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Supabase
1. Create a new project on [Supabase](https://supabase.com)
2. Run the SQL schema from `schema.sql` in your Supabase SQL editor
3. Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the Development Server
```bash
npm start
# or
npx expo start
```

### 5. Run on Device/Emulator
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

## 📊 Database Schema

### Main Tables
- **users** - User accounts (staff and advisors)
- **classes** - Class information and join codes
- **joined_classes** - Staff-class relationships
- **requests** - Work request submissions
- **activities** - Activity log for point changes
- **notifications** - User notifications

### Key Relationships
- One advisor manages many classes
- One class has many staff members
- Staff can join multiple classes
- Each request belongs to one staff and one class
- Activities track all point-related events

## 🎯 Key Features Explained

### Smart Navigation Guards
- Prevents unauthorized access to protected routes
- Redirects staff without active class to join page
- Disables back button on sensitive screens
- Conditional bottom navigation based on user state

### Real-time Updates
- Auto-refresh dashboards every 60 seconds
- Live notification badges
- Instant CRED point updates
- Dynamic leaderboard rankings

### Secure Class Management
- Unique join codes for each class
- Class deletion with cascade operations
- Staff can leave classes with confirmation
- Prevents back navigation after leaving active class

### Request Workflow
1. Staff submits work request with description
2. Advisor receives notification
3. Advisor approves/rejects/requests correction
4. Staff receives notification of decision
5. Points automatically updated on approval
6. Activity log created for transparency

## 🔐 Authentication & Security

- Email/password authentication via Supabase
- Row-level security (RLS) policies on all tables
- Secure API calls with JWT tokens
- Role-based access control (staff/advisor)
- Protected routes with navigation guards

## 📱 Platform Support

- ✅ Android
- ✅ iOS
- ⚠️ Web (limited support)

## 🚧 Development Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web browser
npm run lint       # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

**Metro bundler not starting:**
```bash
npx expo start --clear
```

**Supabase connection errors:**
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure RLS policies are configured

**Navigation issues:**
- Clear AsyncStorage: Check app settings
- Restart the app completely
- Check for active class selection

**Bottom navigation overlay:**
- Device uses 3-button navigation (automatic padding applied)
- Safe area insets handle gesture navigation

## 📈 Future Enhancements

- [ ] Push notifications via Expo Notifications
- [ ] File attachment support for requests
- [ ] Export reports to PDF
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Analytics dashboard for advisors
- [ ] Gamification features
- [ ] Social sharing of achievements

## 👥 User Roles

### Staff
- Submit work requests
- View personal dashboard
- Track points and activities
- Join/leave classes
- View leaderboards

### Advisor (HOD)
- Create and manage classes
- Review and process requests
- Monitor staff performance
- Generate reports
- Manage class settings

## 📄 License

This project is private and confidential.

## 🤝 Contributing

This is a private project. For internal contributions, please follow the standard Git workflow:

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Wait for code review
---
