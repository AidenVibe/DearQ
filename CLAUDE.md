# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**마음배달 (DearQ)** - "매일 하나의 질문으로 가족의 마음을 배달합니다"

A Korean family conversation app that facilitates meaningful daily conversations through carefully curated questions, built with modern web technologies and strict TDD principles.

## Core Technology Stack

- **Framework**: Next.js 15, React 19
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Testing**: Jest, React Testing Library, MSW (API stubs), Playwright (E2E)
- **Type Safety**: TypeScript with strict configuration
- **UI Components**: Custom shadcn/ui implementations in `components/ui/`

## Development Commands

```bash
# Essential development commands
npm install --legacy-peer-deps  # Install dependencies (required for React 19)
npm run dev                     # Start development server
npm run build                   # Build for production
npm run typecheck              # TypeScript validation

# Testing commands
npm run test                   # Run Jest unit tests
npm run test:watch            # Jest in watch mode
npm run test:e2e              # Playwright E2E tests (when configured)

# UI Development
npm run storybook             # Start Storybook UI development
npm run build-storybook       # Build Storybook

# Code quality
npm run lint                  # ESLint validation
```

## Architecture & Key Patterns

### Project Structure
```
DearQ/
├── app/                 # Next.js App Router (minimal setup)
├── components/          # React components with TDD approach
│   ├── ui/             # shadcn/ui base components
│   ├── notifications/  # Notification system
│   └── settings/       # Settings management
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility classes (NotificationManager, etc)
├── contexts/           # React Context providers
├── tests/              # Comprehensive test suite
│   ├── __tests__/      # Unit tests (95 tests across 8 suites)
│   ├── __mocks__/      # Jest mocks
│   ├── stubs/          # MSW API handlers
│   └── setup.ts        # Test configuration
└── 참고/               # Korean reference documentation
```

### Critical Development Principles

1. **TDD First**: Always follow Red → Green → Refactor cycle
2. **Korean Language**: All documentation, logs, commits in Korean (코드 식별자는 영어 허용)
3. **MSW Stub System**: 4-scenario pattern (success/failure/expired/empty) via `?scenario=` query param
4. **Accessibility**: 44px touch targets, 4.5:1 contrast ratio, complete keyboard navigation
5. **Component-First**: Build reusable components before pages

### MSW API Stub System

The project uses MSW with a sophisticated 4-state stub pattern for all API endpoints:

```typescript
// API endpoints support scenario simulation
GET /api/questions?scenario=success    // Normal response  
GET /api/questions?scenario=failure    // Server error
GET /api/questions?scenario=expired    // Token expired
GET /api/questions?scenario=empty      // No data
```

**Stub Handlers Location**: `tests/stubs/handlers.ts`
**Environment Variable**: `USE_REAL_API=false` (default for development)

### Type System Architecture

Comprehensive TypeScript types in `types/` covering:
- `notification.ts`: 5 notification types with full preference system
- `settings.ts`: User/Family/App settings with 10 sections  
- `question.ts`: 100 questions across 10 categories
- `conversation.ts`: Complete conversation lifecycle
- `label.ts`: Family member management without pairing

### Custom Hooks Pattern

Business logic encapsulated in hooks (`hooks/`):
- `useNotifications.ts`: Push notification management with Web API
- `useSettings.ts`: Comprehensive settings with localStorage persistence  
- `useKakaoShare.ts`: Social sharing integration
- `useWeeklyShare.ts`: Weekly highlight functionality

## Testing Strategy

### Current Test Coverage (95 tests across 8 suites)
```
✓ LoginButton (4 tests) - Kakao OAuth integration
✓ Questions Library (15 tests) - Question management system  
✓ HomePage (8 tests) - Main application entry
✓ SendModal (10 tests) - Family message sending
✓ AnswerPage (13 tests) - Response collection
✓ ConversationPage (14 tests) - Conversation display
✓ LabelManagement (13 tests) - Family member management
✓ ConversationHistory (18 tests) - Message history
```

### Test Configuration
- **Setup**: `tests/setup.ts` with React Testing Library
- **Environment**: jsdom with Next.js integration
- **Path Mapping**: `@/*` resolves to project root
- **Mock Strategy**: MSW for API calls, comprehensive component mocking

## Key Features & Implementation Status

### ✅ Completed (Phases 1-6)
- Complete TDD infrastructure with 95 passing tests
- OAuth authentication with Kakao integration
- Question library (100 questions, 10 categories)  
- Family labeling system (no pairing required)
- One-time answer tokens (24-hour expiration)
- Conversation history with self-expression gate
- Label management with CRUD operations

### 🚧 Phase 7 (In Progress)
- **Notification System**: Complete push notification architecture with Service Worker
- **Settings Screen**: 10-section comprehensive settings management
- **Weekly Highlights**: Social sharing functionality

## Critical Design Requirements

### Accessibility Standards
- **Touch Targets**: Minimum 44×44px for all interactive elements
- **Contrast**: 4.5:1 ratio minimum for all text
- **Keyboard Navigation**: Complete tab order and focus management
- **Screen Reader**: Proper ARIA labels and live regions

### Visual Design Rules
- **No Gradients**: Solid colors only
- **Background**: Primary-100 or light surface tones
- **Focus Indicators**: Always visible, never removed
- **Korean Typography**: Optimized for 한글 readability

### Performance Targets
- **TTI**: < 2.5 seconds on 3G Fast
- **Lighthouse**: 80+ score minimum
- **Code Splitting**: Route-based splitting implemented
- **Bundle Size**: Critical monitoring for React 19

## Security & Validation

### Input Validation
- **Answer Length**: 2-800 characters (frontend + backend)
- **XSS Prevention**: HTML sanitization required
- **Token Security**: Single-use, 24-hour TTL, immediate invalidation

### Environment Security
- **Keys**: Never commit to repository
- **Local Config**: `.env.local` only
- **Stub Mode**: Default `USE_REAL_API=false`

## Development Workflow

### Starting New Features
1. Read `참고/04.Rules.md` for latest guidelines
2. Review `todo.md` for current progress
3. Write failing tests first (Red)
4. Implement minimal code (Green)  
5. Refactor for clean architecture
6. Update documentation

### Adding Components
1. Create TypeScript interfaces in `types/`
2. Build MSW handlers in `tests/stubs/`
3. Write comprehensive tests in `tests/__tests__/`
4. Implement component with accessibility features
5. Add to Storybook if reusable

### Testing New APIs
Use MSW scenario system:
```typescript
// In component tests
test('handles API failure gracefully', async () => {
  // MSW handler automatically responds based on scenario
  render(<Component />, { 
    apiScenario: 'failure' 
  })
  // Assert error handling
})
```

## Important Files to Review

### Always Read First
- `참고/04.Rules.md` - Complete development standards
- `todo.md` - Current project status and phase completion
- `참고/01.마음배달 PRD.md` - Product requirements (Korean)

### Architecture References  
- `types/` - TypeScript definitions for understanding data flow
- `tests/stubs/handlers.ts` - API contract definitions
- `components/` - Component implementation patterns

### Configuration
- `tsconfig.json` - TypeScript with strict mode and path mapping
- `jest.config.js` - Test environment configuration  
- `tailwind.config.js` - Design system implementation

This project maintains extremely high standards for code quality, accessibility, and testing. Every component follows TDD principles and must pass comprehensive accessibility audits before implementation completion.