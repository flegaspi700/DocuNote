# Issue: Conversation Title Not Updating in UI

**Status:** Open  
**Priority:** High  
**Date Reported:** November 2, 2025  
**Branch:** feat/save-empty-conversations

## Problem Description

When updating a conversation title or loading a conversation from history, the title displays correctly in the sidebar conversation history but does NOT update in the main header until a full page refresh.

## Steps to Reproduce

### Scenario 1: New Conversation Title Update
1. Click "New Conversation" button
2. Click "Edit conversation title" button
3. Change title to "Research 1"
4. Click save (checkmark button)
5. **Expected:** Header shows "Research 1"
6. **Actual:** Header still shows "New Conversation"
7. Title shows correctly in sidebar history
8. Full page refresh (Ctrl+R) shows correct title

### Scenario 2: Load Existing Conversation
1. Have existing conversation titled "Test 5"
2. Click on "Test 5" in conversation history sidebar
3. **Expected:** Header shows "Test 5"
4. **Actual:** Header still shows "New Conversation" (or previous title)
5. Title shows correctly in sidebar history
6. Full page refresh (Ctrl+R) shows correct title

## Current Implementation

### State Management
- `conversationTitle` state is used for the title
- `conversationTitleRef` ref is used to prevent stale closures in auto-save effect
- `useEffect` syncs ref with state: `conversationTitleRef.current = conversationTitle`

### Title Display
```tsx
<ChatHeader 
  conversationTitle={conversationTitle}
  onTitleChange={handleTitleChange}
  isNewConversation={!currentConversationId || messages.length === 0}
/>
```

### What Works
- Title saves correctly to localStorage ✅
- Title displays correctly in conversation history sidebar ✅
- Title displays correctly after full page refresh ✅
- All tests pass (17 passed, 13 skipped) ✅

### What Doesn't Work
- Title does not update in header immediately after change ❌
- Title does not update in header when loading conversation ❌

## Technical Details

### Attempted Fixes
1. **Removed conversationTitle from auto-save dependencies** - Prevented infinite loops but created stale closure issue
2. **Added conversationTitleRef** - Helped with auto-save but didn't fix UI update
3. **Fixed order of state updates** - Set title before conversation ID to prevent race conditions
4. **Auto-sync ref with useEffect** - Simplified code but didn't fix UI update
5. **Save full conversation in handleTitleChange** - Ensured localStorage consistency

### Suspected Root Causes
1. **React State Batching** - Multiple state updates may be batched, causing UI to not reflect latest value
2. **Component Re-render Issue** - ChatHeader component may not be re-rendering when conversationTitle changes
3. **State Update Timing** - Auto-save effect may be running and overwriting title after it's set
4. **Closure Capture** - Some effect or callback may have captured old title value

## Files Involved
- `src/app/page.tsx` - Main page component with title state management
- `src/components/chat-header.tsx` - Header component that displays title
- `src/components/conversation-title.tsx` - Title editing component
- `src/lib/storage.ts` - localStorage functions for saving conversations

## Debugging Suggestions

1. **Add console logs** to track state changes:
   ```typescript
   useEffect(() => {
     console.log('Title state changed:', conversationTitle);
   }, [conversationTitle]);
   ```

2. **Check ChatHeader component** - Ensure it's not memoized incorrectly or has stale props

3. **Verify ConversationTitle component** - Check if it's updating its internal state correctly

4. **Use React DevTools** - Inspect component tree to see if conversationTitle prop is updating

5. **Check for stale closures** - Look for any callbacks or effects that might capture old title

## Possible Solutions to Try

### Solution 1: Force Re-render
```typescript
const [, forceUpdate] = useReducer(x => x + 1, 0);

const handleTitleChange = (newTitle: string) => {
  setConversationTitle(newTitle);
  forceUpdate(); // Force component re-render
  // ... rest of logic
};
```

### Solution 2: Use Callback Ref Pattern
```typescript
const titleRef = useCallback((node) => {
  if (node) {
    node.textContent = conversationTitle;
  }
}, [conversationTitle]);
```

### Solution 3: Direct DOM Manipulation (Not Recommended)
```typescript
useEffect(() => {
  const titleElement = document.querySelector('[data-conversation-title]');
  if (titleElement) {
    titleElement.textContent = conversationTitle;
  }
}, [conversationTitle]);
```

### Solution 4: Check Component Memoization
- Ensure ChatHeader is not wrapped in `React.memo()` without proper dependencies
- Check if ConversationTitle has `useMemo` or `useCallback` issues

### Solution 5: Separate Title State from Auto-Save
- Completely decouple title updates from auto-save logic
- Have title updates go through a different path than message/file updates

## Related Code Commits

1. `d36b0b9` - test: add tests for empty conversation saving (TDD Red)
2. `4452df1` - feat: allow saving and editing empty conversations (TDD Green)
3. `1c518ae` - fix: ensure conversation title updates in header when changed
4. `bfedde7` - fix: remove conversationTitle from auto-save dependencies
5. `1c32e14` - fix: use ref to track conversation title and prevent stale closure
6. `c3bf9d9` - fix: update title ref before setting conversation ID to prevent race condition
7. `4719410` - refactor: auto-sync conversationTitle ref with state using useEffect

## Testing Notes

All unit tests pass, but the visual UI update is not happening. This suggests the issue is related to React's rendering cycle rather than the underlying logic.

## Next Steps

1. Add detailed console logging to track state changes
2. Inspect ChatHeader and ConversationTitle components for rendering issues
3. Check React DevTools to see if props are updating
4. Consider if this is a React 19 or Next.js 15 specific issue
5. Try creating a minimal reproduction case

## Workaround for Users

**Current Workaround:** Refresh the page (F5 or Ctrl+R) after changing title or loading conversation.
