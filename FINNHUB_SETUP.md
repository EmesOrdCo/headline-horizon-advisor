# Setting up Finnhub API Key

## The Problem
The Finnhub metrics are showing "TBC" because the API key is invalid. You're getting a 401 "Invalid API key" error.

## Solution

### Step 1: Get a Free Finnhub API Key
1. Go to https://finnhub.io/register
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 60 API calls per minute

### Step 2: Set up the API Key in Supabase
Since you're connected to Supabase, use the secrets feature:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API Keys & Secrets
3. Add a new secret with key: `FINNHUB_API_KEY`
4. Add your API key as the value

### Step 3: Update the Code
I'll create a Supabase Edge Function to handle Finnhub calls securely, or you can:

**Option A: Use direct API calls (current approach)**
- Replace the hardcoded API key in `src/services/finnhubService.ts`
- Note: This exposes the key in the frontend

**Option B: Use Supabase Edge Function (recommended)**
- Create an edge function that calls Finnhub with the secret key
- Frontend calls the edge function instead of Finnhub directly

## Current Status
- ✅ Found the issue: Invalid API key (401 error)
- ✅ Added comprehensive debugging
- ❌ Need valid API key to get real data
- ❌ FH metrics still show "TBC" until key is valid

## Next Steps
1. Get your free Finnhub API key
2. Choose Option A (quick) or Option B (secure)
3. Update the code with your key
4. Test to see real financial metrics