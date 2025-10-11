# Google OAuth Setup Guide for Warrior Jews

This guide will help you set up Google Calendar integration with a new Google Cloud project.

## Step 1: Create a New Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top (currently showing "tetrazpe")
3. Click **"NEW PROJECT"**
4. Enter project details:
   - **Project name**: `warrior-jews` (or your preferred name)
   - **Organization**: Leave as default or select your organization
   - Click **"CREATE"**
5. Wait for the project to be created, then select it from the project dropdown

## Step 2: Enable Google Calendar API

1. In your new project, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and then click **"ENABLE"**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (or Internal if you have a Google Workspace)
3. Click **"CREATE"**
4. Fill in the OAuth consent screen:
   - **App name**: `Warrior Jews Booking`
   - **User support email**: Your email
   - **App logo**: (Optional) Upload your logo
   - **Application home page**: `http://localhost:9002` (for development)
   - **Authorized domains**: Leave empty for now (add your production domain later)
   - **Developer contact email**: Your email
5. Click **"SAVE AND CONTINUE"**

### Add Scopes
1. Click **"ADD OR REMOVE SCOPES"**
2. Search for and add: `https://www.googleapis.com/auth/calendar`
3. Click **"UPDATE"** then **"SAVE AND CONTINUE"**

### Add Test Users (Important for Development)
1. Click **"ADD USERS"**
2. Add your email address and any other developers' emails
3. Click **"ADD"** then **"SAVE AND CONTINUE"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **"CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Select **Application type**: `Web application`
4. Configure:
   - **Name**: `Warrior Jews OAuth Client`
   - **Authorized JavaScript origins**:
     - Add: `http://localhost:9002` (for local testing without ngrok)
     - Add: `https://YOUR-NGROK-ID.ngrok-free.app` (get this in next step)
     - (Later add your production URL: `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - Add: `http://localhost:9002/api/google/oauth/callback` (for local testing)
     - Add: `https://YOUR-NGROK-ID.ngrok-free.app/api/google/oauth/callback` (for ngrok)
     - (Later add your production callback: `https://yourdomain.com/api/google/oauth/callback`)
5. Click **"CREATE"**
6. **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these!

**Note**: You'll get the actual ngrok URL in Step 7. Come back here to add it after starting ngrok.

## Step 5: Update Your .env File

1. Open `/home/chezy/eitan/TANI/.env`
2. Update the Google OAuth credentials:

```env
# Google Calendar OAuth - Warrior Jews Project
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:9002/api/google/oauth/callback
```

3. Save the file

## Step 6: Choose Your Setup Method

### Option A: Using Ngrok (RECOMMENDED for Google OAuth) ✨

Ngrok provides a public URL that Google can reach for webhooks and OAuth callbacks.

```bash
# Stop the current server (Ctrl+C if running)
cd /home/chezy/eitan/TANI

# Start with ngrok (automatically sets up everything)
./start-with-ngrok.sh
```

The script will:
- Start ngrok tunnel
- Display your public URL (like `https://abc123.ngrok-free.app`)
- Automatically update your .env with the ngrok URL
- Start the dev server

**IMPORTANT**: Copy the ngrok URL shown and add it to your Google OAuth settings:
1. Go back to Google Cloud Console > Credentials
2. Edit your OAuth client
3. Add the ngrok URLs as shown in the terminal
4. Save

### Option B: Using Localhost (Simple but Limited)

```bash
# Stop the current server (Ctrl+C if running)
cd /home/chezy/eitan/TANI
npm run dev
```

**Limitations**: 
- Google webhooks won't work (no real-time calendar sync)
- Only accessible from your local machine

## Step 7: Test the Integration

1. Open your app at `http://localhost:9002/dashboard`
2. Click **"Connect Google Calendar"**
3. You should see your new app name "Warrior Jews Booking" in the OAuth consent screen
4. Select your Google account
5. Grant calendar permissions
6. You should be redirected back to your app

## For Production Deployment

When you're ready to deploy:

1. **Update OAuth Consent Screen**:
   - Go back to OAuth consent screen
   - Change from "Testing" to "In Production" (requires verification for public apps)
   - Or keep in Testing mode if you only need specific users

2. **Update Authorized Domains**:
   - Add your production domain (e.g., `yourdomain.com`)

3. **Update Redirect URIs**:
   - Add production redirect URI: `https://yourdomain.com/api/google/oauth/callback`

4. **Update .env for Production**:
   ```env
   GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google/oauth/callback
   NEXT_PUBLIC_URL=https://yourdomain.com
   ```

## Troubleshooting

### "Access blocked: Authorization Error"
- Make sure your email is added as a test user in the OAuth consent screen
- Ensure the OAuth consent screen is properly configured

### "Redirect URI mismatch"
- Double-check the redirect URI in Google Cloud Console matches exactly with your .env file
- Make sure there are no trailing slashes

### "Invalid client"
- Verify the Client ID and Client Secret are correct
- Make sure you're using credentials from the correct project

## What This Enables

Once configured, trainers can:
- ✅ Connect their Google Calendar
- ✅ View their availability automatically (blocks out busy times)
- ✅ Sync bookings to their Google Calendar
- ✅ Get real-time updates when events change
- ✅ Manage everything from one place

---

**Note**: Keep your Client Secret secure! Never commit it to public repositories.

