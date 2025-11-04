# 📄 DocuNote

[![CI](https://github.com/flegaspi700/DocuNote/actions/workflows/ci.yml/badge.svg)](https://github.com/flegaspi700/DocuNote/actions)

**Turn documents into conversations**

An intelligent AI-powered chat application built with Next.js 15 and Google Gemini that lets you upload files, scrape websites, and have natural conversations about your content—with automatic summaries and complete conversation history.

## ✨ Features

- **💬 Conversational AI Chat:** Interact with Google Gemini 2.5 Flash to ask questions and get information from your provided sources
- **📚 Chat History:** Save and load multiple conversations with auto-generated titles
- **⭐ Pin Conversations:** Star important conversations to keep them at the top ✨ NEW
- **🔍 Conversation Search:** Search conversations by title or message content with real-time filtering
- **🎯 Advanced Search Filters:** Filter conversations by date range, source type, and more
- **⌨️ Keyboard Shortcuts:** Navigate faster with Ctrl+N, Ctrl+K, Ctrl+E, and more
- **✨ Content Summaries:** AI-generated summaries for uploaded files and URLs with key points
- **📥 Export Conversations:** Download chat history as TXT or PDF files
- **⚡ Streaming Responses:** Real-time AI response streaming with animated progress indicator
- **💾 Auto-Save Everything:** Messages, sources, themes, and conversations automatically persist across sessions
- **🔒 Input Validation:** Comprehensive security with file size limits, URL validation, and SSRF protection
- **🛡️ Error Boundaries:** Graceful error handling with recovery options - prevents app crashes
- **📱 Mobile Responsive:** Optimized for all devices with touch-friendly interactions and auto-close sidebar
- **📄 File Uploads:** Upload and process `.txt`, `.pdf`, `.md`, `.csv`, and `.docx` files (10MB limit) to use as a knowledge base
  - Text files (.txt) - Plain text content
  - PDF documents (.pdf) - Extracted text from PDFs
  - Markdown files (.md) - Preserves formatting
  - CSV files (.csv) - Parsed and formatted with headers
  - Word documents (.docx) - Extracted text content
- **🌐 Website Scraping:** Provide any website URL, and the application will scrape its content to use as a source
- **📊 Source Management:** Clean sidebar interface to easily add, view, and remove your files and URL sources

## 🚀 Recent Updates

### November 4, 2025 - Major Test Coverage Improvements 🎯
- ✅ **Test Coverage: 63.29% → 66.92%** (+3.63%) - Core business logic now has 95%+ coverage
  - **Storage Tests (PR #26):** `lib/storage.ts` 69.14% → 97.14% (+28%)
    - 45 comprehensive tests for localStorage utilities
    - Tests: messages, sources, AI themes, conversations, bulk operations
    - Full coverage of CRUD operations, pin/unpin, sorting logic
  
  - **Validation Tests (PR #27):** `lib/validation.ts` 71.95% → 95.85% (+23.9%)
    - 61 comprehensive tests for security and input validation
    - Tests: URL validation (SSRF, XSS protection), message/content length
    - File name security, HTML sanitization, utility functions
  
  - **Error Logger Tests (PR #27):** `lib/error-logger.ts` 35.95% → 99.25% (+63.3%)
    - 50 comprehensive tests for error tracking and logging
    - Tests: error levels, history management, persistence, formatting
    - Error type detection (network, timeout), user-friendly messages
  
  - **Total Impact:** 156 new tests added (532 → 688 tests)
  - **Methodology:** Test-Driven Development (TDD) with edge case focus
  - All PRs merged with CI validation ✅

### November 4, 2025 - Stable Conversation Sorting & Pin Feature ⭐
- ✅ **Fixed Conversation Sorting** - Conversations no longer rearrange when selected
  - **Root Cause:** `saveConversation()` was updating `updatedAt` timestamp even when just loading from history
  - **Solution:** Added `updateTimestamp` parameter (default: true) - set to false when loading
  - **Impact:** Conversation list stays in consistent order, only changes when content actually changes
  - **Testing:** 8 new TDD tests for sorting stability and pin feature ✅
  
- ✅ **Pin/Star Conversations** - Keep important conversations at the top
  - Click star icon to pin/unpin any conversation
  - Pinned conversations always appear first (sorted by most recent)
  - Unpinned conversations follow (also sorted by most recent)
  - Visual distinction: yellow background for pinned items
  - Pin status persists in localStorage
  - **Branch:** `feat/conversation-sorting-and-pinning`

### November 4, 2025 - Conversation Title UI Fix 🐛
- ✅ **Fixed Critical Bug** - Conversation titles now update immediately in the header
  - **Root Cause:** `ConversationTitle` component was overriding the title prop with hardcoded "New Conversation" when `messages.length === 0`
  - **Solution:** Removed conditional override logic - component now displays actual title prop
  - **Impact:** Instant UI updates when changing conversation titles (no more page refresh needed)
  - **Testing:** TDD methodology with 3 new tests, all 511 tests passing ✅
  - **Branch:** `fix/conversation-title-ui-update`

### November 2, 2025 - Enhanced Conversation Management
- ✅ **Save Empty Conversations** - You can now save and name conversations even without messages or files
  - Create conversations with custom titles before chatting
  - Edit conversation titles anytime (not just after first message)
  - Better organization for planning and research workflows

### October 30, 2025 - Extended File Type Support 📄
- ✅ **Added support for 3 new file types:** CSV, Markdown, and Word documents
  - `.csv` - Parsed with column headers and formatted tables
  - `.md` - Markdown files with preserved formatting
  - `.docx` - Microsoft Word documents with extracted text
- ✅ **Updated welcome message** to reflect all 5 supported file types
- ✅ **Comprehensive testing** with Jest and Playwright for all file formats

## �🚀 Getting Started

### Prerequisites
- **Node.js** 18 or higher
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey)) - Powers both chat and image generation!

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/flegaspi700/DocuNote.git
    cd DocuNote
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    
    Create a `.env.local` file in the root directory:
    ```env
    # Required: Gemini API for chat, theme generation, and image generation
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
    
    **That's it!** Your Gemini API key powers everything: chat responses, theme generation, and Gemini 2.5 Flash Image background images. No additional setup needed!

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

    This will start the Next.js development server on [http://localhost:9002](http://localhost:9002).

5.  **Start building!** 🎉

### Quick Testing

Run the test suite to verify everything works:

```bash
# Unit and integration tests
npm test

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

For detailed testing documentation, see **[TESTING-README.md](./TESTING-README.md)**.

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Getting Started Guide](./docs/01-getting-started/README.md)** - Project overview and setup
- **[Testing Documentation](./docs/02-testing/README.md)** - How to write and run tests
- **[Features Documentation](./docs/03-features/README.md)** - Feature implementation guides
- **[Development Guide](./docs/04-development/README.md)** - Contributing and workflow
- **[Daily Logs](./docs/daily-logs/README.md)** - Development progress tracking

**Start here:** [📖 Documentation Index](./docs/README.md)

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.3.3](https://nextjs.org/)** - React framework with App Router
- **[React 18.3.1](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 3.4.1](https://tailwindcss.com/)** - Utility-first CSS
- **[ShadCN UI](https://ui.shadcn.com/)** - Component library (30+ components)
- **[next-themes 0.3.0](https://github.com/pacocoursey/next-themes)** - Theme management
- **[Lucide React](https://lucide.dev/)** - Icon library

### AI & Backend
- **[Google Genkit 1.20.0](https://firebase.google.com/docs/genkit)** - AI orchestration framework
- **[Google Gemini 2.5 Flash](https://ai.google.dev/)** - Large Language Model
- **[Cheerio 1.0.0](https://cheerio.js.org/)** - Server-side HTML parsing
- **[pdfjs-dist 4.5.136](https://mozilla.github.io/pdf.js/)** - PDF parsing

### Development & Testing
- **[Jest 30.2.0](https://jestjs.io/)** - Unit and integration testing
- **[Playwright 1.50.2](https://playwright.dev/)** - End-to-end testing
- **[React Testing Library 16.3.0](https://testing-library.com/react)** - Component testing
- **[Turbopack](https://nextjs.org/docs/app/api-reference/turbopack)** - Fast development bundler

---

## 🎯 Project Status

### ✅ What's Working (Nov 4, 2025)

- **Chat Interface** - Full conversational AI with context from sources
- **Chat History** - Save, load, and manage multiple conversations with auto-generated titles
- **Pin Conversations** - Star important conversations to keep them at the top ⭐ NEW
- **Conversation Search** - Search by title or message content with debounced filtering
- **Search Filters** - Filter conversations by date range, source type
- **Testing** - 688 tests (675 passing, 13 skipped), 66.92% coverage, CI/CD pipeline ✨ NEW
  - Core business logic: 95%+ coverage (storage, validation, error-logger)
- **Keyboard Shortcuts** - Quick navigation with Ctrl+N, Ctrl+K, Ctrl+E, Ctrl+Shift+T
- **Message Editing** - Edit and regenerate AI responses
- **Conversation Tags** - Organize with custom color-coded tags
- **Content Summaries** - AI-generated summaries for files and URLs
- **Export Conversations** - Download chat history as TXT or PDF
- **Response Streaming** - Real-time token-by-token AI responses
- **Data Persistence** - Auto-save/restore messages, sources, themes, and conversations
- **Input Validation** - Comprehensive security and data validation (SSRF, XSS protection)
- **Error Logging** - Centralized error tracking with persistence and user-friendly messages
- **Error Boundaries** - Graceful error handling and crash prevention
- **Mobile Responsive** - Optimized for all devices (320px - 1920px+)
- **File Upload** - `.txt`, `.pdf`, `.md`, `.csv`, `.docx` file processing (10MB limit) ✨ NEW
- **URL Scraping** - Website content extraction with SSRF protection
- **Source Management** - Add/remove files and URLs with summary generation
- **Theme System** - Dark/light mode + AI-generated themes with optimized fonts
- **CI/CD** - TypeScript, ESLint, Jest, and build checks on every push

### 🚧 Known Limitations

- No user authentication (single-user local app)
- No swipe gestures for sidebar (future enhancement)
- 5MB localStorage limit (can store ~1000 messages)
- Content limits (500K chars per file, 100K chars per message)

See **[Development Issue Log](./docs/04-development/dev-issue-log.md)** for detailed status.

---

## 🔮 Next Steps & Roadmap

### High Priority (Production Ready)
1. ~~**Persist Sources & Themes**~~ ✅ COMPLETED (Oct 13, 2025)
2. ~~**Streaming Responses**~~ ✅ COMPLETED (Oct 13, 2025)
3. ~~**Input Validation**~~ ✅ COMPLETED (Oct 13, 2025)
4. ~~**UI Layout Improvements**~~ ✅ COMPLETED (Oct 13, 2025)
5. ~~**Error Boundaries**~~ ✅ COMPLETED (Oct 13, 2025)
6. ~~**Mobile Responsive Layout**~~ ✅ COMPLETED (Oct 17, 2025)

### Medium Priority (Enhanced UX)
7. ~~**Chat History**~~ ✅ COMPLETED (Oct 17, 2025) - Save and load past conversations
8. ~~**Content Summaries**~~ ✅ COMPLETED (Oct 17, 2025) - AI-generated summaries for uploaded sources
9. ~~**Conversation Search**~~ ✅ COMPLETED (Oct 17, 2025) - Search conversations by title and content
10. ~~**Export Conversations**~~ ✅ COMPLETED (Oct 30, 2025) - Download chat history as TXT/PDF
11. ~~**Keyboard Shortcuts**~~ ✅ COMPLETED (Oct 30, 2025) - Navigate with Ctrl+N, Ctrl+K, Ctrl+E, Ctrl+Shift+T
12. ~~**Advanced Search Filters**~~ ✅ COMPLETED (Oct 30, 2025) - Filter by date, source type, message count
13. ~~**Message Editing**~~ ✅ COMPLETED (Oct 30, 2025) - Edit and regenerate AI responses
14. ~~**Conversation Tags**~~ ✅ COMPLETED (Oct 30, 2025) - Organize with custom tags

### Low Priority (Future Features)
15. **User Authentication** - Multi-user support with accounts
16. **Cloud Storage** - Sync conversations across devices
17. **More AI Models** - Support for Claude, GPT-4, etc.
18. **Voice Input** - Speech-to-text for messages
19. **Collaborative Chats** - Share conversations with others
20. **Multi-Model Support** - Switch between AI models
21. **Collaborative Features** - Share conversations, team workspaces
22. **Voice Integration** - Speech-to-text and text-to-speech

### Polish & Documentation
12. **Screenshots & Media** - Add screenshots to README and documentation
13. **Demo Video/GIF** - Create visual walkthrough of features
14. **Deployment Guide** - Step-by-step deployment instructions (Vercel, Netlify, Azure)
15. **Contributing Guidelines** - Detailed contribution workflow and standards
16. **API Documentation** - Document Genkit flows and server actions
17. **Architecture Diagrams** - Visual representation of app structure

**See detailed roadmap:** [Daily Logs](./docs/daily-logs/2025-10-07-summary.md#next-steps-future-sessions)

---

## 🧪 Testing

This project has comprehensive test coverage:

- **Unit Tests:** Component and utility testing with Jest
- **Integration Tests:** AI flow testing with 92%+ coverage
- **E2E Tests:** Browser automation with Playwright

**Quick Commands:**
```bash
npm test                    # Run Jest tests
npm run test:e2e           # Run Playwright E2E tests
npm run test:coverage      # Generate coverage report
npx playwright show-report # View E2E test report
```

**Current Status:**
- 469 passing Jest tests, 13 skipped
- 20+ E2E tests with Playwright
- 62.21% statement coverage, 78.52% branch coverage, 49.04% function coverage
- CI/CD pipeline with automated checks

For complete testing guide, see **[Testing Documentation](./docs/02-testing/README.md)**.

---

## 📖 Learn More

### Documentation
- **[Full Documentation](./docs/README.md)** - Complete documentation index
- **[Testing Guide](./TESTING-README.md)** - Quick testing reference
- **[Project Blueprint](./docs/01-getting-started/blueprint.md)** - Design vision
- **[Theme Toggle Feature](./docs/03-features/theme-toggle/)** - Feature example

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Genkit Documentation](https://firebase.google.com/docs/genkit)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🤝 Contributing

Contributions are welcome! Please see:

1. **[Development Guide](./docs/04-development/README.md)** - How to contribute
2. **[Git Commit Guide](./docs/04-development/git-commit-guide.md)** - Commit standards
3. **[Testing Guide](./docs/02-testing/README.md)** - How to write tests

**Development Workflow:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

---

## 📊 Project Metrics

| Metric | Value | Last Updated |
|--------|-------|--------------|
| **Lines of Code** | ~7,500+ lines | Nov 2, 2025 |
| **Documentation** | ~25,000+ lines | Nov 2, 2025 |
| **Tests** | 482 tests (469 passing, 13 skipped) | Nov 2, 2025 |
| **Test Coverage** | 62.21% statements, 78.52% branches, 49.04% functions | Nov 2, 2025 |
| **Components** | 32+ reusable UI components | Nov 2, 2025 |
| **AI Flows** | 6 Genkit flows | Nov 2, 2025 |
| **Custom Hooks** | 7 hooks | Nov 2, 2025 |

---

## 📝 License

This project is open source. See the LICENSE file for details.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) by Vercel
- [Google Genkit](https://firebase.google.com/docs/genkit) by Google
- [ShadCN UI](https://ui.shadcn.com/) by shadcn
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs

---

## 🆕 Recent Updates

### October 30, 2025 - Keyboard Shortcuts & Advanced Filters ✨ NEW
- ✅ **Keyboard Shortcuts** - Navigate faster with global shortcuts
  - `Ctrl+N` / `Cmd+N` - Create new conversation
  - `Ctrl+K` / `Cmd+K` - Focus search input
  - `Ctrl+E` / `Cmd+E` - Export current conversation
  - `Ctrl+Shift+T` / `Cmd+Shift+T` - Toggle theme
  - `Esc` - Close dialogs and modals
  - Cross-platform support (Windows/Mac/Linux)
  - Input field protection (shortcuts disabled when typing)
  - Disabled during pending/streaming states
- ✅ **Advanced Search Filters** - Filter conversations with precision
  - Date range filters: Today, Last 7 days, Last 30 days
  - Source type filters: Files only, URLs only, No sources
  - Combined filters with AND logic
  - Visual filter badges with count indicator
  - Quick filter toggle and individual removal
  - Filter persistence across tab switches
  - Works seamlessly with text search
- ✅ **Testing** - Comprehensive test coverage
  - 24 keyboard shortcut unit tests
  - 41 search filter unit tests (27 new + 14 existing)
  - 7 keyboard shortcut E2E tests
  - 15 search filter E2E tests
  - All 263 tests passing
- ✅ **UI Enhancements** - Polished filter interface
  - Filter dropdown with organized sections
  - Active filter badges with X buttons
  - Filter count badge on Filters button
  - Checkmarks for active filters in dropdown
  - Clear all filters option
- 📚 **Documentation** - Complete feature guides
  - [Keyboard Shortcuts Guide](./docs/03-features/keyboard-shortcuts.md)
  - [Search Filters Guide](./docs/03-features/search-filters.md)

### October 30, 2025 - Export Conversations
- ✅ **Export to TXT** - Download conversations as plain text files
  - Clean, readable format with metadata
  - Includes sources and summaries
  - One-click download from conversation history
- ✅ **Export to PDF** - Professional PDF documents
  - Styled with proper typography
  - Color-coded messages (blue for user, green for AI)
  - Multi-page support with automatic page breaks
  - Includes conversation metadata and sources
- ✅ **Export UI** - Intuitive export interface
  - Download button appears on conversation hover
  - Dropdown menu with format selection
  - Success/error toast notifications
  - Safe filename generation with timestamps
- ✅ **Testing** - Comprehensive test coverage
  - 14 new unit tests (exportConversationToTxt, exportConversationToPdf)
  - 5 new E2E tests (export button, dropdown, toasts)
  - 84.16% coverage in export.ts
- 📚 **Documentation** - Full feature documentation in [docs/03-features/export-conversations.md](./docs/03-features/export-conversations.md)

### October 20, 2025 - CI/CD Pipeline & Code Quality
- ✅ **CI/CD Pipeline** - Automated quality checks on every push
  - ESLint code quality validation
  - Jest unit and integration tests
  - Coverage threshold enforcement (51%+ coverage)
  - Automated builds with Next.js
  - GitGuardian security scanning
- ✅ **Code Quality Improvements** - Enhanced type safety and cleaner code
  - Fixed all ESLint warnings and errors
  - Created `ThemePalette` interface (replaced `any` types)
  - Removed unused variables and imports
  - Optimized fonts with Next.js `next/font/google`
  - Inter and Space Grotesk fonts with automatic optimization
- ✅ **Testing Infrastructure** - Coverage thresholds adjusted
  - Statements: 51.2% (locked in gains)
  - Branches: 65.6% (exceeds 65% threshold)
  - Functions: 44.9% (meets threshold)
  - Lines: 51.2% (locked in gains)
- 📚 **Documentation** - Updated README and test coverage metrics

### October 17, 2025 (Afternoon Session)
- ✅ **Chat History Management** - Complete conversation management system
  - Save and load multiple conversations
  - Auto-generated conversation titles from first message
  - Smart sorting by recent activity
  - Delete conversations with confirmation
  - Seamless conversation switching
  - Timestamps and message counts
  - Auto-save on every change
- ✅ **Conversation Search** - Real-time search functionality
  - Search conversations by title or message content
  - Case-insensitive with debounced input (300ms)
  - Clear button to reset search
  - Shows "No conversations found" when no matches
  - Custom `useConversationSearch` hook
  - 14 unit tests + 9 E2E tests (27 runs across browsers)
- ✅ **Content Summaries** - AI-powered source summaries
  - Generate 200-300 word summaries for any source
  - 3-5 key points extraction
  - Collapsible summary display
  - One-click generation with sparkle icon
  - Persistent storage with sources
  - New Genkit flow for summarization
- 📚 **Documentation** - Added [chat-history-content-summaries.md](./docs/04-development/chat-history-content-summaries.md) (3500+ lines)
- 🎨 **UI Enhancements** - New conversation history sidebar and enhanced source cards

### October 17, 2025 (Morning Session)
- ✅ **Mobile Responsive Layout** - Complete mobile optimization
  - Auto-close sidebar after adding files/URLs on mobile
  - Touch-friendly interactions (44px minimum touch targets)
  - Responsive message bubbles (85% width on mobile)
  - Mobile-optimized padding and spacing
  - iOS Safari input zoom prevention (16px font-size)
  - Smooth momentum scrolling on iOS
  - Enhanced viewport and theme-color meta tags
  - Consistent focus states for accessibility
- 📚 **Documentation** - Added [mobile-responsive-layout.md](./docs/04-development/mobile-responsive-layout.md) (1000+ lines)

### October 13, 2025
- ✅ **Error Boundaries** - Graceful error handling with recovery
  - React Error Boundaries wrap critical sections
  - Custom fallback UI for different components
  - Error logging with localStorage persistence
  - Automatic recovery with resetKeys
  - Next.js error.tsx for SSR errors
  - Export error logs for debugging
- ✅ **UI Layout Improvements** - Better screen space utilization
  - Wider sidebar (20rem)
  - Centered content with max-width
  - Responsive padding (mobile to desktop)
  - Enhanced source cards with hover states
  - Better message bubble sizing
- ✅ **Input Validation** - Comprehensive validation with security features
  - File size limits (10MB max)
  - URL validation (SSRF/XSS protection)
  - Content length limits (500K chars)
  - Detailed error messages
- ✅ **Persistence Layer** - Auto-save messages, sources, and themes to localStorage
- ✅ **Response Streaming** - Real-time AI response with animated cursor
- ✅ **Clear Data Option** - Added "Clear All Data" in settings menu
- ✅ **Welcome Back Message** - Shows restored data count on load
- 📚 **Documentation** - Added [error-handling.md](./docs/04-development/error-handling.md), [input-validation.md](./docs/04-development/input-validation.md), and [persistence-streaming-implementation.md](./docs/04-development/persistence-streaming-implementation.md)

### October 7, 2025
- ✅ **Testing Infrastructure** - Jest + Playwright setup (65+ tests)
- ✅ **Theme Toggle** - Quick toggle with Ctrl+Shift+T shortcut
- ✅ **Documentation Reorganization** - 31 files, ~9,000 lines organized

---

**Last Updated:** October 30, 2025
