# Documentation Reorganization Plan

## Current Problems
- ❌ 17 files in a flat structure
- ❌ No clear reading order
- ❌ Mixed purposes (guides, references, logs, summaries)
- ❌ Hard to find what you need
- ❌ No distinction between essential vs optional

---

## Proposed New Structure

```
docs/
├── README.md                          # 📍 START HERE - Navigation guide
├── 01-getting-started/
│   ├── README.md                      # Getting started overview
│   ├── installation-warnings.md       # Setup issues and solutions
│   └── blueprint.md                   # Project vision and features
├── 02-testing/
│   ├── README.md                      # Testing overview
│   ├── quick-reference.md             # (was TESTING-README.md - moved to root)
│   ├── jest-vs-playwright.md          # Testing strategy comparison
│   ├── testing-guide.md               # How to write tests
│   ├── testing-strategy.md            # Testing approach
│   ├── manual-test-scenarios.md       # Manual testing checklist
│   ├── test-cleanup-summary.md        # Test cleanup work done
│   └── e2e-test-analysis.md           # Playwright test analysis
├── 03-features/
│   ├── README.md                      # Features overview
│   └── theme-toggle/
│       ├── suggestions.md             # Design options explored
│       ├── implementation.md          # Technical implementation
│       └── summary.md                 # Quick summary
├── 04-development/
│   ├── README.md                      # Development guide
│   ├── dev-issue-log.md               # Known issues and fixes
│   ├── sessions.md                    # Development session notes
│   ├── local-sessions.md              # Local development notes
│   └── git-commit-guide.md            # How to commit changes
├── 05-reference/
│   ├── README.md                      # Reference materials
│   ├── end-of-day-summary.md          # October 7, 2025 summary
│   └── test-package-additions.json    # Test dependencies added
└── archive/
    └── (old versions, deprecated docs)
```

---

## New User Journey

### 🎯 First-Time Users (Start Here)
**Read in this order:**

1. **`docs/README.md`** (2 min)
   - Overview of all documentation
   - Quick links to important sections
   - Where to find what

2. **`docs/01-getting-started/README.md`** (5 min)
   - Project overview
   - How to run the app
   - Basic features

3. **Root `README.md`** (3 min) 
   - Project description
   - Installation steps
   - Quick start

4. **`TESTING-README.md`** in root (3 min) - MOVE to root level
   - How to run tests
   - Quick commands
   - Basic testing

**Total time: ~15 minutes to get started**

---

### 🧪 Developers Adding Tests
**Read these:**

1. **`docs/02-testing/README.md`** - Testing overview
2. **`docs/02-testing/jest-vs-playwright.md`** - When to use which
3. **`docs/02-testing/testing-guide.md`** - How to write tests
4. **`docs/02-testing/testing-strategy.md`** - Our approach

**Optional:**
- `manual-test-scenarios.md` - Manual testing checklist
- `e2e-test-analysis.md` - Current E2E status
- `test-cleanup-summary.md` - What was cleaned up

---

### 🎨 Developers Adding Features
**Read these:**

1. **`docs/03-features/README.md`** - Feature development guide
2. **`docs/01-getting-started/blueprint.md`** - Project vision
3. **Example: `docs/03-features/theme-toggle/`** - See how features are documented

---

### 🐛 Troubleshooting Issues
**Read these:**

1. **`docs/04-development/dev-issue-log.md`** - Known issues
2. **`docs/01-getting-started/installation-warnings.md`** - Setup problems
3. **`docs/02-testing/test-cleanup-summary.md`** - Test issues resolved

---

### 📚 Reference (As Needed)
**Look up when you need:**

- **`docs/05-reference/end-of-day-summary.md`** - What was accomplished
- **`docs/04-development/git-commit-guide.md`** - How to commit
- **`docs/04-development/sessions.md`** - Session notes

---

## File Renaming & Reorganization

### Move to Root (from docs/)
```bash
# Make testing guide more visible
mv docs/TESTING-README.md ./TESTING-README.md
```

### Create Category Folders
```bash
mkdir docs/01-getting-started
mkdir docs/02-testing
mkdir docs/03-features
mkdir docs/03-features/theme-toggle
mkdir docs/04-development
mkdir docs/05-reference
mkdir docs/archive
```

### Move Files to Categories

**Getting Started:**
```bash
mv docs/blueprint.md docs/01-getting-started/
mv docs/installation-warnings.md docs/01-getting-started/
```

**Testing:**
```bash
mv docs/jest-vs-playwright.md docs/02-testing/
mv docs/testing-guide.md docs/02-testing/
mv docs/testing-strategy.md docs/02-testing/
mv docs/manual-test-scenarios.md docs/02-testing/
mv docs/test-cleanup-summary.md docs/02-testing/
mv docs/e2e-test-analysis.md docs/02-testing/
```

**Features:**
```bash
mv docs/theme-toggle-suggestions.md docs/03-features/theme-toggle/suggestions.md
mv docs/theme-toggle-implementation.md docs/03-features/theme-toggle/implementation.md
mv docs/theme-toggle-summary.md docs/03-features/theme-toggle/summary.md
```

**Development:**
```bash
mv docs/dev-issue-log.md docs/04-development/
mv docs/sessions.md docs/04-development/
mv docs/local-sessions.md docs/04-development/
mv docs/git-commit-guide.md docs/04-development/
```

**Reference:**
```bash
mv docs/end-of-day-summary.md docs/05-reference/
mv docs/test-package-additions.json docs/05-reference/
```

---

## Create README Files for Each Category

### `docs/README.md` (Main Documentation Index)
```markdown
# DocuNote Documentation

## 📖 Documentation Overview

Welcome! This guide helps you navigate all documentation.

### 🚀 Quick Start (New Users)
1. Read [Getting Started Guide](./01-getting-started/README.md)
2. Check [Installation Warnings](./01-getting-started/installation-warnings.md) if you have issues
3. See root [README.md](../README.md) for installation steps
4. Run tests with [TESTING-README.md](../TESTING-README.md)

### 📚 Documentation Categories

#### 1. Getting Started (Essential)
- [Getting Started Overview](./01-getting-started/README.md)
- [Project Blueprint](./01-getting-started/blueprint.md) - Vision & features
- [Installation Warnings](./01-getting-started/installation-warnings.md) - Common issues

#### 2. Testing (For Developers)
- [Testing Overview](./02-testing/README.md)
- [Jest vs Playwright](./02-testing/jest-vs-playwright.md) - When to use what
- [Testing Guide](./02-testing/testing-guide.md) - How to write tests
- [Testing Strategy](./02-testing/testing-strategy.md) - Our approach

#### 3. Features (For Feature Development)
- [Features Overview](./03-features/README.md)
- [Theme Toggle](./03-features/theme-toggle/) - Example feature docs

#### 4. Development (For Contributors)
- [Development Guide](./04-development/README.md)
- [Issue Log](./04-development/dev-issue-log.md) - Known issues
- [Git Commit Guide](./04-development/git-commit-guide.md) - How to commit

#### 5. Reference (As Needed)
- [End of Day Summary](./05-reference/end-of-day-summary.md) - Oct 7, 2025
- [Test Packages](./05-reference/test-package-additions.json) - Dependencies

### 🎯 Reading Paths

**I want to:** → **Read this:**
- Get started → `01-getting-started/README.md`
- Write tests → `02-testing/README.md` → `jest-vs-playwright.md`
- Add a feature → `03-features/README.md` → theme-toggle example
- Fix a bug → `04-development/dev-issue-log.md`
- Understand what was done → `05-reference/end-of-day-summary.md`

### ⏱️ Estimated Reading Times
- **Get started:** ~15 min (sections 1 + root README + TESTING-README)
- **Learn testing:** ~30 min (section 2)
- **Learn features:** ~20 min (section 3)
- **Full documentation:** ~2 hours
```

### `docs/01-getting-started/README.md`
```markdown
# Getting Started with DocuNote

## Quick Overview
DocuNote is a Next.js application that lets you turn documents (PDFs, text files) and websites into conversations with AI.

## Prerequisites
- Node.js 18+
- npm or yarn

## Quick Start
1. Clone the repository
2. Run `npm install`
3. Create `.env.local` with your API keys
4. Run `npm run dev`
5. Open http://localhost:9002

## Key Features
- 💬 Chat with documents
- 📄 Upload PDF and text files
- 🌐 Scrape website content
- 🎨 AI-powered theme generator
- 🌙 Light/Dark theme toggle

## Next Steps
- Read [Blueprint](./blueprint.md) for project vision
- Check [Installation Warnings](./installation-warnings.md) if you have issues
- See [Testing Guide](../02-testing/README.md) to run tests
```

### `docs/02-testing/README.md`
```markdown
# Testing Documentation

## Quick Reference
For commands and quick start, see [TESTING-README.md](../../TESTING-README.md) in the root.

## Testing Strategy
We use two testing frameworks:
- **Jest** - Unit and integration tests (fast, mock everything)
- **Playwright** - E2E tests (slow, real browser)

## Read These First
1. [Jest vs Playwright](./jest-vs-playwright.md) - When to use which framework
2. [Testing Guide](./testing-guide.md) - How to write tests
3. [Testing Strategy](./testing-strategy.md) - Our testing approach

## Current Status (Oct 7, 2025)
- ✅ 54 passing Jest tests
- ✅ 11 skipped tests (documented)
- ✅ 42% statement coverage, 57% branch coverage
- ⚠️ Some E2E tests need implementation

## Optional Reading
- [Test Cleanup Summary](./test-cleanup-summary.md) - What was fixed
- [E2E Test Analysis](./e2e-test-analysis.md) - Playwright status
- [Manual Test Scenarios](./manual-test-scenarios.md) - Manual testing
```

### `docs/03-features/README.md`
```markdown
# Feature Documentation

## How Features Are Documented

Each feature should have:
1. **Suggestions** - Design options explored
2. **Implementation** - Technical details
3. **Summary** - Quick overview

## Example: Theme Toggle Feature
See [theme-toggle/](./theme-toggle/) for a complete example.

## Feature Template
When adding a new feature, create:
```
docs/03-features/your-feature/
├── suggestions.md      # Design options
├── implementation.md   # Technical implementation
└── summary.md          # Quick summary
```

## Adding Your Feature
1. Copy the theme-toggle folder structure
2. Document design decisions in suggestions.md
3. Document implementation in implementation.md
4. Create summary.md for quick reference
```

### `docs/04-development/README.md`
```markdown
# Development Guide

## Getting Started
1. Read [Getting Started](../01-getting-started/README.md)
2. Check [Issue Log](./dev-issue-log.md) for known issues
3. Follow [Git Commit Guide](./git-commit-guide.md) for commits

## Development Workflow
1. Create feature branch
2. Develop and test locally
3. Write tests (see [Testing Guide](../02-testing/README.md))
4. Update documentation
5. Commit following the guide
6. Create pull request

## Resources
- [Session Notes](./sessions.md) - Development sessions
- [Local Sessions](./local-sessions.md) - Local development
- [Issue Log](./dev-issue-log.md) - Known issues and fixes
```

### `docs/05-reference/README.md`
```markdown
# Reference Documentation

## What's Here
Historical information, summaries, and reference materials.

## Contents
- [End of Day Summary](./end-of-day-summary.md) - October 7, 2025 work summary
- [Test Packages](./test-package-additions.json) - Testing dependencies added

## When to Read
- Reviewing past work
- Understanding what was accomplished
- Looking up dependency information
```

---

## Alternative: Numbered Prefix Approach

If you prefer numbered files in a flat structure:

```
docs/
├── 00-START-HERE.md                    # Navigation guide
├── 01-blueprint.md                     # Project vision
├── 02-installation-warnings.md         # Setup issues
├── 10-testing-overview.md              # Testing intro
├── 11-jest-vs-playwright.md            # Testing comparison
├── 12-testing-guide.md                 # How to test
├── 13-testing-strategy.md              # Test approach
├── 14-manual-test-scenarios.md         # Manual tests
├── 15-test-cleanup-summary.md          # Cleanup work
├── 16-e2e-test-analysis.md             # E2E status
├── 20-theme-toggle-suggestions.md      # Feature design
├── 21-theme-toggle-implementation.md   # Feature impl
├── 22-theme-toggle-summary.md          # Feature summary
├── 30-dev-issue-log.md                 # Known issues
├── 31-git-commit-guide.md              # Commit guide
├── 40-sessions.md                      # Session notes
├── 41-local-sessions.md                # Local notes
└── 99-end-of-day-summary.md            # Daily summary
```

**Pros:** Simple, flat structure, clear order  
**Cons:** Gets messy with many files, no logical grouping

---

## Recommendation: HYBRID APPROACH ⭐

**Best of both worlds:**

```
docs/
├── README.md                          # 📍 START HERE
├── getting-started/
│   ├── 01-blueprint.md
│   └── 02-installation-warnings.md
├── testing/
│   ├── 01-overview.md
│   ├── 02-jest-vs-playwright.md
│   ├── 03-guide.md
│   └── reference/
│       ├── cleanup-summary.md
│       └── e2e-analysis.md
├── features/
│   └── theme-toggle/
│       ├── 01-suggestions.md
│       ├── 02-implementation.md
│       └── 03-summary.md
├── development/
│   ├── issue-log.md
│   ├── git-guide.md
│   └── sessions/
│       ├── sessions.md
│       └── local-sessions.md
└── reference/
    ├── end-of-day-summary.md
    └── test-packages.json
```

**Why this works:**
✅ Logical grouping (folders)  
✅ Clear reading order (numbers within folders)  
✅ Scalable (easy to add more)  
✅ Intuitive (new users find what they need)  
✅ Clean (not too deep, not too flat)  

---

## Implementation Steps

### Option 1: Full Reorganization (Recommended)
```bash
# Run this script to reorganize
./scripts/reorganize-docs.ps1
```

### Option 2: Manual (Step by Step)
See detailed commands above in each section.

---

## Benefits

### Before (Current)
- ❌ 17 files in one folder
- ❌ No clear order
- ❌ Hard to find what you need
- ❌ No reading path for new users

### After (Proposed)
- ✅ Organized by purpose (5 categories)
- ✅ Clear reading order (README → sections)
- ✅ Easy to find (logical grouping)
- ✅ New user journey (~15 min to start)
- ✅ Scalable (easy to add more docs)

---

## Next Steps

**I recommend:**
1. Implement the **Hybrid Approach** (folders + numbers)
2. Create the PowerShell script to automate reorganization
3. Create README.md files for each category
4. Update all internal links in documents
5. Test that all links still work

**Shall I create the reorganization script for you?**
