# 🌿 KERALA Shahr — ULTRA PROMPT
## Complete App Build Specification (Post-Auth)

---

## 🎨 DESIGN SYSTEM (Extracted from Reference Image)

### Color Palette
```
Primary Green (CTA/Active):     #4CAF50  →  buttons, active tab, highlighted cards
Light Green (Accent):           #A8D5A2  →  soft backgrounds, chips
Surface White:                  #FFFFFF  →  card backgrounds, main bg
Surface Gray:                   #F2F2F2  →  inactive buttons, secondary cards
Dark Text:                      #111111  →  headings
Medium Gray Text:               #6B6B6B  →  subtitles, labels
Icon Gray:                      #9E9E9E  →  inactive icons
Black Overlay:                  rgba(0,0,0,0.35) →  image overlays
Bottom Nav BG:                  #FFFFFF  →  with subtle shadow
```

### Typography (DO NOT CHANGE)
- Keep existing font setup from auth pages
- Headings: Bold, large, tight letter-spacing (as in "Plan Your Journey")
- Subheadings: SemiBold
- Body / Labels: Regular, muted color

### Spacing & Border Radius
```
Card radius:        18px
Button radius:      16px
Pill/Chip radius:   100px
Grid gap:           12px
Section padding:    20px horizontal
Card shadow:        0 2px 8px rgba(0,0,0,0.07)
```

---

## 📱 PERFORMANCE RULES (Lightweight & Fast)

- Use `FlatList` (not ScrollView) for all lists — horizontal and vertical
- `React.memo()` on all card components
- `useCallback` for all event handlers
- `FastImage` for all remote images (or `Image` with `resizeMode="cover"`)
- Skeleton loading placeholders (no spinners)
- Lazy load sections below the fold
- No heavy animation libraries — use `Animated` API or `react-native-reanimated` only where needed
- `keyExtractor` always defined
- `initialNumToRender={4}` on all FlatLists
- `removeClippedSubviews={true}` on all lists

---



## 📄 PAGE-BY-PAGE BUILD SPEC

---

### PAGE 1: HOME SCREEN (`HomeScreen.tsx`)

**Layout (top to bottom, exact to reference image):**

#### Section A — Top Bar
```
Row: space-between
  Left:  Greeting text
         "Good Morning, [FirstName]"  → gray, small
         "Plan Your Journey"          → black, bold, 26px
  Right: Bell icon button (with red dot badge if notifications > 0)
         Circular, light gray bg
```

#### Section B — Quick Access Grid (2×2)
```
4 cards in 2-column grid, equal size
Card 1 (Green/Primary): "Book Your Tour"    + bus icon   → bg: #4CAF50, text: white
Card 2 (Gray):          "Medical Visit"     + stethoscope → bg: #F2F2F2, text: #111
Card 3 (Gray):          "NRI Concierge"     + people icon → bg: #F2F2F2, text: #111
Card 4 (Gray):          "AI Trip Planner"   + brain/AI icon → bg: #F2F2F2, text: #111

Each card:
  - height: 100px
  - borderRadius: 18
  - icon: circular bg (white/gray), centered-left
  - label: bold, 15px, multiline allowed
  - onPress: navigate to respective screen
  - shadow: subtle
```

#### Section C — Travel Packages Row
```
Header: "Travel Packages" (bold left) + "See All" (green, right, small)

Horizontal FlatList, cards:
  Width: 180px, height: 220px
  Top 65%: image (cover)
  Bottom 35%: white bg
    - Package title (bold, dark)
    - Arrow button (top-right: small circular, white bg, diagonal arrow icon)
  borderRadius: 18
  shadow: light
```

#### Section C2 — Trending Experiences (optional, below packages)
```
Same horizontal FlatList pattern
Chips: "Houseboat", "Ayurveda", "Trekking", "Beach", "Luxury"
Scrollable pill tags, green active / gray inactive
```

#### Bottom Tab Bar (Persistent)
```
5 tabs (icons only + label):
  [Home]  [Explore]  [Packages]  [Bookings]  [Profile]

Active tab: green circle bg around icon
Inactive: gray icon, no bg
Background: white, top shadow
Height: 70px, safe area padding bottom
```

---

### PAGE 2: EXPLORE SCREEN

**Layout:**
- Search bar at top (rounded, gray bg, search icon)
- Filter chips row: "All", "Beach", "Hill", "Ayurveda", "Luxury", "Budget"
- Section: "Kerala Destinations" → 2-column grid of destination cards
  - Card: image (top 60%), name + region label, bookmark icon
- Section: "Experiences" → horizontal scroll

---

### PAGE 3: PACKAGES LISTING SCREEN

**Layout:**
- Screen header: "Tour Packages"
- Filter bar: Duration | Budget | Type | Rating (horizontal pills)
- Vertical FlatList of PackageCards:
  - Full-width image (180px height)
  - Title, duration, price, rating stars
  - "View Details" button (green, outline or filled)

---

### PAGE 4: PACKAGE DETAIL SCREEN

**Layout:**
- Hero image (top 40% of screen)
- Back button overlay (top-left)
- Save/bookmark icon (top-right)
- Scrollable content:
  - Title + rating
  - Price breakdown (chip-style)
  - Day-wise itinerary (expandable accordion)
  - Hotel + transport info
  - Reviews section
- Fixed bottom: "Book Now" button (full green)

---

### PAGE 5: AI TRIP PLANNER SCREEN

**Layout:**
- Header: "AI Trip Planner" + subtitle
- Large text input: "Where do you want to go? Describe your dream trip..."
- Preference controls:
  - Days slider (1–14)
  - Budget slider (low / medium / high)
  - Travel type chips: Solo, Couple, Family, Group
- "Generate My Plan" button (green, full-width, with sparkle icon)
- Loading state: animated pulsing card skeletons

---

### PAGE 6: AI RESULT SCREEN

**Layout:**
- "Your AI Plan" header + share/save icons
- Generated trip title (e.g., "5-Day Kerala Wellness Journey")
- Day-by-day itinerary cards (collapsible)
  - Each day: icon, date, activities list
  - "Replace Activity" button (outline, small)
- "Book Entire Plan" → green, full-width, sticky bottom

---

### PAGE 7: MEDICAL HOME SCREEN

**Layout:**
- Header: "Medical Visit"
- 3 large cards: "Doctor Consultation" / "Treatment Packages" / "Hospital Booking"
- Specialties horizontal scroll: Cardiology, Ayurveda, Orthopedics, Oncology...
- Featured hospitals row (horizontal)

---

### PAGE 8: HOSPITAL / DOCTOR LISTING

- Search + filters (specialty, city, rating)
- Vertical list of HospitalCards:
  - Logo / image, name, location, rating, specialties chips

---

### PAGE 9: MEDICAL REQUEST FORM

- Text area: "Describe your symptoms or medical requirement"
- File upload button (reports)
- Preferred hospital dropdown
- Travel assistance toggle
- Submit button

---

### PAGE 10: MEDICAL BOOKING DETAIL

- Doctor/hospital info header
- Appointment slot picker (calendar grid)
- Estimated cost breakdown
- Stay package option toggle
- Coordinator contact card
- "Confirm Booking" button

---

### PAGE 11: NRI CONCIERGE HOME

- Greeting: "How can we help you today?"
- Service categories grid (2×3):
  Medical | Property | Travel | Documents | Emergency | Legal
- Recent requests list
- "New Request" FAB (green floating button)

---

### PAGE 12: NRI REQUEST FORM

- Category auto-filled or selectable
- Description textarea
- Location in Kerala (dropdown/map picker)
- Urgency: Normal / Urgent / Emergency (radio)
- File attachment
- Submit

---

### PAGE 13: TICKET TRACKING SCREEN

- Active tickets list
- Each ticket:
  - ID, category, date
  - Status indicator: Received → In Progress → Completed (step bar)
  - "Message Agent" button
- Empty state if no tickets

---

### PAGE 14: BOOKINGS SCREEN (Unified)

- Tabs: "Tours" | "Medical" | "Concierge"
- Each tab: FlatList of booking cards
  - Status badge (Confirmed / Pending / Completed / Cancelled)
  - Date, title, reference ID
  - "View Details" link

---

### PAGE 15: SAVED TRIPS / WISHLIST

- Tabs: "Packages" | "AI Plans" | "Destinations"
- Grid of saved items with remove (heart/bookmark) button

---

### PAGE 16: NOTIFICATIONS SCREEN

- Grouped by: Today / This Week / Earlier
- Each item: icon (type), title, time, read/unread dot
- Tap to navigate to relevant screen

---

### PAGE 17: HELP & SUPPORT

- Search bar (FAQs)
- Categories: Booking Issues | Medical | Payments | Account
- FAQ accordion list
- "Chat with Support" button (green)
- Emergency contact card (for medical users)

---

### PAGE 18: SETTINGS SCREEN

- Account section: name, email, phone
- Preferences: Language | Currency | Theme toggle
- NRI Status toggle (with explanation tooltip)
- Privacy & Terms links
- Sign Out (red text)

---

## ⚙️ BOTTOM TAB NAVIGATOR SPEC

```tsx
// navigation/BottomTabBar.tsx

Tabs:
  1. Home       → HomeStack     → house icon
  2. Explore    → ExploreStack  → search/compass icon
  3. Packages   → PackagesStack → grid/calendar icon
  4. Bookings   → BookingsStack → receipt/card icon
  5. Profile    → ProfileStack  → person icon

Active state:  icon inside green circle (#4CAF50), label green
Inactive state: gray icon, gray label
Tab bar: white bg, top border: 1px #EEEEEE, height: 60px + safe area
```

---

## 🔗 NAVIGATION FLOW MAP

```
App Entry → BottomTabNavigator
  │
  ├── Home
  │     ├── Book Your Tour    → PackagesScreen
  │     ├── Medical Visit     → MedicalHomeScreen
  │     ├── NRI Concierge     → NRIHomeScreen
  │     ├── AI Trip Planner   → AIPlannerScreen
  │     ├── Package card tap  → PackageDetailScreen
  │     └── See All           → PackagesScreen
  │
  ├── Explore
  │     ├── Destination tap   → PackageDetailScreen (filtered)
  │     └── Experience tap    → PackagesScreen (filtered)
  │
  ├── Packages
  │     └── Card tap          → PackageDetailScreen
  │           └── Book Now    → (Booking flow / payment)
  │
  ├── AI Planner
  │     └── Generate          → AIPlanResultScreen
  │           └── Book Plan   → (Booking flow)
  │
  ├── Medical
  │     ├── Hospital list     → HospitalListScreen
  │     ├── Request form      → MedicalRequestScreen
  │     └── Booking detail    → MedicalBookingScreen
  │
  ├── NRI
  │     ├── Request form      → NRIRequestScreen
  │     └── Ticket tracking   → TicketTrackingScreen
  │
  └── Bookings (unified tab)
        ├── Tours tab
        ├── Medical tab
        └── Concierge tab
```

---

## 🧱 REUSABLE COMPONENT SPEC

### `PackageCard` (used in Home + Packages)
```tsx
Props: { image, title, price, duration, rating, onPress }
Size: width=180 (horizontal) OR fullWidth (vertical list)
Image: top 65%, cover fit
Footer: title bold, price green, arrow icon
Radius: 18, shadow: light
```

### `QuickAccessCard` (Home 2×2 grid)
```tsx
Props: { label, icon, isActive, onPress }
Active (green): bg=#4CAF50, text=white, iconBg=rgba(255,255,255,0.3)
Inactive (gray): bg=#F2F2F2, text=#111, iconBg=white
Size: flex:1 in 2-column row, height=100
```

### `SkeletonCard`
```tsx
Animated pulse using Animated.loop
Gray rectangles matching card shape
Used during loading state of all FlatLists
```

### `SectionTitle`
```tsx
Props: { title, ctaLabel?, onCta }
Row: title (bold, left) + CTA text (green, right)
```

---

## 📌 IMPLEMENTATION NOTES

1. **State Management**: Use Zustand for global state (user, bookings, saved items)
2. **API**: Axios with interceptor for auth token injection
3. **Images**: Use `expo-image` or `react-native-fast-image` for performance
4. **AI Planner**: Call backend which wraps Claude/GPT API — stream response to UI
5. **Forms**: `react-hook-form` + `zod` for validation
6. **Date/Calendar**: `react-native-calendars` for booking date pickers
7. **Maps**: Optional `react-native-maps` for destination/hospital map view
8. **OTP / Auth**: Already built — connect via token in AsyncStorage/SecureStore
9. **Currency**: Store preferred currency in user profile, convert in display layer
10. **Offline**: Cache last-fetched packages and bookings for offline view

---

## ✅ BUILD ORDER (Recommended)

```
Phase 1 (Core UX):
  → HomeScreen (exact to reference image)
  → BottomTabNavigator
  → PackagesScreen + PackageDetailScreen
  → ExploreScreen

Phase 2 (AI Feature):
  → AIPlannerScreen
  → AIPlanResultScreen

Phase 3 (Medical):
  → MedicalHomeScreen
  → HospitalListScreen
  → MedicalRequestScreen + MedicalBookingScreen

Phase 4 (NRI + Utility):
  → NRIHomeScreen + NRIRequestScreen + TicketTrackingScreen
  → BookingsScreen (unified)
  → SavedTripsScreen
  → NotificationsScreen
  → SupportScreen + SettingsScreen
```

---

*Generated for: Kerala Tourism + Medical + NRI App — Shahr*
*Auth system: Already complete — build from HomeScreen onwards*