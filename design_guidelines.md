# Fluffy Trivia Mobile Game - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing from mobile game UI patterns like Kahoot, Duolingo, and casual trivia games, prioritizing playful engagement and clear feedback states.

## Core Design Elements

### A. Color Palette
Following the Fluffy Trivia PDF specifications:
- **Category Colors** (from PDF): Each category has distinct vibrant colors for card identification
- **Dark Mode Primary**: 220 15% 8% (deep navy background)
- **Light Mode Primary**: 220 15% 98% (clean white background)
- **Success Feedback**: 142 76% 36% (bright green)
- **Error Feedback**: 0 84% 60% (vibrant red)
- **Neutral Elements**: 220 14% 46% (balanced gray)

### B. Typography
- **Primary Font**: Inter (Google Fonts) - excellent mobile readability
- **Question Text**: Bold, large sizing (text-xl to text-2xl)
- **Answer Options**: Medium weight, comfortable reading size (text-lg)
- **UI Elements**: Regular weight for secondary text

### C. Layout System
**Tailwind Spacing**: Primary units of 4, 6, and 8 (p-4, m-6, gap-8)
- **Mobile-First**: Single column layout, full-width cards
- **Touch Targets**: Minimum 44px (h-11) for all interactive elements
- **Card Spacing**: 6-unit gaps between major sections
- **Generous Padding**: 4-6 units for comfortable touch interaction

### D. Component Library

#### Game Interface Components
- **Category Cards**: Large, colorful cards with category-specific colors from PDF
- **Question Cards**: Clean white/dark cards with clear typography hierarchy
- **Answer Buttons**: Full-width, rounded buttons with category color theming
- **Feedback Overlay**: Immediate visual feedback with success/error states
- **Reaction Buttons**: 6 emoji-based feedback buttons (👍👎😂🤯😴🚩) in grid layout

#### CMS Admin Components
- **Data Tables**: Clean, sortable tables for question management
- **Form Elements**: Standard inputs with proper validation states
- **Upload Interface**: Drag-and-drop CSV upload with progress indication
- **CRUD Actions**: Clear action buttons with confirmation modals

### E. Key Interaction Patterns

#### Game Flow
1. **Category Selection**: Grid of colorful category cards
2. **Question Display**: Full-screen card presentation
3. **Answer Selection**: Three large, tappable answer buttons
4. **Immediate Feedback**: Success/error overlay with correct answer reveal
5. **Reaction Capture**: Horizontal row of emoji feedback buttons
6. **Next Question**: Clear progression with smooth transitions

#### Special Cards Handling
- **Special Category**: No answer buttons, display instruction text prominently
- **Visual Treatment**: Distinct styling to indicate instruction vs. question format

### F. Mobile Optimization
- **Touch-First Design**: All elements sized for finger navigation
- **Swipe Gestures**: Consider swipe-to-next-question functionality
- **Responsive Scaling**: Text and spacing that adapts to screen size
- **Performance**: Minimal animations, fast loading states

### G. Feedback & Analytics UX
- **Non-Intrusive**: Feedback collection doesn't interrupt game flow
- **Visual Confirmation**: Brief confirmation when feedback is submitted
- **Rate Limiting**: Gentle UI indication when feedback limit reached

This design prioritizes the playful, engaging nature of trivia gaming while maintaining the clean, functional approach needed for both player enjoyment and admin management.