# Build Fix Guide - Viem Test Decorators Issue

## Problem

Viem's test decorators are causing build failures in production:
```
Module not found: Can't resolve 'ignore-loader'
./node_modules/viem/_cjs/clients/decorators/test.js
```

## Solutions Applied

### Attempt 1: null-loader ✅ Applied
Added null-loader to handle test files

### Attempt 2: IgnorePlugin ✅ Applied  
Used webpack IgnorePlugin to completely exclude viem test modules

### Attempt 3: NormalModuleReplacementPlugin ✅ Applied
Replace viem test module with empty module

## Current Status

Latest fix pushed to GitHub. Vercel should auto-deploy.

## Monitor Deployment

Check: https://vercel.com/belivits-projects/tradewme-b5o3h1kue-belivits-projects

## If Build Still Fails

### Option 1: Exclude viem test from imports

Create `.npmrc` in project root:
```
ignore-scripts=true
```

### Option 2: Use experimental.serverComponentsExternalPackages

Add to `next.config.ts`:
```typescript
experimental: {
  serverComponentsExternalPackages: ['viem'],
},
```

### Option 3: Downgrade viem

```bash
npm install viem@2.9.0
```

### Option 4: Use pnpm instead of npm

pnpm handles optional dependencies better:
```bash
npm install -g pnpm
pnpm install
```

## Test Locally

```bash
npm run build
```

If it builds locally but fails on Vercel, the issue is environment-specific.

## Vercel-Specific Fix

Add to Vercel environment variables:
```
SKIP_ENV_VALIDATION=true
```

## Last Resort

If all else fails, we can:
1. Remove viem from direct dependencies
2. Use ethers.js instead
3. Or use viem only on client-side

## Current Deployment

Waiting for Vercel auto-deployment with latest fixes...

**Status:** Monitoring...
