# ZENTRIX_TECH — Setup & Launch Guide

**ZENTRIX_TECH** is a world-class cinematic streaming platform featuring movies, TV shows, and anime in stunning quality. This guide covers installation, configuration, and deployment.

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running Locally](#running-locally)
6. [Building for Production](#building-for-production)
7. [Deployment](#deployment)
8. [Features](#features)
9. [Troubleshooting](#troubleshooting)

---

## Overview

**ZENTRIX_TECH** is built with:
- **Frontend**: React 19 + Tailwind CSS 4 + Framer Motion
- **Streaming**: MultiEmbed, VidSrc, Zoro, AniWatch, GogoAnime
- **Data**: TMDB API (movies/TV) + AniList GraphQL (anime)
- **Design**: Obsidian Forge — dark cinematic UI with neon accents
- **Features**: Fullscreen, downloads, ad-blocker, PWA, responsive design

---

## System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **npm/pnpm**: v10.0.0 or higher
- **RAM**: 2GB minimum
- **Disk Space**: 500MB for dependencies + build

### Recommended Requirements
- **Node.js**: v22.0.0 or higher
- **RAM**: 4GB+
- **Disk Space**: 2GB+
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Supported Devices
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Tablets (iPad, Android tablets)
- ✅ Mobile (iPhone, Android)
- ✅ Smart TVs (with web browser)
- ✅ Ultrawide monitors (2560px+)
- ✅ Low-end devices (optimized rendering)

---

## Installation

### Step 1: Clone or Extract the Project

```bash
# If you have a ZIP file
unzip zentrix-tech.zip
cd zentrix-tech

# Or if cloning from Git
git clone <repository-url>
cd zentrix-tech
```

### Step 2: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Verify Installation

```bash
# Check TypeScript compilation
pnpm run check

# Or
npm run check
```

---

## Configuration

### Environment Variables

The application uses public APIs and does not require API keys. However, you can customize the following in `client/src/lib/api.ts`:

```typescript
// TMDB API (free, no key required for public endpoints)
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// AniList GraphQL API (free, no authentication required)
const ANILIST_API_URL = 'https://graphql.anilist.co';
```

### Customization

**Logo & Branding** (`client/src/components/Navbar.tsx`):
```typescript
const LOGO_TEXT = "ZENTRIXTECH";
const LOGO_COLOR = "#00D4FF";
```

**Colors** (`client/src/index.css`):
```css
:root {
  --primary: #00D4FF;      /* Cyan accent */
  --secondary: #8B5CF6;    /* Purple accent */
  --accent: #06FFA5;       /* Green accent */
  --background: #050816;   /* Deep space black */
}
```

**Streaming Servers** (`client/src/pages/WatchPage.tsx`):
```typescript
const MOVIE_SERVERS = [
  { name: "MultiEmbed", getUrl: (id) => `...` },
  { name: "VidSrc", getUrl: (id) => `...` },
  // Add more servers
];
```

---

## Running Locally

### Development Mode

```bash
# Start dev server with hot reload
pnpm run dev

# Server will be available at:
# http://localhost:3000
```

### Preview Mode

```bash
# Build and preview production build
pnpm run build
pnpm run preview

# Server will be available at:
# http://localhost:4173
```

### Accessing the Application

1. Open your browser
2. Navigate to `http://localhost:3000` (dev) or `http://localhost:4173` (preview)
3. The homepage will load with trending content

---

## Building for Production

### Create Production Build

```bash
# Build the application
pnpm run build

# Output will be in:
# - dist/public/     (static files)
# - dist/index.js    (server bundle)
```

### Build Optimization

The build process automatically:
- ✅ Minifies JavaScript and CSS
- ✅ Optimizes images
- ✅ Tree-shakes unused code
- ✅ Creates source maps for debugging
- ✅ Generates PWA manifest

---

## Deployment

### Option 1: Manus Hosting (Recommended)

ZENTRIX_TECH is built for Manus and includes built-in hosting:

1. **Create Checkpoint**: Save your project state
2. **Publish**: Click "Publish" in the Management UI
3. **Domain**: Get auto-generated domain (e.g., `zentrix-tech-xxx.manus.space`)
4. **Custom Domain**: Bind your own domain in Settings

### Option 2: Docker Deployment

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t zentrix-tech .
docker run -p 3000:3000 zentrix-tech
```

### Option 3: Traditional Server (Node.js)

```bash
# SSH into your server
ssh user@your-server.com

# Clone and setup
git clone <repository-url>
cd zentrix-tech
pnpm install
pnpm run build

# Run with PM2
npm install -g pm2
pm2 start dist/index.js --name zentrix-tech
pm2 save
pm2 startup
```

### Option 4: Vercel / Netlify

```bash
# For Vercel
vercel deploy

# For Netlify
netlify deploy --prod --dir=dist/public
```

---

## Features

### Core Features
- ✅ **Browse**: Movies, TV shows, anime with filters and search
- ✅ **Watch**: Embedded player with 5+ streaming servers
- ✅ **Streaming Servers**: MultiEmbed, VidSrc, Zoro, AniWatch, GogoAnime
- ✅ **Ad-Blocker**: Built-in ad-blocking on all servers
- ✅ **Fullscreen**: Native fullscreen support
- ✅ **Downloads**: Download with quality/language/subtitle options
- ✅ **Watchlist**: Save favorites and track watch history
- ✅ **Continue Watching**: Resume from where you left off

### Advanced Features
- ✅ **Responsive Design**: Optimized for all devices (mobile, tablet, desktop, TV, ultrawide)
- ✅ **PWA Support**: Install as app, offline support
- ✅ **Dark/Light Theme**: Automatic theme switching
- ✅ **Device Optimization**: Automatic scaling for low-end devices
- ✅ **Keyboard Shortcuts**: Navigate with keyboard
- ✅ **Touch Optimization**: Gesture support on mobile
- ✅ **TV Remote Navigation**: D-pad navigation support

### Metadata Sources
- **Movies & TV**: TMDB (The Movie Database)
- **Anime**: AniList GraphQL API
- **Images**: TMDB CDN + AniList CDN

---

## Troubleshooting

### Issue: Player not loading

**Solution 1**: Try switching servers
- Click the server buttons (MultiEmbed, VidSrc, etc.)
- Some servers may be temporarily unavailable

**Solution 2**: Clear browser cache
```bash
# Hard refresh in browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (macOS)
```

**Solution 3**: Check console for errors
- Open DevTools (F12)
- Check Console tab for error messages
- Check Network tab for failed requests

### Issue: Anime not playing

**Solution**: Anime servers have different embed formats
- Try multiple servers (Zoro, AniWatch, GogoAnime)
- Some anime may not be available on all servers
- Use movie servers as fallback (MultiEmbed, VidSrc)

### Issue: Slow performance

**Solution 1**: Check device type
- The app auto-detects low-end devices
- Reduces animations and frame rate automatically

**Solution 2**: Disable animations
- Browser → Settings → Accessibility
- Enable "Reduce motion"

**Solution 3**: Clear cache
```bash
# Clear browser cache and storage
DevTools → Application → Clear site data
```

### Issue: CORS errors

**Solution**: These are expected for cross-origin requests
- The app uses CORS-enabled APIs
- Ad-blocker may block some requests (by design)
- Check browser console for specific errors

### Issue: Download not working

**Solution**: Downloads are simulated in the UI
- In production, implement backend download service
- See `client/src/components/DownloadModal.tsx` for implementation

---

## API Documentation

### TMDB API (Movies & TV)

```typescript
// Get trending movies
GET https://api.themoviedb.org/3/trending/movie/week

// Get movie details
GET https://api.themoviedb.org/3/movie/{id}

// Get TV details
GET https://api.themoviedb.org/3/tv/{id}

// Get TV season episodes
GET https://api.themoviedb.org/3/tv/{id}/season/{season_number}

// Search
GET https://api.themoviedb.org/3/search/multi?query={query}
```

### AniList GraphQL API (Anime)

```graphql
query {
  Media(id: 1, type: ANIME) {
    id
    title { english, romaji }
    coverImage { large, extraLarge }
    bannerImage
    averageScore
    episodes
    seasonYear
    season
    studios { nodes { name } }
  }
}
```

---

## Performance Metrics

### Target Metrics
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Time to Interactive**: < 4s
- **Cumulative Layout Shift**: < 0.1

### Optimization Techniques
- Code splitting with React.lazy()
- Image optimization with TMDB CDN
- CSS-in-JS with Tailwind (optimized)
- Framer Motion with GPU acceleration
- Responsive images with srcset

---

## Security Considerations

### HTTPS
- Always use HTTPS in production
- Manus hosting includes automatic HTTPS

### Content Security Policy
- The app uses external CDNs for images
- Streaming servers are embedded via iframe
- Ad-blocker prevents malicious scripts

### Privacy
- No user data is stored on servers
- Watchlist stored locally (localStorage)
- Watch history stored locally
- No tracking or analytics

---

## Support & Resources

- **Documentation**: See `README.md` in project root
- **Issues**: Check GitHub issues or project logs
- **Community**: Reach out via project channels
- **Updates**: Check for latest versions regularly

---

## License

ZENTRIX_TECH is provided as-is for personal use. Streaming content is sourced from third-party providers. Ensure compliance with local laws and content licensing.

---

## Version History

- **v1.0.0** (May 2026): Initial release
  - Core streaming functionality
  - Multiple server support
  - Ad-blocker integration
  - Fullscreen & downloads
  - PWA support
  - Responsive design
  - Device optimization

---

**Built with ❤️ for cinephiles and anime fans**

Last updated: May 15, 2026
