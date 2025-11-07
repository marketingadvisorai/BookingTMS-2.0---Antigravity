# AI Booking Assistant - Interactive Chat Implementation

## Overview

An intelligent, conversational booking assistant that transforms the UI/UX based on customer needs. The chat interface dynamically displays different components (game selectors, date pickers, time slots, participant counters) based on the conversation flow - similar to how ChatGPT adapts its interface.

## Location

- **Component**: `/components/aiagents/BookingChatAssistant.tsx`
- **Page**: `/pages/AIAgents.tsx` (Customer Assistant section)

## Features

### 1. **Conversational Booking Flow**
The assistant guides customers through the booking process in a natural, conversational way:

1. **Game Selection** → Shows interactive game cards with:
   - Game name and description
   - Difficulty badge (Easy/Medium/Hard)
   - Duration and player count
   - Price per person
   - Hover effects and animations

2. **Date Selection** → Shows calendar widget:
   - Interactive date picker
   - Blocks past dates
   - Visual feedback on selection

3. **Time Slot Selection** → Shows grid of available times:
   - 8 time slots per day (10 AM - 8:30 PM)
   - Click-to-select interface
   - Hover animations

4. **Participant Count** → Shows number selector:
   - Respects min/max players for selected game
   - Visual counter buttons
   - Adaptive grid layout

5. **Checkout Summary** → Shows booking details:
   - Selected game with icon
   - Date, time, and participant count
   - Price breakdown (per person × count)
   - Total price calculation
   - "Proceed to Checkout" button

### 2. **AI-Like Responses**
The chat understands natural language inputs:
- "Book a room" → Shows game selector
- "Show me prices" → Shows game selector with price info
- "What times are available?" → Guides to game selection first
- Any message → Intelligent response guiding to booking flow

### 3. **Visual Design**
- **Typing Indicators**: Animated dots when bot is "thinking"
- **Message Bubbles**: Rounded chat bubbles (bot vs user)
- **Avatar Icons**: Bot icon with online status indicator
- **Smooth Animations**: Scale effects on hover, smooth scrolling
- **Auto-Scroll**: Messages automatically scroll to bottom

### 4. **Dark Mode Support**
Fully compliant with BookingTMS dark mode guidelines:
- ✅ Background colors: #0a0a0a, #161616, #1e1e1e
- ✅ Border colors: #2a2a2a
- ✅ Text colors: white, #a3a3a3
- ✅ Vibrant blue accent: #4f46e5
- ✅ Dynamic color theming based on widget color

## Mock Data

### Games (4 escape rooms)
```typescript
1. Mystery Mansion - Medium difficulty, 60 min, $29/person
2. Prison Break - Hard difficulty, 75 min, $35/person
3. Lost Temple - Easy difficulty, 45 min, $25/person
4. Zombie Outbreak - Hard difficulty, 60 min, $32/person
```

### Time Slots (8 daily slots)
```
10:00 AM, 11:30 AM, 1:00 PM, 2:30 PM
4:00 PM, 5:30 PM, 7:00 PM, 8:30 PM
```

## Component Architecture

### Props
```typescript
interface BookingChatAssistantProps {
  chatColor: string;           // Primary color for chat UI
  chatPosition: 'left' | 'right'; // Widget position
  chatGreeting: string;         // Initial greeting message
  isOpen: boolean;             // Chat open/closed state
  onToggle: () => void;        // Toggle handler
}
```

### State Management
- `messages`: Array of chat messages (bot & user)
- `selectedGame`: Currently selected escape room
- `selectedDate`: Chosen booking date
- `selectedTime`: Selected time slot
- `participantCount`: Number of participants
- `isTyping`: Bot typing indicator state
- `inputValue`: User input field value

### Message Types
```typescript
interface Message {
  id: string;
  type: 'bot' | 'user';
  text?: string;
  component?: 'game-selector' | 'date-picker' | 'time-slots' 
            | 'participant-count' | 'checkout-summary';
  data?: any;
}
```

## User Experience Flow

### Example Conversation:

**Bot**: Hi! How can I help you today?

**Bot**: I can help you book an escape room experience! Let me show you our available games:
→ [Shows 4 game cards]

**User**: *Clicks "Mystery Mansion"*

**Bot**: Great choice! Mystery Mansion is a medium level room that takes 60 min. Let's pick a date:
→ [Shows calendar]

**User**: *Selects December 15*

**Bot**: Perfect! Here are the available time slots for December 15:
→ [Shows 8 time slots]

**User**: *Clicks "7:00 PM"*

**Bot**: Excellent! How many people will be joining you? (2-8 players)
→ [Shows participant counter]

**User**: *Selects 4 people*

**Bot**: Perfect! Here's your booking summary:
→ [Shows summary card with checkout button]

**User**: *Clicks "Proceed to Checkout"*

**Bot**: 🎉 Awesome! Redirecting you to checkout to complete your booking...

## Integration with AI Agents Page

The BookingChatAssistant is integrated into the "Customer Assistant" section of the AI Agents page:

1. **Live Preview Section**: Shows the chat widget in a simulated website environment
2. **Customization Options**: 
   - Color picker for widget theme
   - Position selector (left/right)
   - Greeting message editor
3. **Real-time Updates**: Changes to settings immediately reflect in preview

## Technical Implementation

### Key Features:
- **React Hooks**: useState, useRef, useEffect
- **Auto-scroll**: Automatically scrolls to newest messages
- **Typing Simulation**: 1-second delay before bot responses
- **Date Formatting**: Uses date-fns for readable dates
- **Responsive Design**: Adapts to mobile/desktop
- **Accessibility**: Keyboard support, semantic HTML

### Performance:
- Efficient re-renders (only affected components update)
- Smooth animations (CSS transitions)
- No unnecessary API calls (all data is mock)

## Future Enhancements

Potential improvements for production:

1. **Real AI Integration**: Connect to OpenAI/Anthropic API
2. **Live Availability**: Check real-time slot availability
3. **Payment Integration**: Complete checkout flow
4. **Multi-language**: Support multiple languages
5. **Voice Input**: Speech-to-text support
6. **Analytics**: Track conversation success rates
7. **Custom Prompts**: Admin-editable bot personality
8. **Image Support**: Show game photos
9. **Recommendations**: AI-powered game suggestions
10. **Chat History**: Save and resume conversations

## Testing Checklist

- [x] Dark mode renders correctly
- [x] Light mode renders correctly
- [x] All game cards are clickable
- [x] Calendar blocks past dates
- [x] Time slots are selectable
- [x] Participant count adapts to game limits
- [x] Price calculation is accurate
- [x] Chat auto-scrolls on new messages
- [x] Typing indicator animates
- [x] Minimize/maximize works
- [x] Position toggle (left/right) works
- [x] Custom color applies correctly
- [x] Text input sends messages
- [x] Enter key sends messages
- [x] AI responses trigger correctly

## Guidelines Compliance

✅ **Dark Mode**: Full 3-tier background system (#0a0a0a, #161616, #1e1e1e)
✅ **Vibrant Blue**: #4f46e5 for primary actions in dark mode
✅ **Typography**: Uses default globals.css typography
✅ **Responsive**: Mobile-first design with breakpoints
✅ **Accessibility**: Proper ARIA labels, keyboard navigation
✅ **Animations**: Smooth transitions and hover effects
✅ **Code Quality**: TypeScript, semantic naming, clean structure

## Code Location

```
/components/aiagents/BookingChatAssistant.tsx  (545 lines)
/pages/AIAgents.tsx                            (updated Customer Assistant section)
```

## Dependencies

- `lucide-react` - Icons
- `date-fns` - Date formatting
- `../ui/calendar` - Date picker component
- `../ui/button` - Button component
- `../ui/input` - Input component
- `../ui/badge` - Badge component
- `../layout/ThemeContext` - Theme management

---

**Last Updated**: November 4, 2025
**Status**: ✅ Fully Implemented
**Developer**: AI Assistant
