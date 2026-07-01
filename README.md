# craftr — Your AI Co-Founder

Every AI startup tool today does the same thing: you click a button, it generates text. Market analysis? A wall of prose. Financial model? A paragraph describing one. Website? A static HTML file sitting in a box.

**craftr is different. It's not a generator; it's a co-founder.**

craftr is the world's first AI co-founder that works full-time on your startup while you sleep, eat, and live your life. It doesn't just generate documents — it continuously builds, monitors, adapts, and executes across every dimension of your business.

## The Vision

- **Persistent Background Agents**: Live agents that run on a schedule to monitor competitors, track industry news, and alert you to threats and opportunities.
- **Real Deliverables**: Actual Google Sheets with formulas, investor-ready pitch decks (PDF), and live domain availability checks. Not just text descriptions.
- **Persistent Memory**: A living knowledge graph of your startup. The AI cross-references earlier decisions and understands your market context.
- **Daily Co-Founder Briefing**: A concise morning digest email covering overnight AI work, market news, competitor movements, and your financial runway.
- **Customer Discovery Engine**: Finding real people on Reddit/Twitter with pain points, synthesizing them into an Ideal Customer Profile (ICP), and drafting outreach messages.
- **Real Financial Operations**: Expense tracking, scenario modeling, burn rate alerts, and revenue milestones.

## Architecture

craftr is built on a modern, robust tech stack:

- **Framework**: Next.js 16 (App Router) with React 19
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth)
- **Styling**: Tailwind CSS & Framer Motion for premium, dynamic animations
- **AI Integration**: Custom agent orchestrator running specialized roles (Market Analyst, Financial Analyst, Tech Architect, etc.)
- **Payments**: Stripe integration (Free, Pro, and Ultra tiers)
- **Email & Cron**: Resend for transactional emails, Vercel Cron for scheduled agent tasks

## Phased Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] **Startup Toolkit**: Real deliverables instead of JSON blobs
- [x] **Financial Model**: Generates an `.xlsx` file with real formulas for MRR, ARR, and Costs
- [x] **Pitch Deck**: Generates an 11-slide HTML pitch deck (printable to PDF) using brand guidelines
- [x] **Domain Checker**: Live RDAP checks for `.com`, `.io`, `.ai`, etc.
- [x] **Daily Briefings**: Vercel Cron job that synthesizes a morning email report via Resend

### Phase 2: Always On (In Progress)
- [ ] **Scheduled background agent jobs**: Competitor monitoring and market news tracking
- [ ] **Persistent startup memory**: Building a knowledge graph of decisions to prevent AI hallucination and contradictions
- [ ] **Live company dashboard**: Command center with a live runway meter and agent activity feed
- [ ] *Deferred: Deployed website on a `craftr.app` subdomain*

### Phase 3: Execution Layer (Upcoming)
- [ ] **Customer discovery engine**: Scraping real social platforms (Reddit/LinkedIn) for pain points
- [ ] **Investor radar**: Finding relevant VC/Angels and drafting personalized cold emails
- [ ] **Financial Operations**: Plaid integration for real expense tracking against projected burn
- [ ] **Human-in-the-loop approval queue**: One-click approvals for AI-proposed actions (e.g., sending cold emails, deploying A/B tests)

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Set up your `.env.local` with Supabase, Stripe, and Resend keys
4. Run `npm run dev` to start the development server
