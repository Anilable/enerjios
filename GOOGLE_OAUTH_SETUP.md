# Google OAuth Setup Guide for EnerjiOS

## 🚨 Current Issues Fixed:

### 1. **Environment Variables** ✅
- Fixed `NEXTAUTH_URL` from `localhost:3001` → `localhost:3000`
- Fixed production URL from `netlify.app` → `enerjios.com`
- Added placeholder credentials in both dev/prod environments

### 2. **NextAuth Configuration** ✅
- Enhanced Google provider with proper authorization params
- Improved callback handling for Google OAuth
- Added better error logging and debugging

## 📋 Required Setup Steps:

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and "Google OAuth2 API"
   - Click "Enable" for both

### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Set Application Type to "Web Application"
4. Configure for **Development**:
   ```
   Authorized JavaScript origins:
   - http://localhost:3000

   Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google
   ```

5. Configure for **Production**:
   ```
   Authorized JavaScript origins:
   - https://enerjios.com

   Authorized redirect URIs:
   - https://enerjios.com/api/auth/callback/google
   ```

### Step 3: Update Environment Variables

#### Development (.env.local):
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production-super-secure-key-at-least-32-chars
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_FROM_CONSOLE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_FROM_CONSOLE
```

#### Production (Deployment Environment):
```env
NEXTAUTH_URL=https://enerjios.com
NEXTAUTH_SECRET=your-production-nextauth-secret-at-least-32-characters-long-secure-key
GOOGLE_CLIENT_ID=YOUR_PRODUCTION_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_PRODUCTION_GOOGLE_CLIENT_SECRET
```

### Step 4: Deployment Configuration

#### For Netlify:
1. Go to Site Settings → Environment Variables
2. Add the production environment variables
3. Redeploy the site

#### For Vercel:
1. Go to Project Settings → Environment Variables
2. Add the production environment variables
3. Redeploy from Git

## 🔍 Debugging Steps:

### 1. Check Environment Variables
```bash
# In your project directory
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
echo $NEXTAUTH_URL
```

### 2. Verify Google Cloud Console Settings
- ✅ OAuth 2.0 Client ID is created
- ✅ Correct redirect URIs are set
- ✅ APIs are enabled
- ✅ Client ID and Secret are copied correctly

### 3. Test the OAuth Flow

1. **Development Testing**:
   ```
   http://localhost:3000/auth/signin
   ```
   - Click "Google ile giriş yap"
   - Should redirect to Google OAuth
   - After consent, should redirect back to dashboard

2. **Production Testing**:
   ```
   https://enerjios.com/auth/signin
   ```
   - Same flow as development
   - Check browser console for any errors

### 4. Common Error Solutions

#### Error 400: redirect_uri_mismatch
- **Cause**: Redirect URI not configured in Google Console
- **Solution**: Add exact redirect URI to Google Console:
  - Dev: `http://localhost:3000/api/auth/callback/google`
  - Prod: `https://enerjios.com/api/auth/callback/google`

#### Error 401: invalid_client
- **Cause**: Wrong CLIENT_ID or CLIENT_SECRET
- **Solution**: Double-check credentials in Google Console

#### Environment Variable Not Found
- **Cause**: Variables not loaded or misspelled
- **Solution**: Check `.env.local` file and restart dev server

## 🧪 Testing Checklist:

- [ ] Google OAuth button appears on signin page
- [ ] Clicking button redirects to Google OAuth
- [ ] Google consent screen shows correct app name
- [ ] After consent, redirects back to dashboard
- [ ] User is logged in and session is created
- [ ] User info is saved to database
- [ ] No console errors during flow

## 🚀 Enhanced Features Implemented:

1. **Better Error Handling**: Comprehensive error logging in callbacks
2. **User Creation**: Automatic user profile creation for new Google users
3. **Database Integration**: Proper user data sync with existing database
4. **Flexible Redirects**: Smart redirect handling for different scenarios
5. **Development/Production Support**: Environment-specific configurations

## 📞 Support:

If you're still experiencing issues:

1. Check browser developer console for errors
2. Check server logs for NextAuth debug messages
3. Verify all environment variables are set correctly
4. Ensure Google Cloud Console configuration matches exactly

The OAuth flow should work seamlessly once the Google credentials are properly configured!