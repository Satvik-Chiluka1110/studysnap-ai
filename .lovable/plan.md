
## StudySnap AI — Implementation Plan

### Overview
A modern AI-powered study assistant where students paste text or upload PDFs, click "Generate," and get four AI-generated outputs: explainer video (image slideshow + browser TTS), summary, key points, and flashcards/quiz. Data stored in localStorage. Purple & teal theme with Inter font.

### Design System
- **Colors**: Purple primary (`#7C3AED`), teal accent (`#14B8A6`), dark background (`#1E1B4B`), light surface (`#F5F3FF`)
- **Font**: Inter (Google Fonts)
- **Style**: Clean, modern, card-based UI with rounded corners and subtle shadows

### Pages & Routing
1. **Dashboard (`/`)** — Hero section with "New Session" CTA, past sessions as cards (title, date, preview snippet), quick stats
2. **New Session (`/session/new`)** — Text input area + PDF upload, "Generate" button, progress bar during AI processing
3. **Session View (`/session/:id`)** — Tabbed output panel (Video, Summary, Key Points, Flashcards), copy/export-to-PDF buttons on each tab
4. **History (`/history`)** — Full list of past sessions with search/filter, delete option

### Core Features

**1. Content Input**
- Large textarea for pasting text
- PDF upload with client-side parsing using `pdfjs-dist` for text extraction (handles multi-page PDFs)
- Character/page count display

**2. AI Generation Pipeline (Lovable AI via Edge Function)**
- Single edge function that takes raw content and returns all outputs in one call (or sequential calls with progress updates):
  - Plain-language summary
  - 8–10 numbered key points
  - 10–12 Q&A flashcard pairs
  - Narration script + auto-extracted keywords for image search
- Progress status bar showing each generation step

**3. Explainer Video Tab**
- Fetch images from Unsplash API (free tier) based on AI-extracted keywords
- Slideshow player: auto-advances images synced with browser TTS narration
- Play/pause controls, progress indicator
- "Download Video" button — records the slideshow + audio via MediaRecorder API and exports as WebM

**4. Summary Tab**
- Rendered markdown summary with copy button and export-to-PDF

**5. Key Points Tab**
- Numbered list, each point in a card, copy and export-to-PDF

**6. Flashcards Tab**
- Card UI with "Reveal Answer" toggle per card
- Quiz Mode: sequential questions, user types/selects answer, shows score at end
- Copy all and export-to-PDF

**7. Data Persistence (localStorage)**
- Each session stored with: id, title, date, raw content, summary, key points, Q&A pairs, narration script, image URLs
- Dashboard and History pages read from localStorage

**8. Export & Utility**
- Copy to clipboard on all output tabs
- Export to PDF using browser print or `jspdf` library
- Video download as WebM via MediaRecorder

### Technical Stack
- React + TypeScript + Tailwind CSS + shadcn/ui
- Lovable Cloud edge function for AI generation
- `pdfjs-dist` for PDF text extraction
- Unsplash API (public access) for images
- Browser SpeechSynthesis API for narration
- MediaRecorder API for video download
- localStorage for session persistence

### Mobile Responsive
- Single-column layout on mobile, tabs stack or become scrollable
- Touch-friendly flashcard interactions
- Collapsible sidebar/nav on small screens
