# OAuth Setup Guide

This guide explains how to configure Google and Apple OAuth authentication for the EnerjiOS application.

## Overview

The application now supports three authentication methods:
1. **Email/Password** - Traditional credentials-based login
2. **Google OAuth** - Sign in with Google account
3. **Apple OAuth** - Sign in with Apple ID

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Apple OAuth Configuration
APPLE_ID=your_apple_service_id_here
APPLE_SECRET=your_apple_private_key_here
APPLE_TEAM_ID=your_apple_team_id_here
APPLE_KEY_ID=your_apple_key_id_here
APPLE_PRIVATE_KEY=your_apple_private_key_here
```

## Google OAuth Setup

### 1. Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google Identity services
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

### 2. Configure Environment Variables

```bash
GOOGLE_CLIENT_ID=your_client_id_from_google_console
GOOGLE_CLIENT_SECRET=your_client_secret_from_google_console
```

## Apple OAuth Setup

### 1. Create Apple Developer Account Setup

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new App ID if you don't have one
4. Create a Service ID for "Sign in with Apple"

### 2. Configure Service ID

1. Enable "Sign in with Apple" for your Service ID
2. Configure domains and redirect URLs:
   - Development: `localhost:3000`
   - Production: `yourdomain.com`
   - Redirect URI: `/api/auth/callback/apple`

### 3. Create Private Key

1. Go to "Keys" section in Apple Developer Console
2. Create a new key and enable "Sign in with Apple"
3. Download the `.p8` private key file
4. Note the Key ID

### 4. Configure Environment Variables

```bash
APPLE_ID=your_service_id_from_apple_developer
APPLE_SECRET=your_private_key_content_or_path_to_p8_file
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
```

## Security Features

### Rate Limiting
- OAuth attempts are rate-limited to prevent abuse
- Default: 10 attempts per 15 minutes per email
- Configurable in `src/lib/env-validation.ts`

### Account Linking
- Existing users can link OAuth accounts to their email
- New OAuth users automatically get CUSTOMER role
- Prevents duplicate accounts with same email

### Error Handling
- Graceful error handling for OAuth failures
- User-friendly error messages in Turkish
- Comprehensive logging for debugging

## Implementation Files

### Core Authentication
- `src/lib/auth.ts` - NextAuth.js configuration with Google/Apple providers
- `src/lib/env-validation.ts` - Environment validation and rate limiting

### UI Components
- `src/components/ui/oauth-buttons.tsx` - Reusable OAuth button components
- `src/components/auth/dynamic-oauth-buttons.tsx` - Dynamic provider detection
- `src/components/forms/signin-form.tsx` - Updated signin form with OAuth

### Database
- `prisma/schema.prisma` - Account model supports OAuth data

## Usage

### Basic OAuth Buttons
```tsx
import { OAuthButtons } from '@/components/ui/oauth-buttons'

<OAuthButtons
  callbackUrl="/dashboard"
  disabled={isLoading}
/>
```

### Individual OAuth Button
```tsx
import { OAuthButton } from '@/components/ui/oauth-buttons'

<OAuthButton
  provider="google"
  callbackUrl="/dashboard"
/>
```

### Dynamic Provider Detection
```tsx
import { DynamicOAuthButtons } from '@/components/auth/dynamic-oauth-buttons'

<DynamicOAuthButtons callbackUrl="/dashboard" />
```

## Testing

### Development Testing
1. Ensure environment variables are set
2. Start development server: `npm run dev`
3. Visit `/auth/signin` to test OAuth flows

### Production Testing
1. Update redirect URIs in provider configurations
2. Set production environment variables
3. Test complete OAuth flows

## Troubleshooting

### Common Issues

**Google OAuth "redirect_uri_mismatch"**
- Verify redirect URI in Google Console matches exactly
- Check protocol (http vs https)
- Ensure port matches (3000 for development)

**Apple OAuth "invalid_client"**
- Verify Service ID configuration
- Check Team ID and Key ID are correct
- Ensure private key is properly formatted

**OAuth buttons not showing**
- Check environment variables are set
- Verify provider configuration in auth.ts
- Check browser console for errors

### Debug Mode
Enable debug logging in development:
```bash
NODE_ENV=development
```

This will show OAuth provider status in console on startup.

## Security Considerations

1. **Environment Variables**: Never commit OAuth secrets to version control
2. **HTTPS**: Always use HTTPS in production for OAuth callbacks
3. **Redirect URIs**: Whitelist only necessary redirect URIs
4. **Rate Limiting**: Monitor OAuth attempt patterns
5. **Account Verification**: Consider email verification for OAuth accounts

## Database Schema

The existing Account model supports OAuth data:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String  // "google" or "apple"
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

## Next Steps

1. Configure OAuth applications with providers
2. Set environment variables
3. Test OAuth flows thoroughly
4. Monitor OAuth usage and errors
5. Consider additional providers if needed