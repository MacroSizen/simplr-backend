# Deployment Guide - Simplr Full Stack

Complete deployment guide for both the Next.js backend API and Expo mobile app.

## 📋 Prerequisites

- GitHub account
- Vercel account
- Expo account (for mobile builds)
- Supabase project with database configured

## 🚀 Part 1: Backend Deployment (Vercel)

### Step 1: Prepare the Backend

1. **Ensure all environment variables are documented:**

Create `.env.example` in your Next.js project:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. **Test the API locally:**
```bash
cd /Users/tomasgiraudo/NoBackup/Projects/simplr
npm run dev

# Test endpoints
curl http://localhost:3000/api/auth/me
```

### Step 2: Push to GitHub

```bash
cd /Users/tomasgiraudo/NoBackup/Projects/simplr

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Backend API with server actions"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/simplr.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Import your GitHub repository:**
   - Click "New Project"
   - Import `simplr` repository
   - Select Framework: Next.js

3. **Configure Environment Variables:**

Add these in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Note your deployment URL (e.g., `https://simplr-xyz.vercel.app`)

5. **Test the deployed API:**
```bash
curl https://your-app.vercel.app/api/auth/me
```

### Step 4: Configure Custom Domain (Optional)

1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate generation

## 📱 Part 2: Mobile App Deployment (EAS)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure EAS Build

1. **Navigate to mobile project:**
```bash
cd /Users/tomasgiraudo/NoBackup/Projects/simplr-mobile
```

2. **Initialize EAS:**
```bash
eas build:configure
```

3. **Update `eas.json` with production API URL:**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-app.vercel.app/api"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-app.vercel.app/api"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

4. **Update `app.json` with bundle identifiers:**

```json
{
  "expo": {
    "name": "Simplr",
    "slug": "simplr-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.simplr",
      "supportsTablet": true,
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.simplr",
      "versionCode": 1
    }
  }
}
```

### Step 4: Build for iOS

```bash
# Internal testing build
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production
```

**Note**: You'll need an Apple Developer account ($99/year) for App Store distribution.

### Step 5: Build for Android

```bash
# Internal testing build (APK)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

### Step 6: Submit to App Stores

#### iOS App Store

1. **Prepare App Store Connect:**
   - Create app record
   - Add screenshots, description, keywords
   - Set app category and pricing

2. **Submit build:**
```bash
eas submit --platform ios
```

3. **Review process:**
   - Apple reviews typically take 1-3 days
   - Respond to any rejection feedback

#### Google Play Store

1. **Prepare Play Console:**
   - Create app listing
   - Add screenshots, description
   - Set content rating

2. **Submit build:**
```bash
eas submit --platform android
```

3. **Review process:**
   - Google reviews typically take 1-3 days
   - App will go through security screening

## 🔐 Security Checklist

### Backend

- [ ] All API routes have authentication checks
- [ ] Environment variables are not committed to git
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented (if needed)
- [ ] Input validation with Zod on all endpoints
- [ ] SQL injection protection (via Supabase)
- [ ] XSS protection enabled

### Mobile App

- [ ] API keys stored in environment variables
- [ ] Tokens stored in SecureStore
- [ ] HTTPS only for API calls
- [ ] Sensitive data not logged
- [ ] App Transport Security configured
- [ ] Certificate pinning (optional, advanced)

## 📊 Monitoring & Analytics

### Backend Monitoring

**Option 1: Vercel Analytics**
- Automatic with Vercel deployment
- View in Vercel dashboard

**Option 2: Sentry**
```bash
npm install @sentry/nextjs
```

Add to `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(/* your config */);
```

### Mobile App Analytics

**Option 1: Expo Analytics**
```bash
npx expo install expo-analytics
```

**Option 2: Firebase Analytics**
```bash
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

## 🔄 CI/CD Setup (Optional)

### GitHub Actions for Backend

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### GitHub Actions for Mobile

Create `.github/workflows/build.yml`:

```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: expo/expo-github-action@v7
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive
```

## 📝 Post-Deployment Tasks

1. **Test all features on production:**
   - [ ] User registration
   - [ ] User login
   - [ ] Create/Read/Update/Delete for all entities
   - [ ] Offline mode
   - [ ] Token refresh

2. **Set up monitoring alerts:**
   - [ ] Error tracking
   - [ ] Performance monitoring
   - [ ] Uptime monitoring

3. **Document API endpoints:**
   - [ ] Create API documentation (e.g., Swagger/OpenAPI)
   - [ ] Share with mobile team

4. **Plan for updates:**
   - [ ] Set up version numbering strategy
   - [ ] Plan release schedule
   - [ ] Create changelog process

## 🆘 Rollback Procedures

### Backend Rollback (Vercel)

1. Go to Vercel dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Mobile App Rollback

**iOS:**
- You can't roll back in App Store
- Submit a new version with the fix
- Or revert code and submit as new build

**Android:**
- Play Console allows staged rollouts
- Can pause rollout or halt release
- Or submit new version with fix

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console)

## 📞 Support

For deployment issues:
1. Check Vercel/EAS build logs
2. Review error messages
3. Check environment variables
4. Verify API connectivity
5. Test authentication flow

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] API endpoints secured
- [ ] Database migrations run
- [ ] Code pushed to GitHub

### Backend Deployment
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Domain configured (optional)
- [ ] API tested in production
- [ ] Monitoring set up

### Mobile Deployment
- [ ] EAS configured
- [ ] Bundle identifiers set
- [ ] Production API URL configured
- [ ] iOS build successful
- [ ] Android build successful
- [ ] App Store listings created
- [ ] Screenshots uploaded
- [ ] Submitted for review

### Post-Deployment
- [ ] All features work in production
- [ ] Analytics tracking works
- [ ] Error monitoring active
- [ ] Documentation updated
- [ ] Team notified of launch

Good luck with your deployment! 🚀

