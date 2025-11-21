# ProofQuest Frontend

React-based Telegram Mini App frontend for ProofQuest. Enables users to browse brand challenges, submit photo proofs, connect TON wallets, and track their submission history.

## Overview

The frontend is a single-page application (SPA) built with React and TypeScript, designed to run as a Telegram Mini App. It integrates with the TON Connect SDK for wallet functionality and Google's Gemini AI for client-side image verification before submission.

## Technology Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **Styling**: CSS
- **Telegram Integration**: Telegram WebApp SDK
- **Wallet Integration**: TON Connect SDK v3 and TON Connect UI React v2
- **AI Integration**: Google Generative AI SDK
- **Package Manager**: npm

## Project Structure

```
frontend/
├── index.html                   # HTML entry point
├── index.tsx                    # React entry point
├── App.tsx                      # Main application component
├── types.ts                     # TypeScript type definitions
├── constants.ts                 # Application constants
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── .env.local                  # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
├── metadata.json               # App metadata
├── tonconnect-manifest.json    # TON Connect configuration
├── backend/
│   └── api.ts                  # API integration layer
├── components/
│   ├── App.tsx                 # Main app component (may be duplicate)
│   ├── BottomNav.tsx          # Bottom navigation bar
│   ├── BountyCard.tsx         # Bounty card component
│   ├── BountyDetails.tsx      # Bounty details view
│   ├── ChallengeCard.tsx      # Challenge card display
│   ├── ChallengeDetails.tsx   # Challenge details modal
│   ├── ConnectWallet.tsx      # TON wallet connection
│   ├── CreateBountyView.tsx   # Create bounty interface
│   ├── Header.tsx             # App header
│   ├── LoginScreen.tsx        # Telegram login screen
│   ├── ProfileView.tsx        # User profile page
│   └── icons/                 # SVG icon components
│       ├── CameraIcon.tsx
│       ├── CheckCircleIcon.tsx
│       ├── HomeIcon.tsx
│       ├── LocationIcon.tsx
│       ├── PlusCircleIcon.tsx
│       ├── ShieldCheckIcon.tsx
│       ├── SparklesIcon.tsx
│       ├── StarIcon.tsx
│       ├── TelegramIcon.tsx
│       ├── TonIcon.tsx
│       ├── UploadIcon.tsx
│       ├── UserIcon.tsx
│       └── XIcon.tsx
└── docs/
    └── frontend_api_spec.md    # API integration specification
```

## Features

### Core Functionality
- Telegram Mini App authentication
- TON wallet connection and management
- Browse active challenges
- Submit photos for challenges
- AI-powered image verification
- View submission history
- User profile management
- Responsive design for mobile devices

### User Interface
- Clean, modern design
- Bottom navigation for easy access
- Modal-based challenge details
- Image upload with preview
- Real-time wallet status
- Loading states and error handling

### Integrations
- Seamless Telegram authentication
- TON Connect wallet integration
- Google Gemini AI for verification
- Backend API for data persistence

## Installation

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Gemini API key (for AI verification)

### Setup Steps

1. Navigate to the frontend directory:
   ```bash
   cd ProofQuest/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   
   Create `.env.local` file in the frontend directory:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Configure TON Connect:
   
   Update `tonconnect-manifest.json` with your app details:
   ```json
   {
     "url": "https://your-app-url.com",
     "name": "ProofQuest",
     "iconUrl": "https://your-app-url.com/icon.png"
   }
   ```

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

Build the application for production:

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI verification | Yes |

Note: Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

### API Configuration

The backend API URL is configured in `backend/api.ts`:

```typescript
const BASE_URL = 'https://your-app.onrender.com';
```

For local development, change this to:

```typescript
const BASE_URL = 'http://localhost:8000';
```

### TON Connect Configuration

Update `tonconnect-manifest.json` with your application details:

```json
{
  "url": "https://your-telegram-mini-app.com",
  "name": "ProofQuest",
  "iconUrl": "https://your-telegram-mini-app.com/icon.png",
  "termsOfUseUrl": "https://your-telegram-mini-app.com/terms",
  "privacyPolicyUrl": "https://your-telegram-mini-app.com/privacy"
}
```

## Components

### Core Components

#### App.tsx
Main application component that manages:
- User authentication state
- View routing
- Telegram WebApp integration
- TON Connect provider
- Global state management

#### LoginScreen.tsx
Handles Telegram authentication:
- Retrieves Telegram user data
- Calls backend login endpoint
- Sets authenticated user state

#### Header.tsx
Application header displaying:
- App logo and name
- User information
- Wallet connection status

#### BottomNav.tsx
Bottom navigation bar with tabs for:
- Home (challenges)
- Profile
- Create bounty (if applicable)

### Challenge Components

#### ChallengeCard.tsx
Displays challenge summary:
- Challenge title
- Reference image
- Reward information
- Deadline
- Click to view details

#### ChallengeDetails.tsx
Modal showing full challenge details:
- Complete description
- Requirements
- Submission form
- Image upload interface
- AI verification status

### Profile Components

#### ProfileView.tsx
User profile page showing:
- User information
- Wallet connection status
- Submission history
- Statistics

#### ConnectWallet.tsx
TON wallet connection interface:
- Connect button
- Wallet address display
- Disconnect functionality

### Utility Components

#### Icons
Custom SVG icon components for consistent styling and easy customization.

## API Integration

### API Client

The `backend/api.ts` file provides functions for all API interactions:

```typescript
// User authentication
login(telegramUser): Promise<User>

// Wallet management
linkWallet(telegramId, walletAddress): Promise<void>

// Challenge operations
getActiveChallenges(): Promise<Challenge[]>

// Submission operations
createSubmission(submission): Promise<Submission>
getUserSubmissions(telegramId): Promise<SubmissionWithChallengeDetails[]>

// Verification logging
logVerification(payload): Promise<void>
```

### Error Handling

All API calls include error handling:

```typescript
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
            message: response.statusText 
        }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};
```

## Type Definitions

### User

```typescript
interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  wallet_address?: string | null;
  created_at: string;
  balance?: number;
}
```

### Challenge

```typescript
interface Challenge {
  id: number;
  title: string;
  description: string;
  image_url: string;
  reward_info: string;
  deadline: string;
  status: "active" | "expired";
}
```

### Submission

```typescript
interface Submission {
  id: number;
  user_id: number;
  challenge_id: number;
  image_url: string;
  created_at: string;
}
```

### SubmissionWithChallengeDetails

```typescript
interface SubmissionWithChallengeDetails {
  id: number;
  challenge_id: number;
  challenge_title: string;
  image_url: string;
  image_data?: string | null;
  image_mime_type?: string | null;
  created_at: string;
}
```

## AI Verification

### Image Verification Flow

1. User selects an image for submission
2. Image is converted to base64
3. Sent to Gemini AI with verification prompt
4. AI analyzes image against challenge requirements
5. Returns APPROVED, REJECTED, or API_ERROR
6. Result is logged to backend
7. If approved, submission is created

### Verification Prompt

The AI prompt includes:
- Challenge title and description
- Specific requirements to verify
- Instructions for response format
- Image data for analysis

### Verification Logging

All verification attempts are logged:

```typescript
interface VerificationLogPayload {
  user_telegram_id: number;
  challenge_id: number;
  image_data: string;
  image_mime_type: string;
  ai_model_used: string;
  ai_prompt: string;
  ai_raw_response?: string;
  verification_result: 'APPROVED' | 'REJECTED' | 'API_ERROR';
  error_message?: string;
  api_call_duration_ms: number;
}
```

## Telegram Mini App Integration

### Initialization

The app initializes the Telegram WebApp SDK:

```typescript
const tg = window.Telegram?.WebApp;
tg?.ready();
```

### User Data Access

Retrieve Telegram user information:

```typescript
const user = tg?.initDataUnsafe?.user;
const telegramUser = {
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  username: user.username,
  photo_url: user.photo_url
};
```

### WebApp Features

Access Telegram Mini App capabilities:
- `tg.ready()` - Signal app is ready
- `tg.expand()` - Expand to full screen
- `tg.MainButton` - Use Telegram's main button
- `tg.BackButton` - Handle back navigation
- `tg.close()` - Close the Mini App

## TON Connect Integration

### Provider Setup

Wrap the app with `TonConnectUIProvider`:

```tsx
<TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
  <App />
</TonConnectUIProvider>
```

### Wallet Connection

Use TON Connect hooks:

```tsx
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

const address = useTonAddress();
const [tonConnectUI] = useTonConnectUI();

// Connect wallet
await tonConnectUI.connectWallet();

// Disconnect wallet
await tonConnectUI.disconnect();
```

### Wallet Address Sync

Automatically sync wallet address to backend:

```tsx
useEffect(() => {
  if (currentUser && walletAddress && walletAddress !== currentUser.wallet_address) {
    linkWallet(currentUser.telegram_id, walletAddress)
      .then(() => {
        setCurrentUser(prev => ({ ...prev, wallet_address: walletAddress }));
      });
  }
}, [walletAddress]);
```

## Styling

### CSS Organization

Styles are organized by component with scoped classes. Each component has its own style section or external CSS file.

### Responsive Design

The application is optimized for mobile devices:
- Flexible layouts
- Touch-friendly buttons
- Appropriate font sizes
- Mobile-first approach

### Design System

Consistent design elements:
- Color palette
- Typography scale
- Spacing system
- Border radius
- Shadow styles

## Testing

### Manual Testing

1. Test in Telegram Web:
   - Open Telegram Web
   - Access the Mini App
   - Test all user flows

2. Test with Telegram Desktop:
   - Open Telegram Desktop
   - Navigate to the bot
   - Launch Mini App

3. Test on Mobile:
   - Use Telegram mobile app
   - Test on iOS and Android
   - Verify touch interactions

### Development Testing

Use the Telegram Bot API test environment:
- Create a test bot
- Configure test Mini App
- Test without affecting production

## Deployment

### Static Hosting

Deploy the built application to any static hosting service:

#### Vercel

```bash
npm run build
vercel --prod
```

#### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

#### GitHub Pages

```bash
npm run build
# Deploy the dist/ directory to GitHub Pages
```

### Telegram Mini App Hosting

Telegram can host your Mini App directly:

1. Build the application
2. Upload to Telegram's hosting via BotFather
3. Configure your bot with the Mini App URL

### Environment Variables

Set environment variables in your hosting platform:
- Vercel: Project Settings > Environment Variables
- Netlify: Site Settings > Build & Deploy > Environment
- Others: Follow platform-specific instructions

## Security Considerations

### API Key Protection

- Never commit `.env.local` to git
- Use environment variables for sensitive data
- Rotate API keys regularly

### User Data

- Only store necessary user data
- Respect user privacy
- Follow Telegram's data usage policies

### Content Security

- Validate user inputs
- Sanitize displayed content
- Implement proper error boundaries

## Performance Optimization

### Bundle Size

- Use code splitting
- Lazy load components
- Optimize images
- Tree shake unused code

### Runtime Performance

- Memoize expensive calculations
- Use React.memo for component optimization
- Implement virtual scrolling for long lists
- Debounce user inputs

### Network Optimization

- Cache API responses appropriately
- Implement retry logic for failed requests
- Use optimistic UI updates
- Compress images before upload

## Troubleshooting

### Common Issues

#### Telegram WebApp Not Found
**Solution**: Ensure you're running in a Telegram Mini App context or use the simulator.

#### Wallet Connection Fails
**Solution**: Verify `tonconnect-manifest.json` is properly configured and accessible.

#### API Calls Failing
**Solution**: Check the `BASE_URL` in `backend/api.ts` points to the correct backend.

#### Build Errors
**Solution**: Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables Not Working
**Solution**: Ensure variables are prefixed with `VITE_` and restart the dev server.

### Debug Mode

Enable verbose logging in the browser console to debug issues:

```typescript
console.log('Current user:', currentUser);
console.log('Challenges:', challenges);
console.log('Wallet address:', walletAddress);
```

## Development Workflow

1. Make changes to components or logic
2. Test in development mode (`npm run dev`)
3. Build for production (`npm run build`)
4. Test the production build (`npm run preview`)
5. Deploy to hosting platform
6. Test in actual Telegram environment

## Best Practices

### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Keep components small and focused
- Use TypeScript for type safety

### State Management
- Lift state up when needed
- Use context for global state
- Keep state as local as possible
- Implement proper loading states

### Code Organization
- Group related components
- Use clear naming conventions
- Keep files focused and concise
- Document complex logic

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [TON Connect Documentation](https://docs.ton.org/develop/dapps/ton-connect/overview)
- [Google Gemini AI](https://ai.google.dev/)

## Support

For issues or questions:
1. Check the documentation
2. Review the API integration specification
3. Test in the Telegram Web environment
4. Check browser console for errors

## License

This project is private and proprietary.
