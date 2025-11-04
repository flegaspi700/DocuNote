# AI Theme Generator with Background Images - Setup Guide

## Overview

The AI Theme Generator now supports automatic background image fetching from Unsplash! When you generate a theme, the system will:

1. **Generate a color palette** using Gemini AI based on your prompt
2. **Fetch a matching background image** from Unsplash using the generated image hint
3. **Apply both the colors and image** to create a fully immersive theme

## Setup Instructions

### 1. Get Unsplash API Access (Free)

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create an account or log in
3. Click "Your apps" → "New Application"
4. Accept the terms and conditions
5. Fill in the application details:
   - **Application name**: DocuNote AI Themes
   - **Description**: Background images for AI-generated themes
6. Click "Create application"
7. Copy your **Access Key**

### 2. Add to Environment Variables

Add your Unsplash Access Key to `.env.local`:

```bash
# Unsplash API - Get your free API key at https://unsplash.com/developers
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_actual_access_key_here
```

**Note**: The variable must start with `NEXT_PUBLIC_` to be accessible in the browser.

### 3. Restart Development Server

```bash
npm run dev
```

## How It Works

### User Flow

1. **Open Settings** → Click the Settings (gear) icon in the chat header
2. **Generate with AI** → Click "Generate with AI" in the theme dropdown
3. **Enter a Prompt** → Describe your desired theme (e.g., "a serene mountain landscape at sunrise")
4. **Generate** → Click the Generate button
5. **Wait** → The system will:
   - Generate a color palette (2-3 seconds)
   - Fetch a matching background image from Unsplash (1-2 seconds)
6. **Enjoy!** → Your custom theme with background image is applied

### Example Prompts

- "a futuristic cyberpunk city with neon lights"
- "a calm ocean at sunset with pink and orange skies"
- "a dark forest with mysterious fog"
- "a vibrant tropical beach with turquoise water"
- "a cozy autumn forest with golden leaves"
- "a minimalist zen garden with bamboo"

### Technical Details

#### Background Image Application

The background image is applied with:
- **Fixed attachment** → Image stays in place while scrolling
- **Cover sizing** → Image fills the entire viewport
- **Semi-transparent overlay** → 85% opacity background color overlay for readability
- **Centered positioning** → Image is centered and crops appropriately

#### CSS Structure

```css
html[data-theme='ai-ocean-sunset'] body {
  background-image: url(https://images.unsplash.com/photo-xyz);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

html[data-theme='ai-ocean-sunset'] body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsl(220 20% 95% / 0.85);
  z-index: -1;
}
```

#### Fallback Behavior

If Unsplash API is not configured or unavailable:
- ✅ Theme colors still work
- ✅ Gradient background is used instead
- ✅ Gradient uses primary and accent colors from the generated palette
- ✅ No errors or broken functionality

Example fallback gradient:
```css
background-image: linear-gradient(135deg, hsl(220 70% 50%) 0%, hsl(190 80% 40%) 100%);
```

## API Limits

### Unsplash Free Tier
- **50 requests per hour**
- **5,000 requests per month**
- **Sufficient for personal use**

### Rate Limit Handling
- Images are cached by Next.js for 1 hour (`next: { revalidate: 3600 }`)
- Same search query returns same image within 1 hour
- Reduces API calls significantly

### Upgrading

Need more requests? Upgrade to Unsplash Plus:
- **Production apps**: Apply for Production API access (free, 5,000 requests per hour)
- Visit: [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)

## File Structure

```
src/
├── lib/
│   ├── unsplash.ts              # Unsplash API integration
│   └── types.ts                 # Updated AITheme type with backgroundImageUrl
├── components/
│   └── ai-theme-generator.tsx   # Enhanced with image fetching
└── ai/flows/
    └── generate-theme.ts        # AI prompt for generating imageHint
```

## Troubleshooting

### Issue: No background image appears

**Possible causes:**
1. **Missing API key** → Check `.env.local` has `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`
2. **Server not restarted** → Restart dev server after adding env variable
3. **Rate limit exceeded** → Wait 1 hour or check console for errors
4. **Network error** → Check console for fetch errors

**Solution:**
```bash
# 1. Check .env.local exists and has the key
cat .env.local

# 2. Restart dev server
npm run dev

# 3. Check browser console for errors
# Open DevTools → Console → Look for "Unsplash API error" messages
```

### Issue: Wrong image for theme

**Cause:** Unsplash random API returns different images each time

**Solutions:**
1. **Generate again** → Click Generate with AI again to get a different image
2. **Adjust prompt** → Be more specific (e.g., "ocean waves" vs "ocean")
3. **Use gradient** → Remove Unsplash key to use gradient fallbacks

### Issue: Images load slowly

**Cause:** Large image files from Unsplash

**Solutions:**
- Images are cached after first load
- Unsplash automatically optimizes for screen size
- Consider upgrading internet connection

## Privacy & Attribution

### Unsplash Requirements

Per Unsplash API Guidelines, you must:
- ✅ **Trigger download endpoint** when image is used (implemented)
- ✅ **Cache images** (implemented with Next.js caching)
- ✅ **Attribute photographers** (optional for app usage, required for public display)

### User Privacy

- ✅ **No user data sent** to Unsplash
- ✅ **Search queries only** contain theme descriptions
- ✅ **No tracking** beyond standard HTTP requests
- ✅ **Client-side only** → API key visible in browser (safe for production)

## Advanced Usage

### Custom Image Sources

Want to use a different image provider? Modify `src/lib/unsplash.ts`:

```typescript
export async function fetchCustomImage(query: string): Promise<string | null> {
  // Replace with your preferred API (Pexels, Pixabay, etc.)
  const response = await fetch(`https://api.yourprovider.com/search?q=${query}`);
  const data = await response.json();
  return data.imageUrl;
}
```

### Manual Theme Persistence

Themes are automatically saved to localStorage. To export/import:

```typescript
// Export current theme
const theme = localStorage.getItem('docunote-ai-theme');
console.log(JSON.parse(theme));

// Import theme
const customTheme = {
  id: 'ai-custom',
  name: 'Custom Theme',
  imageHint: 'nature',
  backgroundImageUrl: 'https://example.com/image.jpg'
};
localStorage.setItem('docunote-ai-theme', JSON.stringify(customTheme));
```

---

## Summary

✅ **Free** → Unsplash API is free for development  
✅ **Easy** → 5-minute setup with API key  
✅ **Beautiful** → High-quality images from professional photographers  
✅ **Automatic** → AI generates image hints, Unsplash finds perfect matches  
✅ **Fallback** → Gracefully degrades to gradients without API key  

**Enjoy your personalized, visually stunning themes!** 🎨✨
