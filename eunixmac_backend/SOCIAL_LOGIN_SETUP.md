# Social Login Implementation Guide

## Overview

This application supports social authentication via Google and Facebook using Laravel Socialite. The implementation includes comprehensive error handling, security features, and rate limiting.

## Features Implemented

### ✅ Backend Features

1. **Multi-Provider Support**
   - Google OAuth 2.0
   - Facebook OAuth 2.0
   - Twitter/X OAuth 2.0 (ready, needs credentials)

2. **Security Features**
   - CSRF protection using state parameter
   - Rate limiting (10 attempts per minute per IP)
   - Comprehensive error handling with logging
   - Token expiration (30 days)

3. **User Management**
   - Automatic account creation
   - Account linking for existing emails
   - Avatar/profile picture import
   - Email verification auto-marked as verified
   - Referral code generation

4. **Error Handling**
   - Provider-specific error detection
   - Detailed logging for debugging
   - User-friendly error messages
   - Graceful fallback mechanisms

### ✅ Frontend Features

1. **User Experience**
   - Loading states during authentication
   - Smooth provider redirect
   - Callback handling with user data fetch
   - Toast notifications for errors
   - Clean URL management

2. **Error Display**
   - Descriptive error messages for each scenario
   - Automatic redirect cleanup
   - Token cleanup on failure

## Configuration

### Backend Configuration

#### 1. Environment Variables (`.env`)

```env
# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/auth/facebook/callback

# Twitter/X OAuth (optional)
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_REDIRECT_URI=http://localhost:8000/api/auth/twitter/callback
```

#### 2. Services Configuration (`config/services.php`)

Already configured. No changes needed.

#### 3. Database Migration

The social login fields migration is already applied:
- `provider` (string, nullable)
- `provider_id` (string, nullable)
- `provider_token` (string, nullable)

#### 4. Rate Limiting (`app/Providers/RouteServiceProvider.php`)

Rate limiter configured with 10 attempts per minute per IP for social login endpoints.

### Frontend Configuration

#### Environment Variables (`.env`)

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:5173
```

## Provider Setup Guides

### Google OAuth Setup

1. **Create Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

4. **Copy Credentials**
   - Copy "Client ID" to `GOOGLE_CLIENT_ID`
   - Copy "Client secret" to `GOOGLE_CLIENT_SECRET`

### Facebook OAuth Setup

1. **Create App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Choose "Consumer" app type

2. **Add Facebook Login**
   - In app dashboard, click "Add Product"
   - Add "Facebook Login"

3. **Configure OAuth Settings**
   - Go to Facebook Login > Settings
   - Add Valid OAuth Redirect URIs:
     - `http://localhost:8000/api/auth/facebook/callback` (development)
     - `https://yourdomain.com/api/auth/facebook/callback` (production)

4. **Copy Credentials**
   - Go to Settings > Basic
   - Copy "App ID" to `FACEBOOK_CLIENT_ID`
   - Copy "App Secret" to `FACEBOOK_CLIENT_SECRET`

5. **Publish App**
   - For production, submit app for review
   - Request permissions: `email`, `public_profile`

### Twitter/X OAuth Setup (Optional)

1. **Create App**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/)
   - Create a new project and app

2. **Configure OAuth 2.0**
   - Enable OAuth 2.0
   - Set callback URL:
     - `http://localhost:8000/api/auth/twitter/callback` (development)
     - `https://yourdomain.com/api/auth/twitter/callback` (production)

3. **Copy Credentials**
   - Copy "Client ID" to `TWITTER_CLIENT_ID`
   - Copy "Client Secret" to `TWITTER_CLIENT_SECRET`

4. **Enable in Frontend**
   - Uncomment Twitter button in `SocialLoginButtons.jsx`

## Authentication Flow

### Complete Flow Diagram

```
User Click Social Login Button
    ↓
Frontend: Redirect to /api/auth/{provider}/redirect
    ↓
Backend: Generate state parameter (CSRF protection)
    ↓
Backend: Redirect to Social Provider (Google/Facebook/Twitter)
    ↓
User: Authenticates with Social Provider
    ↓
Social Provider: Redirects to /api/auth/{provider}/callback?code=xxx&state=xxx
    ↓
Backend: Verify state parameter
    ↓
Backend: Exchange code for access token
    ↓
Backend: Fetch user data from provider
    ↓
Backend: Check if user exists (by provider_id)
    ├─ Exists: Update token
    └─ Not Exists:
        ├─ Check if email exists
        │   ├─ Exists: Link accounts
        │   └─ Not Exists: Create new user
        └─ Create user settings
    ↓
Backend: Create Sanctum token (30 days expiration)
    ↓
Backend: Redirect to frontend: /login?token=xxx&social=true
    ↓
Frontend: Receive token
    ↓
Frontend: Fetch user data using token from /api/user
    ↓
Frontend: Store user data and token in auth context
    ↓
Frontend: Navigate to dashboard or previous page
```

## Error Codes

| Error Code | Description | User Action |
|------------|-------------|-------------|
| `invalid_provider` | Invalid OAuth provider | Use Google or Facebook |
| `configuration_error` | Missing OAuth credentials | Contact support |
| `provider_error` | Provider API error | Try again later |
| `security_check_failed` | CSRF validation failed | Try again |
| `authentication_failed` | General authentication error | Try again |
| `redirect_failed` | Failed to redirect to provider | Check network connection |

## API Endpoints

### Social Login Redirect
```http
GET /api/auth/{provider}/redirect
```
- **Provider**: `google`, `facebook`, `twitter`
- **Response**: Redirects to social provider
- **Rate Limit**: 10 requests per minute per IP

### Social Login Callback
```http
GET /api/auth/{provider}/callback?code={code}&state={state}
```
- **Provider**: `google`, `facebook`, `twitter`
- **Query Params**:
  - `code`: Authorization code from provider
  - `state`: CSRF protection token
- **Response**: Redirects to frontend with token
- **Rate Limit**: 10 requests per minute per IP

### Get Authenticated User
```http
GET /api/user
Headers:
  Authorization: Bearer {token}
```
- **Response**: User object with settings
- **Rate Limit**: 60 requests per minute

## Testing

### Manual Testing Checklist

#### Google Login
- [ ] Click "Continue with Google"
- [ ] Redirects to Google login
- [ ] Select/login with Google account
- [ ] Redirects back to app
- [ ] User is logged in
- [ ] Profile picture imported
- [ ] Email verified automatically

#### Facebook Login
- [ ] Click "Continue with Facebook"
- [ ] Redirects to Facebook login
- [ ] Login with Facebook account
- [ ] Approve permissions
- [ ] Redirects back to app
- [ ] User is logged in
- [ ] Profile picture imported

#### Error Scenarios
- [ ] Cancel OAuth flow - Shows error
- [ ] Deny permissions - Shows error
- [ ] Network error - Shows error
- [ ] Rate limit exceeded - Shows rate limit message

#### Account Linking
- [ ] Register with email
- [ ] Login with social provider using same email
- [ ] Account gets linked (check database)
- [ ] Can login with both methods

## Database Schema

### Users Table Additions

```sql
provider VARCHAR(255) NULL          -- 'google', 'facebook', 'twitter', null for regular
provider_id VARCHAR(255) NULL       -- Social provider user ID
provider_token TEXT NULL            -- OAuth access token (hidden in API)
email_verified_at TIMESTAMP NULL    -- Auto-set for social logins
profile_picture VARCHAR(255) NULL   -- Avatar URL from provider
```

### Indexes
- `(provider, provider_id)` - For quick social user lookup
- `email` - For account linking

## Security Considerations

### Implemented Security Measures

1. **CSRF Protection**
   - State parameter validation
   - Prevents OAuth CSRF attacks

2. **Rate Limiting**
   - 10 attempts per minute per IP
   - Prevents brute force and abuse

3. **Token Security**
   - 30-day expiration
   - Stored securely (hidden in responses)
   - Automatic cleanup possible

4. **Input Validation**
   - Provider validation
   - Email validation
   - Error handling for malformed data

5. **Logging**
   - All social login attempts logged
   - Error details logged for debugging
   - User activity tracked

### Additional Security Recommendations

1. **Production Checklist**
   - [ ] Use HTTPS for all endpoints
   - [ ] Update OAuth redirect URLs to production domain
   - [ ] Enable Facebook app review and publish
   - [ ] Monitor logs for suspicious activity
   - [ ] Implement IP blocking for repeated failures
   - [ ] Add 2FA option for users

2. **Privacy**
   - [ ] Update Privacy Policy with social login details
   - [ ] Add data deletion capability
   - [ ] Inform users about data collected
   - [ ] Allow users to unlink social accounts

## Troubleshooting

### Common Issues

#### Issue: "Invalid OAuth Provider"
**Cause**: Frontend sending invalid provider name
**Solution**: Check `SocialLoginButtons.jsx` uses correct provider names

#### Issue: "Configuration Error"
**Cause**: Missing OAuth credentials in `.env`
**Solution**:
1. Verify credentials in `.env`
2. Run `php artisan config:clear`
3. Restart server

#### Issue: "Provider Error"
**Cause**: Invalid OAuth credentials or expired app
**Solution**:
1. Verify credentials in provider dashboard
2. Check callback URLs match exactly
3. Ensure app is published (Facebook)

#### Issue: "Security Check Failed"
**Cause**: State parameter mismatch
**Solution**:
1. Check if cookies/sessions are working
2. Verify domain configuration
3. Try clearing browser cache

#### Issue: Token Not Working
**Cause**: Token not passed correctly or expired
**Solution**:
1. Check token in URL after callback
2. Verify `/api/user` endpoint works
3. Check token expiration

### Debug Mode

Enable detailed logging in development:

```php
// Add to .env
APP_DEBUG=true
LOG_LEVEL=debug
```

Check logs:
```bash
tail -f storage/logs/laravel.log
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update `FRONTEND_URL` to production domain
- [ ] Update OAuth redirect URLs in provider dashboards
- [ ] Set `APP_DEBUG=false` in production `.env`
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Test all social providers
- [ ] Verify rate limiting works
- [ ] Monitor logs after deployment

### Environment Variables

Update these for production:
```env
FRONTEND_URL=https://yourdomain.com
GOOGLE_REDIRECT_URL=https://yourdomain.com/api/auth/google/callback
FACEBOOK_REDIRECT_URI=https://yourdomain.com/api/auth/facebook/callback
```

## Monitoring

### Key Metrics to Monitor

1. **Success Rate**
   - Track successful vs failed logins
   - Monitor by provider

2. **Performance**
   - Average callback processing time
   - Token generation time

3. **Errors**
   - Rate of each error type
   - Provider-specific failures

4. **Security**
   - Rate limit triggers
   - Invalid state attempts
   - Suspicious patterns

### Log Queries

```bash
# View social login attempts
grep "Social login" storage/logs/laravel.log

# View errors
grep "ERROR" storage/logs/laravel.log | grep "Social"

# Count by provider
grep "provider.*google" storage/logs/laravel.log | wc -l
```

## Support

### For Developers

- Check logs: `storage/logs/laravel.log`
- Test endpoints: Use Postman/Insomnia
- Debug: Add `dd()` in controller

### For Users

Common user-facing errors and solutions:
1. "Try again" - Temporary issue, retry
2. "Contact support" - Configuration issue
3. "Use Google or Facebook" - Invalid provider attempted

## Future Enhancements

### Potential Improvements

1. **Additional Providers**
   - Apple Sign In
   - GitHub OAuth
   - LinkedIn OAuth

2. **Enhanced Features**
   - Account unlinking
   - Multiple providers per account
   - Social share integration
   - Profile sync from provider

3. **Security**
   - Passwordless authentication
   - Device management
   - Login history

4. **User Experience**
   - Progressive profile completion
   - Social connections/friends import
   - One-tap sign in

## Version History

- **v1.0.0** (2025-12-09): Initial implementation
  - Google & Facebook OAuth
  - Complete security measures
  - Comprehensive error handling
  - Rate limiting
  - Production-ready
