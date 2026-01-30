# 🛡️ Right Tutor Admin Dashboard

The mission control center for Right Tutor. A high-performance, real-time administrative interface for managing inquiries, consultations, and tutor matches.

## 📊 Administrative Modules

### 1. Unified Inbox
- Real-time parent inquiries fetched via Socket.io.
- **AI Analysis**: One-click analysis of messages to generate summaries and professional draft replies.

### 2. Consultation Registry
- Manage student bookings and consultation schedules.
- Full CRUD operations synced instantly with Google Sheets.

### 3. Match Pipeline
- Specialized "Manual Matching" module for complex tutor-student pairings.
- Pipeline status tracking (Trial Pending → Assigned → Dropped).

### 4. Node Management (Repositories)
- Provision and manage "Data Repositories" (Google Sheets integration points).
- Dynamic linking of sheet URLs to specific system modules.

---

## 🛠️ Internal Architecture

- **State Management**: Redux Toolkit for consistent global state across the dashboard.
- **Real-time Sync**: Socket.io integration via `socketService.ts` to receive instant updates.
- **AI Integration (v1.1)**: Enhanced "Analyst Mode" with **Full Database Access**.
    - The AI now receives cached snapshots of the *entire* Contacts, Bookings, and Matches tables.
    - Enables deep queries like "Show me all physics inquiries from last week" directly from the dashboard.
- **Theming**: Dark mode optimized "SaaS-style" interface with glassmorphic cards.

## ⚡ Performance Engineering (v1.1)
- **Build Optimization**: Configured `manualChunks` to split React, Redux, and UI libraries into separate cacheable files.
- **Backend Sync**: Leverages the new "Smart Caching" layer in the backend for 99% faster stat retrieval.

---

## 📁 Project Structure

- `src/pages/`: Specialized admin views (AiAssistant, AppointmentDetails, ContactInquiries, ManualMatching, Repositories).
- `src/store/`: Redux slices for admin data, logging, and user state.
- `src/services/`: API and Socket integration layers.
- `src/components/`: Admin-specific UI components (StatCards, ModalOverlays).

---

## ⚡ Deployment & Configuration

Designed to be hosted alongside the backend/main site.

**Environment Variables**:
```ini
VITE_API_BASE_URL=https://your-api.com
```

**Development**:
```bash
npm install
npm run dev
```

---

## 🔒 Security
- **JWT Protection**: All requests routed through `apiService.ts` include Bearer tokens.
- **Protected Routes**: Navigation is gated by authentication state managed in Redux.
