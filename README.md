# 📸 Snap & Track — Setup Guide
**100% Free · No credit card needed**

---

## 💰 Cost Breakdown

| Service | Cost |
|---------|------|
| Vercel hosting | Free |
| Gemini AI (receipt scanning) | Free (1,500 scans/day) |
| Google Sheets | Free |
| Google OAuth login | Free |
| **Total** | **₱0** |

---

## What You Need

- A Gmail account (you already have one!)
- A GitHub account → [github.com](https://github.com) (free, just email + password)
- A Vercel account → sign up with GitHub (no OTP, no card)

---

## STEP 1 — Get your free Gemini API Key

1. Go to **[aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
2. Sign in with your Gmail
3. Click **"Create API Key"** → **"Create API key in new project"**
4. Copy the key (starts with `AIza...`) — save it somewhere

---

## STEP 2 — Set up Google OAuth

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
2. Sign in with your Gmail → Click **"Select a project" → "New Project"**
   - Name: `Snap Track` → Click **Create**
3. In the left menu: **APIs & Services → Library**
   - Search **"Google Sheets API"** → Click it → **Enable**
4. Go to **APIs & Services → OAuth consent screen**
   - User Type: **External** → Create
   - App name: `Snap Track`
   - User support email: your Gmail
   - Developer contact email: your Gmail
   - Click **Save and Continue** (skip optional fields)
   - Click **Save and Continue** again (scopes — skip)
   - Click **Save and Continue** again (test users — skip)
   - Click **Back to Dashboard**
5. Go to **APIs & Services → Credentials**
   - Click **"+ Create Credentials" → "OAuth 2.0 Client ID"**
   - Application type: **Web application**
   - Name: `Snap Track Web`
   - Under **Authorized JavaScript origins** → Add:
     - `http://localhost:3000`
   - Under **Authorized redirect URIs** → Add:
     - `http://localhost:3000/api/auth/callback/google`
   - Click **Create**
6. Copy your **Client ID** and **Client Secret** — save them

---

## STEP 3 — Upload to GitHub

1. Go to **[github.com](https://github.com)** → Sign in → Click **"New"** (top left)
2. Repository name: `snap-track` → **Create repository**
3. On the next page, click **"uploading an existing file"**
4. Extract the ZIP you downloaded and drag ALL the files/folders into GitHub
5. Click **"Commit changes"**

---

## STEP 4 — Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** → **"Sign Up" → "Continue with GitHub"**
   *(No OTP, no phone, no card!)*
2. Click **"Add New Project"**
3. Find `snap-track` → Click **"Import"**
4. Before clicking Deploy, click **"Environment Variables"** and add these:

   | Name | Value |
   |------|-------|
   | `GOOGLE_CLIENT_ID` | From Step 2 |
   | `GOOGLE_CLIENT_SECRET` | From Step 2 |
   | `GEMINI_API_KEY` | From Step 1 |
   | `NEXTAUTH_SECRET` | Any random text (e.g. `mysecretkey123abc`) |
   | `NEXTAUTH_URL` | Leave blank for now — add after deploy |

5. Click **"Deploy"** → wait ~2 minutes
6. Copy your live URL (e.g. `https://snap-track-abc123.vercel.app`)

---

## STEP 5 — Update OAuth + NEXTAUTH_URL with your live URL

**In Google Cloud:**
1. Go back to **APIs & Services → Credentials → your OAuth Client**
2. Add to **Authorized JavaScript origins**:
   `https://your-app.vercel.app`
3. Add to **Authorized redirect URIs**:
   `https://your-app.vercel.app/api/auth/callback/google`
4. Click **Save**

**In Vercel:**
1. Go to your project → **Settings → Environment Variables**
2. Find `NEXTAUTH_URL` → Edit → set value to `https://your-app.vercel.app`
3. Go to **Deployments → "..." → Redeploy**

---

## STEP 6 — Prepare your Google Sheet

1. Go to **[sheets.google.com](https://sheets.google.com)** → Create a new spreadsheet
2. Name it: `My Transactions` (or anything)
3. Copy the Sheet ID from the URL bar:
   ```
   https://docs.google.com/spreadsheets/d/  ← COPY THIS PART →  /edit
   ```
4. Keep this tab open — you'll paste it in the app

---

## STEP 7 — Use the App!

1. Open your Vercel URL on your phone
2. Tap **"Continue with Google"** → sign in with your Gmail
3. Tap **"📊 Link Sheet"** → paste your Google Sheet URL → Save
4. Tap the upload area → take a photo of a receipt
5. Watch the row appear in your Google Sheet! ✅

---

## Install on Phone (makes it feel like an app)

**Android:**
1. Open your app URL in Chrome
2. Tap **⋮ menu → "Add to Home screen"**

**iPhone:**
1. Open your app URL in Safari
2. Tap **Share (□↑) → "Add to Home Screen"**

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Sign in" fails | Make sure your Vercel URL is in Google OAuth origins + redirect URIs |
| Sheet not updating | Check you pasted the correct Sheet URL in the app |
| "No transactions found" | Try a clearer, well-lit photo of the receipt |
| App shows error after redeploy | Make sure `NEXTAUTH_URL` is updated in Vercel |
