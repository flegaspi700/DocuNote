# Testing AI Theme Generation with Gemini 2.5 Flash Image

## Quick Test Guide

### Test 1: Theme Generation with Image

1. **Start the dev server:**
   ```powershell
   npm run dev
   ```

2. **Open the app:**
   - Navigate to `http://localhost:9002`
   - Open DevTools Console (F12)

3. **Generate a theme:**
   - Click Settings (⚙️ icon in header)
   - Click "Generate with AI"
   - Enter prompt: `cyberpunk neon city`
   - Click "Generate"

4. **Check the console for these logs:**
   ```
   Gemini API Response: { ... }
   ```
   
   **Expected Success:**
   ```
   ✅ Image generated successfully: image/png 150000 bytes
   ```
   
   **If No Image:**
   ```
   ⚠️ Gemini generated no images, using gradient fallback
   Response structure: { ... }
   ```

### Test 2: Theme Persistence

1. **Generate a theme** (follow Test 1)

2. **Verify theme is applied:**
   - Background should show custom image or gradient
   - UI colors should match the theme

3. **Refresh the page** (F5 or Ctrl+R)

4. **Check console for:**
   ```
   🎨 Restoring saved AI theme: cyberpunk-neon-city
   ```

5. **Verify:**
   - ✅ Theme colors persist
   - ✅ Background image/gradient persists
   - ✅ Theme name shows in localStorage

### Test 3: Multiple Themes

1. **Generate theme 1:** `ocean sunset`
2. **Generate theme 2:** `forest morning mist`
3. **Refresh page**
4. **Verify** last theme (forest) persists

---

## Debugging API Issues

### Check API Key

**In `.env.local`:**
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Check Console Logs

If you see **"Gemini API error"**, check:

```javascript
// Console will show:
Gemini Image API error (403): {
  "error": {
    "code": 403,
    "message": "API key not valid..."
  }
}
```

**Common Errors:**

| Error Code | Message | Solution |
|------------|---------|----------|
| 403 | API key not valid | Check GEMINI_API_KEY in .env.local |
| 400 | Invalid request | Check API request format |
| 429 | Quota exceeded | Wait or upgrade API plan |
| 500 | Internal error | Retry, check Google status |

### Check Response Structure

The console logs the full API response. Look for:

```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "inline_data": {
          "mimeType": "image/png",
          "data": "base64string..."
        }
      }]
    }
  }]
}
```

**If `inline_data` is missing:**
- API might not support image generation for your key
- Model might not be available in your region
- Request format might be incorrect

---

## Testing Different Prompts

### Good Prompts (Should Generate Images)

```
✅ "cyberpunk neon city at night"
✅ "ocean sunset with palm trees"
✅ "mountain peaks covered in snow"
✅ "desert sand dunes at golden hour"
✅ "forest with morning mist and sunlight"
```

### Prompts That Might Use Gradient Fallback

```
⚠️ Very short prompts: "blue"
⚠️ Abstract concepts: "happiness"
⚠️ Text-heavy requests: "poster with lots of text"
```

---

## Verifying Persistence

### Check localStorage

**Open DevTools Console:**
```javascript
// View saved theme
JSON.parse(localStorage.getItem('notechat-ai-theme'))

// Expected output:
{
  id: "ai-ocean-sunset",
  name: "ocean sunset",
  palette: {
    background: "220 20% 95%",
    foreground: "220 10% 20%",
    primary: "220 70% 50%",
    // ... more colors
  },
  backgroundImageUrl: "data:image/png;base64,..."
}
```

### Check DOM Styles

**In DevTools Elements tab:**
```html
<html data-theme="ai-ocean-sunset">
  <head>
    <style id="theme-ai-ocean-sunset">
      html[data-theme='ai-ocean-sunset'] {
        --background: 220 20% 95%;
        --foreground: 220 10% 20%;
        ...
      }
    </style>
  </head>
</html>
```

---

## Expected Behavior

### ✅ Success Scenario

1. User enters prompt
2. Loading spinner shows (~5-10 seconds)
3. Toast notification: "Theme Generated! The new theme..."
4. Background image appears OR gradient if image fails
5. UI colors update immediately
6. Page refresh → theme persists

### ⚠️ Fallback Scenario

1. API call fails or returns no image
2. Gradient background used instead
3. Toast: "...with gradient background"
4. UI still functional
5. Colors still apply
6. Page refresh → gradient persists

---

## Troubleshooting Steps

### Problem: No Images Generated

**Step 1: Check API Response**
```
Console: "⚠️ Gemini generated no images"
```

**Step 2: Check Response Structure**
- Look for `Response structure:` log
- Check if `candidates` array exists
- Check if `content.parts` has `inline_data`

**Step 3: Verify API Format**
```javascript
// Should be:
{
  response_modalities: ['Image'],  // NOT 'IMAGE'
  image_config: {                  // NOT imageConfig
    aspect_ratio: '16:9'           // NOT aspectRatio
  }
}
```

### Problem: Theme Doesn't Persist

**Step 1: Check Console on Reload**
```
Expected: "🎨 Restoring saved AI theme: ..."
Missing? → Check localStorage
```

**Step 2: Verify localStorage**
```javascript
localStorage.getItem('notechat-ai-theme')
// Should return JSON string
```

**Step 3: Check if Palette Saved**
```javascript
const theme = JSON.parse(localStorage.getItem('notechat-ai-theme'));
console.log(theme.palette);  // Should NOT be undefined
```

### Problem: Theme Applies But No Styles

**Step 1: Check DOM**
```javascript
document.querySelector('[id^="theme-ai-"]')
// Should return <style> element
```

**Step 2: Check HTML Attribute**
```javascript
document.documentElement.getAttribute('data-theme')
// Should return "ai-theme-name"
```

---

## API Rate Limits

**Gemini API Free Tier:**
- 15 requests per minute
- 1500 requests per day
- Each theme generation = 2 requests (1 for colors, 1 for image)

**If you hit rate limits:**
- Console shows: `429 Quota exceeded`
- Gradient fallback activates automatically
- Wait 1 minute and try again

---

## Success Criteria

- ✅ Theme generates within 10 seconds
- ✅ Custom background image appears OR gradient fallback
- ✅ UI colors match theme description
- ✅ Theme persists after page refresh
- ✅ Multiple themes can be generated
- ✅ No console errors (warnings OK)
- ✅ Toast notifications show success/failure

---

## Next Steps After Testing

**If Images Generate Successfully:**
1. Test different prompts
2. Test persistence across browser close/reopen
3. Test multiple theme switches
4. Share screenshots! 🎉

**If Images Don't Generate:**
1. Share console logs (full `Response structure:` log)
2. Verify API key is valid and active
3. Check if API supports `gemini-2.5-flash-image` model
4. Try enabling Imagen 4 model as alternative

---

## Quick Debug Commands

```javascript
// In Browser Console:

// 1. Check if theme is saved
JSON.parse(localStorage.getItem('notechat-ai-theme'))

// 2. Check current theme
document.documentElement.getAttribute('data-theme')

// 3. Check if styles exist
document.querySelector('[id^="theme-ai-"]')?.innerHTML

// 4. Manually clear theme
localStorage.removeItem('notechat-ai-theme')

// 5. Check all localStorage keys
Object.keys(localStorage)
```

---

## Contact/Report Issues

If images aren't generating, please share:
1. ✅ Console logs (especially `Response structure:`)
2. ✅ API key status (valid/invalid, don't share actual key)
3. ✅ Region/country (some features may be region-locked)
4. ✅ Browser and OS
5. ✅ Whether gradients work (they should)

**Good luck testing!** 🚀🎨
