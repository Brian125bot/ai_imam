# Deployment Guide

This guide provides comprehensive instructions for deploying the Ai-Imam application to various hosting platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Deployment Options](#deployment-options)
  - [Netlify](#netlify)
  - [Vercel](#vercel)
  - [GitHub Pages](#github-pages)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
  - [Docker](#docker)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ Completed local development and testing
- ✅ A Google Gemini API key
- ✅ Git repository with latest changes pushed
- ✅ Node.js 18+ installed locally
- ✅ Account on your chosen hosting platform

## Build Configuration

### Production Build

Create an optimized production build:

```bash
npm run build
```

This generates a `dist/` directory with:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    # Bundled JavaScript
│   └── index-[hash].css   # Bundled CSS (if any)
└── ...
```

### Build Verification

Test the production build locally:

```bash
npm run preview
```

This starts a local server at `http://localhost:4173` serving the production build.

### Build Options

Customize the build in `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    outDir: 'dist',              // Output directory
    sourcemap: false,             // Disable sourcemaps for production
    minify: 'esbuild',           // Minification method
    chunkSizeWarningLimit: 500,  // Warning threshold (KB)
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ai': ['@google/genai']
        }
      }
    }
  }
});
```

## Deployment Options

### Netlify

**Recommended for:** Quick deployments with zero configuration

#### Method 1: Deploy via Git (Recommended)

1. **Connect Repository**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Select your Git provider (GitHub)
   - Choose the `ai_imam` repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Add Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add variable:
     ```
     Key: GEMINI_API_KEY
     Value: your_gemini_api_key_here
     ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify automatically builds and deploys
   - Get your URL: `https://[site-name].netlify.app`

#### Method 2: Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Follow prompts to connect site
```

#### Custom Domain (Optional)

1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records as instructed

#### Continuous Deployment

Netlify automatically redeploys on every push to your main branch.

**netlify.toml** (optional configuration):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Vercel

**Recommended for:** Next.js-like deployment experience

#### Method 1: Deploy via Git

1. **Import Project**
   - Go to [Vercel](https://vercel.com/)
   - Click "New Project"
   - Import from GitHub
   - Select `ai_imam` repository

2. **Configure Project**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Add Environment Variables**
   - In project settings
   - Add environment variable:
     ```
     Name: GEMINI_API_KEY
     Value: your_gemini_api_key_here
     ```

4. **Deploy**
   - Click "Deploy"
   - Get your URL: `https://[project-name].vercel.app`

#### Method 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
# For production: vercel --prod
```

#### Configuration File

**vercel.json** (optional):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### GitHub Pages

**Recommended for:** Free hosting with GitHub

#### Setup

1. **Install gh-pages package**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://[username].github.io/ai_imam",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/ai_imam/', // Repository name
     // ... rest of config
   });
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`

#### Environment Variables with GitHub Actions

**Note:** GitHub Pages doesn't support server-side environment variables. You need to use GitHub Actions to inject them at build time.

**.github/workflows/deploy.yml**:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Add Secret:**
- Repository Settings → Secrets and Variables → Actions
- New repository secret: `GEMINI_API_KEY`

---

### AWS S3 + CloudFront

**Recommended for:** Production-grade deployments with CDN

#### Prerequisites

- AWS account
- AWS CLI installed and configured

#### Step 1: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://ai-imam-app --region us-east-1

# Enable static website hosting
aws s3 website s3://ai-imam-app \
  --index-document index.html \
  --error-document index.html
```

#### Step 2: Build and Upload

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://ai-imam-app --delete

# Set proper permissions
aws s3api put-bucket-policy --bucket ai-imam-app --policy file://bucket-policy.json
```

**bucket-policy.json**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ai-imam-app/*"
    }
  ]
}
```

#### Step 3: Create CloudFront Distribution

1. Go to CloudFront console
2. Create Distribution
3. Origin Domain: `ai-imam-app.s3.amazonaws.com`
4. Origin Path: leave empty
5. Viewer Protocol Policy: Redirect HTTP to HTTPS
6. Default Root Object: `index.html`
7. Create Distribution

#### Step 4: Configure Error Pages

In CloudFront distribution settings:
- Error Pages → Create Custom Error Response
- HTTP Error Code: 404
- Response Page Path: `/index.html`
- HTTP Response Code: 200

#### Deployment Script

**deploy-aws.sh**:

```bash
#!/bin/bash

# Build
echo "Building application..."
npm run build

# Upload to S3
echo "Uploading to S3..."
aws s3 sync dist/ s3://ai-imam-app --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

Make executable:
```bash
chmod +x deploy-aws.sh
```

#### Environment Variables

For AWS deployments, inject environment variables at build time using GitHub Actions or AWS CodeBuild.

---

### Docker

**Recommended for:** Containerized deployments

#### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API key
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Build and Run

```bash
# Build image
docker build --build-arg GEMINI_API_KEY=your_key -t ai-imam:latest .

# Run container
docker run -p 8080:80 ai-imam:latest

# Access at http://localhost:8080
```

#### Docker Compose

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  ai-imam:
    build:
      context: .
      args:
        GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "8080:80"
    restart: unless-stopped
```

**.env** (for Docker Compose):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Run with Docker Compose:

```bash
docker-compose up -d
```

---

## Environment Variables

### Development

**.env.local**:
```env
GEMINI_API_KEY=your_development_api_key
```

### Production

Different platforms handle environment variables differently:

| Platform | Method |
|----------|--------|
| Netlify | Dashboard → Site Settings → Environment Variables |
| Vercel | Dashboard → Project Settings → Environment Variables |
| GitHub Pages | Repository Settings → Secrets → Actions Secrets |
| AWS | AWS Secrets Manager or build-time injection |
| Docker | Build arguments or environment files |

### Security Best Practices

1. ✅ Never commit API keys to Git
2. ✅ Use different keys for development and production
3. ✅ Rotate keys regularly
4. ✅ Set up usage alerts in Google Cloud Console
5. ✅ Consider using a backend proxy in production

## Post-Deployment

### Verification Checklist

- [ ] Site loads correctly
- [ ] Can submit questions
- [ ] Fatwas are generated successfully
- [ ] Both English and Arabic text display properly
- [ ] Text-to-speech works
- [ ] Copy to clipboard works
- [ ] Mobile responsive design works
- [ ] No console errors
- [ ] HTTPS is enabled
- [ ] Custom domain configured (if applicable)

### Testing

```bash
# Test production URL
curl https://your-site.netlify.app

# Check API functionality
# Open browser console and test a question
```

### Monitoring

Set up monitoring for:

1. **Uptime**: Use services like UptimeRobot or Pingdom
2. **Performance**: Use Lighthouse or WebPageTest
3. **Errors**: Use Sentry or LogRocket
4. **Analytics**: Use Google Analytics or Plausible

### Performance Optimization

1. **Enable Compression**: Most platforms enable gzip/brotli by default
2. **Set Cache Headers**: Configure in your hosting platform
3. **Use CDN**: CloudFront, Cloudflare, or platform CDN
4. **Optimize Images**: Though this app has minimal images
5. **Monitor Bundle Size**: Keep JavaScript bundle under 300KB

## Troubleshooting

### Build Fails

**Problem**: Build command fails

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

**Problem**: API key not loaded

**Solution**:
1. Verify variable name matches: `GEMINI_API_KEY`
2. Check `vite.config.ts` mapping
3. Rebuild after adding variables
4. Check platform-specific syntax

### 404 Errors on Refresh

**Problem**: Routes return 404 on page refresh

**Solution**: Configure redirects/rewrites:
- **Netlify**: Add `_redirects` or `netlify.toml`
- **Vercel**: Add rewrites in `vercel.json`
- **Nginx**: Use `try_files` directive

### CORS Errors

**Problem**: API calls blocked by CORS

**Solution**: This shouldn't happen with Gemini API, but if it does:
1. Use a backend proxy
2. Configure proper CORS headers
3. Check API key permissions

### Slow Performance

**Problem**: App loads slowly

**Solution**:
1. Enable CDN
2. Check bundle size: `npm run build -- --mode analyze`
3. Optimize dependencies
4. Enable compression
5. Use lazy loading for components

---

## Rollback Procedures

### Netlify/Vercel

1. Go to Deployments
2. Select previous working deployment
3. Click "Publish deploy"

### GitHub Pages

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or deploy specific commit
git checkout <commit-hash>
npm run deploy
```

### AWS S3

```bash
# Re-upload previous version
aws s3 sync previous-dist/ s3://ai-imam-app --delete
```

---

## Continuous Deployment

Most platforms support automatic deployments on Git push. Configure branch-based deployments:

- **Production**: Deploy from `main` branch
- **Staging**: Deploy from `develop` branch
- **Preview**: Deploy from pull requests

---

This deployment guide covers the most common scenarios. Choose the platform that best fits your needs and expertise level.
