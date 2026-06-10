live link : https://glowreach-crm.onrender.com/






# GlowReach AI-Native CRM

GlowReach is a production-ready AI-Native Marketing CRM for a Beauty & Fashion Brand inspired by Xeno's customer engagement platform. It helps marketers manage customer databases, parse natural language to construct targeting segments, write engaging marketing campaigns using AI, simulate delivery lifecycles, and view engagement metrics in real-time.

---

## 1. System Architecture

The CRM is built as a three-tier decoupled service:

* **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts. Operates on `http://localhost:3000`.
* **Backend**: Node.js, Express, TypeScript, Prisma ORM, Gemini API SDK. Operates on `http://localhost:5000`.
* **Stub Channel Service**: Node.js, Express. Simulates communication lifecycle callbacks. Operates on `http://localhost:5001`.

```
  Next.js Frontend (Port 3000) 
         ▲
         │ (HTTP REST API Queries)
         ▼
   Express Backend (Port 5000) <=====> Gemini API (AI Service)
         │               ▲
         │ (Prisma)      │ (HTTP Callback receipt)
         ▼               │
    SQLite / Postgres   Stub Channel Service (Port 5001)
```

---

## 2. Installation & Setup

Ensure you have **Node.js v20+** installed.

### Step 1: Install Dependencies
Run this in the root workspace directory (`xeno/xeno`):
```bash
# Install root/workspace runner packages
npm install

# Install backend packages
cd backend && npm install

# Install frontend packages
cd ../frontend && npm install

# Install channel service packages
cd ../stub-channel-service && npm install
```

### Step 2: Configure Environment Variables
Create or adjust the `.env` files in each service.

**Backend (`backend/.env`):**
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/xeno_crm?schema=public"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
CHANNEL_SERVICE_URL="http://localhost:5001/send"
```
*(Get a free key from [Google AI Studio](https://aistudio.google.com/))*

**Frontend (`frontend/.env`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Stub Channel Service (`stub-channel-service/.env`):**
```env
PORT=5001
CRM_CALLBACK_URL=http://localhost:5000/receipts
```

---

## 3. Database Management & Dual Mode (PostgreSQL / SQLite)

By default, Prisma compiles for a **PostgreSQL** datasource. 

Since local development environments might lack a running PostgreSQL database, we provide a **Dual-Mode Switch Utility** to seamlessly switch between PostgreSQL (production) and SQLite (instant local fallback).

To switch to **SQLite**:
```bash
cd backend
node scripts/switch-db.js sqlite
```

To switch to **PostgreSQL**:
```bash
cd backend
node scripts/switch-db.js postgresql
```

### Apply Schema & Seed Database
After choosing your database provider, run:
```bash
# Push schema structure to database
npx prisma generate
npx prisma db push

# Seed 1000 Customers, 120 Products, 5000 Orders
npm run prisma:seed
```

---

## 4. Run the Application

You can start the frontend, backend, and channel services simultaneously using the root launcher script:

From the root workspace directory (`xeno/xeno`), run:
```bash
npm run dev
```

The terminal will launch all three services concurrently:
* Frontend client: `http://localhost:3000`
* Backend API: `http://localhost:5000`
* Stub Channel Service: `http://localhost:5001`

---

## 5. Core Feature Workflow Walkthrough

### Feature 1: AI Audience Builder
1. Navigate to **AI Audience Builder**.
2. Type a target request in the input box, e.g., *"Find customers who spent more than 4000 on Skincare and have not purchased in 30 days."*
3. Press **Compile Audience**. The Gemini AI parses the prompt into:
   ```json
   { "category": "Skincare", "minSpend": 4000, "inactiveDays": 30 }
   ```
4. The database is queried in real-time, displaying the target size and a detailed customer list preview.

### Feature 2 & 3: Campaign Builder & Channel Recommendation
1. Click **Create Campaign** from the audience preview to pre-fill the segment.
2. Supply a marketing objective (e.g., *"Promote our top-selling Vitamin C Serum with a 15% discount code 'GLOW15' to boost loyalty"*).
3. Click **Generate AI Proposal**. 
4. The AI copywriter returns:
   - Catchy Campaign Title (e.g., *"Glow Reclaim: Radiance Essentials"*)
   - Recommended Channel Choice (WhatsApp or Email) based on demographics
   - Copywriting Message using `{{name}}` variables
5. Click **Launch Delivery Simulation**.

### Feature 4: Stub Channel Lifecycle & Real-Time Analytics
1. Clicking **Launch** registers the campaign as running, generates unique `Communication` entries for each customer, and calls the Stub Channel Service.
2. The UI automatically redirects you to **Campaign Analytics**.
3. Select your campaign from the sidebar. You will see metrics (Sent, Delivered, Opened, Clicked, Failed) updating in real-time.
4. The simulator simulates delivery over time:
   - **At 2s**: Sends callback -> CRM status updates to `Delivered` (95%) or `Failed` (5%).
   - **At 5s**: Sends callback -> CRM status updates to `Opened` (70%).
   - **At 8s**: Sends callback -> CRM status updates to `Clicked` (25%).

### Feature 5: AI Campaign Copilot
1. Navigate to **Campaign Copilot**.
2. Open a chat dialogue with the bot (e.g., *"Help me target fashion buyers inactive for 45 days"*).
3. The AI Copilot detects the criteria, queries database records for an estimated match count, suggests a campaign copy, and displays an **interactive proposal card** right in the chat window.
4. Click **Quick Launch Campaign** from the card to deploy the campaign instantly!
