# POPWallet Deployment Guide

## Deploying to Vercel

This project uses a Solana wallet integration (Phantom or compatible). Follow these steps to deploy successfully.

### Prerequisites

1. A Vercel account
2. (No external XAMAN credentials required)
3. Your repository connected to Vercel

### Step 1: Set Up Environment Variables in Vercel

You need to configure the following environment variables in your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Description | Required | Example |
|--------------|-------------|----------|---------|
| (none) | No XAMAN credentials required |  |
| `ENC_KEY` | Encryption key for JWT tokens | **Yes** | `your-secret-encryption-key-min-32-chars` |

**Important Notes:**
- Make sure to add these variables for **Production**, **Preview**, and **Development** environments
- The `ENC_KEY` should be a strong, random string (at least 32 characters)
- Never commit these values to your repository

### Step 2: Wallets and Devnet

This app uses Solana wallets (e.g., Phantom). For testing, use the Solana Devnet network.

1. Install Phantom (or a compatible wallet) in your browser or mobile device
2. Switch the wallet network to **Devnet** for testing

### Step 3: Deploy

Once environment variables are configured:

1. Push your code to your repository (GitHub, GitLab, or Bitbucket)
2. Vercel will automatically deploy your application
3. The deployment will include:
   - Frontend build (static files)
   - Serverless API functions for XAMAN integration

### Step 4: Verify Deployment

After deployment:

1. Visit your deployed URL
2. You should see a **yellow testnet banner** at the top of the page
3. Try connecting your XAMAN wallet
4. Verify that the connection works and uses the **Testnet** network

## Devnet Configuration

This application is configured to use the Solana Devnet for testing. All demo transactions should run on Devnet.

- The Devnet banner is shown in the UI
- Use Phantom and switch to Devnet for testing

If you want to switch to Mainnet (NOT recommended without proper testing):
1. Update the UI and any backend calls to use a Mainnet RPC endpoint
2. Remove or update the `TestnetBanner` component

## Troubleshooting

### "Failed to connect XAMAN wallet: Unexpected token 'T'"

This error occurs when:
- Environment variables are not set in Vercel
- The API functions are not deployed correctly

**Solution:**
1. Verify environment variables are set in Vercel
2. Redeploy the application
3. Check Vercel function logs for errors

### XAMAN Opens But Doesn't Connect

**Solution:**
1. Verify your XAMAN app credentials are correct
2. Check that you're using the testnet in XAMAN app
3. Make sure your device has internet connectivity

### Missing Testnet Banner

If the testnet banner doesn't appear:
1. Clear your browser cache
2. Check that `TestnetBanner` is imported in `App.jsx`
3. Verify the build completed successfully

## Local Development

For local development, the setup is different:

1. Copy `.env.example` to `.env`
2. Add your XAMAN credentials to `.env`
3. Run both the server and frontend:
   ```bash
   npm run dev:all
   ```

In development:
- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3001`
- Vite proxies `/api` requests to the backend

## Architecture

**Production (Vercel):**
```
Frontend (Static) → /api/* → Vercel Serverless Functions
```

**Development:**
```
Frontend (Vite) → /api/* → Proxy → Express Server (localhost:3001)
```

## Files Structure

```
/server/                     # Express server (dev only)
  ├── index.js

/src/
  ├── hooks/useSolana.js     # Solana wallet hook (Phantom)
  └── components/
      ├── TestnetBanner.jsx  # Devnet notification
      └── SolanaPayment.jsx   # Solana payment mission

vercel.json                  # Vercel configuration
```

## Support

For issues with:
- **XAMAN Integration**: Check [XAMAN Docs](https://xumm.readme.io/)
- **Vercel Deployment**: Check [Vercel Docs](https://vercel.com/docs)
- **POPWallet**: Create an issue in your repository
