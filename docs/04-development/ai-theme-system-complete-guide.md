# AI Theme System - Complete Guide

**Last Updated:** November 4, 2025  
**Status:** ✅ Production-Ready

This comprehensive guide covers the AI Theme Generation system in DocuNote, including color palette generation, background images, and the evolution from Imagen to Gemini.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture & Components](#architecture--components)
4. [Background Images Setup](#background-images-setup)
5. [Technical Implementation](#technical-implementation)
6. [Migration History (Imagen → Gemini)](#migration-history)
7. [Testing & Validation](#testing--validation)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Overview

### What It Does

The AI Theme Generator allows users to create custom visual themes using natural language prompts. The system:

✅ **Generates color palettes** via Google Gemini AI  
✅ **Fetches matching background images** from Unsplash (optional)  
✅ **Applies themes instantly** with dynamic CSS injection  
✅ **Persists themes** across sessions using localStorage  
✅ **Integrates seamlessly** with next-themes for theme management

### Example Usage

**User Prompt:** *"a serene ocean at sunset with warm colors"*

**System Generates:**
- **Colors:** Warm oranges, pinks, blues in HSL format
- **Background Image:** Beautiful ocean sunset from Unsplash
- **Theme Name:** "Serene Ocean"
- **Saved & Applied:** Immediately available in theme dropdown

---

## Quick Start

### 1. Prerequisites

**Required:**
- Google Gemini API key (for color generation)

**Optional (for background images):**
- Unsplash API key (free tier: 50 requests/hour)

### 2. Environment Setup

Create/update `.env.local`:

```bash
# Required: Gemini API for theme generation
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Unsplash API for background images
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key_here
```

**Getting API Keys:**
- **Gemini:** [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **Unsplash:** [https://unsplash.com/developers](https://unsplash.com/developers)

### 3. Usage

1. Click **Settings** (gear icon) in chat header
2. Select **"Generate with AI"** from theme dropdown
3. Enter a descriptive prompt
4. Click **Generate**
5. Theme applies automatically!

### Example Prompts

```
✅ "a futuristic cyberpunk city with neon lights"
✅ "a calm zen garden with bamboo and rocks"
✅ "a dark forest at night with moonlight"
✅ "a vibrant tropical beach with turquoise water"
✅ "a cozy autumn forest with golden leaves"
```

---

## Architecture & Components

### System Flow

```
User Input (Dialog)
    ↓
generateAITheme (Server Action)
    ↓
generateTheme (Genkit AI Flow)
    ↓
fetchUnsplashImage (Optional)
    ↓
Dynamic CSS Injection
    ↓
next-themes Integration
    ↓
Theme Applied & Saved
```

### File Structure

```
src/
├── components/
│   ├── ai-theme-generator.tsx      # Main UI component
│   └── settings-menu.tsx            # Integration point
├── app/
│   └── actions.ts                   # Server actions wrapper
├── ai/flows/
│   └── generate-theme.ts            # Genkit AI flow
└── lib/
    ├── types.ts                     # AITheme type definition
    ├── storage.ts                   # LocalStorage utilities
    └── unsplash.ts                  # Unsplash API integration
```

### Component Breakdown

#### 1. **ai-theme-generator.tsx** (UI Component)
- **Coverage:** 50.3%
- **Purpose:** User interface for theme generation
- **Features:**
  - Dialog with prompt input
  - Loading states with spinner
  - Toast notifications
  - Dynamic CSS injection
  - Theme persistence

#### 2. **generate-theme.ts** (Genkit Flow)
- **Coverage:** 92.42%
- **Purpose:** AI-powered color palette generation
- **Features:**
  - Structured prompt engineering
  - Zod schema validation
  - HSL color output
  - Image hint generation

#### 3. **unsplash.ts** (Image Fetching)
- **Purpose:** Background image integration
- **Features:**
  - Random landscape images
  - 1-hour caching
  - Graceful error handling
  - Gradient fallback

---

## Background Images Setup

### Unsplash Integration

#### Getting Started

1. **Sign up:** [Unsplash Developers](https://unsplash.com/developers)
2. **Create app:** "Your apps" → "New Application"
3. **Get Access Key:** Copy from app dashboard
4. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_key_here
   ```
5. **Restart server:** `npm run dev`

#### How It Works

**With Unsplash API:**
```typescript
// 1. AI generates image hint from prompt
imageHint: "ocean sunset"

// 2. Fetch random image
const imageUrl = await fetchUnsplashImage("ocean sunset");

// 3. Apply to theme
backgroundImageUrl: "https://images.unsplash.com/photo-xyz"
```

**Without Unsplash API:**
```typescript
// Fallback to gradient using theme colors
background-image: linear-gradient(135deg, primary, accent);
```

#### CSS Implementation

```css
/* Background image with overlay */
html[data-theme='ai-ocean'] body {
  background-image: url(unsplash-url);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;  /* Parallax effect */
  background-repeat: no-repeat;
}

/* Semi-transparent overlay for readability */
html[data-theme='ai-ocean'] body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: hsl(var(--background) / 0.85);
  z-index: -1;
}
```

#### Rate Limits

**Free Tier:**
- 50 requests per hour
- 5,000 requests per month
- Sufficient for personal use

**Caching:**
- Images cached for 1 hour
- Reduces API calls significantly
- Same query returns same image

---

## Technical Implementation

### Color Palette Generation

#### Prompt Structure

```typescript
const prompt = `Generate a color palette for a theme based on: "${userPrompt}"

Return ONLY a JSON object with this exact structure:
{
  "themeName": "short descriptive name",
  "palette": {
    "background": "220 20% 95%",
    "foreground": "220 20% 10%",
    "primary": "220 70% 50%",
    "primaryForeground": "0 0% 100%",
    // ... 8 more color properties
  },
  "imageHint": "concise 2-3 word hint for background image"
}`;
```

#### Color Format

**HSL Space-Separated:** `"220 70% 50%"`
- Hue: 0-360
- Saturation: 0-100%
- Lightness: 0-100%

**Usage in CSS:**
```css
--primary: 220 70% 50%;
color: hsl(var(--primary));
background: hsl(var(--primary) / 0.5); /* with opacity */
```

### Dynamic CSS Injection

```typescript
// Create style element
const style = document.createElement('style');
style.id = `theme-${themeId}`;

// CSS template
const css = `
  [data-theme="${themeId}"] {
    --background: ${palette.background};
    --foreground: ${palette.foreground};
    --primary: ${palette.primary};
    /* ... all color properties */
  }
  
  html[data-theme="${themeId}"] body {
    background-image: url(${backgroundImageUrl});
    /* ... background styles */
  }
`;

style.textContent = css;
document.head.appendChild(style);
```

### Theme Persistence

```typescript
// Save to localStorage
const aiThemes = [
  {
    id: "ai-serene-ocean",
    name: "Serene Ocean",
    imageHint: "ocean sunset",
    backgroundImageUrl: "https://...",
    palette: { /* colors */ }
  }
];
localStorage.setItem('ai-themes', JSON.stringify(aiThemes));

// Load on app start
const savedThemes = JSON.parse(
  localStorage.getItem('ai-themes') || '[]'
);
```

---

## Migration History

### From Imagen to Gemini (October 2025)

#### Why We Migrated

**Imagen Issues:**
- ❌ API instability and frequent errors
- ❌ Limited availability (restricted access)
- ❌ Slower image generation (10-15 seconds)
- ❌ Higher cost per request
- ❌ Complex authentication flow

**Gemini Benefits:**
- ✅ Stable and reliable
- ✅ Widely available
- ✅ Faster image generation (2-3 seconds)
- ✅ Lower cost
- ✅ Same API key as chat (Gemini)
- ✅ Better image quality for themes

#### Migration Timeline

**Phase 1:** Initial Imagen Implementation
- Implemented Imagen API integration
- Created background image system
- Encountered stability issues

**Phase 2:** Issues & Troubleshooting
- Multiple API timeout errors
- Authentication failures
- Rate limiting problems
- Documented in `imagen-issue-resolution.md`

**Phase 3:** Decision to Migrate
- Evaluated alternatives (DALL-E, Midjourney, Stable Diffusion)
- Selected Gemini 2.5 Flash Image
- Same API ecosystem as chat

**Phase 4:** Gemini Implementation
- Switched to Gemini Image API
- Updated API calls and error handling
- Maintained same user experience
- **Result:** ✅ More reliable and faster

**Phase 5:** Unsplash Alternative
- Added Unsplash as primary image source
- Uses Gemini only for color generation
- Simpler, faster, more reliable
- **Current approach** (as of Nov 2025)

#### Detailed Documentation

See archived files for complete migration details:
- `docs/archive/ai-theme-components/imagen-migration.md`
- `docs/archive/ai-theme-components/imagen-issue-resolution.md`
- `docs/archive/ai-theme-components/gemini-image-implementation.md`

---

## Testing & Validation

### Test Coverage

**Current Coverage:**
- `generate-theme.ts`: **92.42%** ✅
- `ai-theme-generator.tsx`: **50.3%** ⚠️
- `settings-menu.tsx`: **86.41%** ✅

### Manual Testing Checklist

#### Without Unsplash API

```bash
# Remove Unsplash key from .env.local
npm run dev
```

**Verify:**
- ✅ Theme generator opens
- ✅ Color palette generates correctly
- ✅ Gradient fallback appears
- ✅ Console warning about missing API key
- ✅ No errors or broken functionality

#### With Unsplash API

```bash
# Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to .env.local
npm run dev
```

**Test Cases:**

| Prompt | Expected Image | Pass/Fail |
|--------|---------------|-----------|
| "peaceful forest" | Green forest | ✅ |
| "cyberpunk neon city" | Futuristic cityscape | ✅ |
| "zen garden" | Japanese garden | ✅ |
| "tropical beach" | Beach with palms | ✅ |
| "aurora borealis" | Northern lights | ✅ |

**Verify:**
- ✅ Background image loads (check Network tab)
- ✅ Image matches theme aesthetic
- ✅ Text remains readable with overlay
- ✅ Background stays fixed on scroll
- ✅ Toast confirms theme applied
- ✅ Theme persists on reload

#### Error Scenarios

**Invalid Prompts:**
```
❌ "" (empty)
❌ "asdf" (nonsense)
❌ "🎨🎨🎨" (only emojis)
```

**Expected:** Error toast with helpful message

**Network Failures:**
- Disconnect internet → Test offline behavior
- Block Unsplash domain → Test fallback
- Invalid API key → Test error handling

---

## Troubleshooting

### Common Issues

#### Issue: No background image appears

**Symptoms:**
- Colors work but no image
- Gradient fallback shows instead

**Causes & Solutions:**

1. **Missing API key**
   ```bash
   # Check .env.local
   cat .env.local | grep UNSPLASH
   ```

2. **Server not restarted**
   ```bash
   # Restart dev server
   npm run dev
   ```

3. **Rate limit exceeded**
   - Wait 1 hour
   - Check console for "429" error
   - Use gradient fallback temporarily

4. **Network error**
   - Check browser console
   - Look for "Unsplash API error" messages
   - Verify internet connection

#### Issue: Wrong or irrelevant image

**Cause:** Unsplash random API variance

**Solutions:**
1. **Regenerate:** Try again for different image
2. **Refine prompt:** Be more specific
   - ❌ "ocean" → ✅ "calm ocean waves sunset"
3. **Use gradient:** Remove API key for solid fallback

#### Issue: Colors look wrong

**Symptoms:**
- Poor contrast
- Unreadable text
- Colors don't match prompt

**Solutions:**

1. **Regenerate theme** with refined prompt
2. **Check console** for AI errors
3. **Validate HSL format:**
   ```typescript
   // All colors should match: "220 70% 50%"
   const hslRegex = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;
   ```

#### Issue: Theme doesn't persist

**Symptoms:**
- Theme resets on page reload
- Theme missing from dropdown

**Solutions:**

1. **Check localStorage:**
   ```javascript
   // In browser console
   localStorage.getItem('ai-themes')
   ```

2. **Clear and regenerate:**
   ```javascript
   localStorage.removeItem('ai-themes');
   // Regenerate theme
   ```

---

## Best Practices

### For Users

#### Writing Effective Prompts

**Good Prompts:**
```
✅ "a minimalist workspace with clean white and gray tones"
✅ "a vibrant sunset over mountains with purple and orange"
✅ "a dark mysterious forest at twilight"
✅ "a professional corporate theme with blue and silver"
```

**Poor Prompts:**
```
❌ "nice" (too vague)
❌ "red" (only color, no context)
❌ "make it look good" (no specifics)
```

**Tips:**
- Be specific about mood/atmosphere
- Mention 2-3 colors you want
- Include a scene or setting
- Keep it under 20 words

#### Theme Management

- **Limit to 5-10 themes** to avoid clutter
- **Name themes descriptively** for easy identification
- **Delete unused themes** to free up localStorage
- **Screenshot favorites** before deleting

### For Developers

#### Adding New Color Properties

```typescript
// 1. Update src/lib/types.ts
export type ColorPalette = {
  background: string;
  foreground: string;
  // ... existing
  newColor: string;  // ADD NEW
};

// 2. Update generate-theme.ts prompt
Return a JSON object:
{
  "palette": {
    "newColor": "value"
  }
}

// 3. Update CSS injection
[data-theme="${themeId}"] {
  --new-color: ${palette.newColor};
}
```

#### Improving AI Prompts

**Current Prompt:** Basic structure

**Enhanced Version:**
```typescript
const enhancedPrompt = `
You are an expert UI/UX designer. Generate a color palette for: "${userPrompt}"

Requirements:
- Use HSL color space only
- Ensure WCAG AA contrast (4.5:1 minimum)
- Primary color should be ${vibrant|muted|neutral}
- Background must be ${light|dark}

Format: "220 70% 50%" (H S% L%)
`;
```

#### Performance Optimization

**Current:** Synchronous CSS injection

**Optimized:**
```typescript
// Batch DOM updates
requestAnimationFrame(() => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
});

// Debounce rapid theme changes
const debouncedThemeChange = debounce(setTheme, 300);
```

---

## Related Documentation

### Archived Components

All detailed technical documentation has been preserved in:
`docs/archive/ai-theme-components/`

**Files:**
1. `ai-theme-implementation-summary.md` - Implementation details
2. `ai-theme-generator-analysis.md` - Architecture analysis
3. `ai-theme-background-images.md` - Unsplash integration guide
4. `gemini-image-implementation.md` - Gemini Image API details
5. `imagen-issue-resolution.md` - Troubleshooting history
6. `imagen-migration.md` - Migration documentation

### Current Documentation

- **Main README:** [../../README.md](../../README.md)
- **Development Guide:** [README.md](./README.md)
- **Testing Guide:** [../02-testing/README.md](../02-testing/README.md)

---

**For questions or issues, see:** [Development Issue Log](./dev-issue-log.md)
