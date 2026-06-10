# Career Guide AI: Navigate Your Future with Intelligence

## Overview

**Career Guide AI** is a cutting-edge platform designed to empower professionals and students in their career journey. By leveraging advanced Artificial Intelligence, the platform provides personalized guidance, skill gap analysis, and interview preparation to help users unlock their full potential and navigate the ever-evolving job market.

## Key Features

### AI-Powered Profile & Assessment

- **Personalized Onboarding**: Tailored experience to capture your career aspirations and background.
- **Personality Assessments**: Intelligent mapping of your traits to suggest the best-fitting industries and roles.

### Intelligent Resume Subsystem

- **Smart Resume Builder**: Create professional, high-impact resumes with AI-assisted content suggestions.
- **Automated Parsing**: Extract and organize your work experience and education seamlessly from existing documents.
- **Template Management**: Choose from multiple professional templates designed for different career stages.

### Skill Gap & Market Insights

- **Market Analysis**: Stay ahead with real-time insights into career roles and market demand.
- **Skill Gap Reports**: Receive detailed reports identifying the specific skills you need to reach your target position.
- **Salary Benchmarking**: Access accurate salary data to ensure you are compensated fairly based on your skills and location.

### Personalized Learning Paths

- **Automated Growth Plans**: AI-generated learning paths focused on closing your specific skill gaps.
- **Curated Resources**: High-quality links to courses, certifications, and reading materials from top providers.
- **Progress Tracking**: Monitor your learning milestones as you move closer to your career goals.

### AI Interview Simulator

- **Role-Specific Simulations**: Practice with realistic interview scenarios tailored to specific job roles or listings.
- **Real-Time Feedback**: Get instant analysis of your answers with transcript-based feedback.
- **AI Scoring**: Detailed evaluation and targeted improvement suggestions to boost your confidence.

## Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/), [Tabler Icons](https://tabler-icons.io/)
- **Authentication**: [Better Auth](https://www.better-auth.com/) with Prisma Adapter
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/) (@google/generative-ai)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)

## 🚦 Getting Started

### Prerequisites

- Node.js (Latest LTS)
- PostgreSQL Database
- Google Gemini API Key

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd career-guide-ai
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following:

   ```env
   DATABASE_URL="your-postgresql-url"
   DIRECT_URL="your-postgresql-direct-url"
   BETTER_AUTH_SECRET="your-auth-secret"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
   ```

4. **Initialize Database:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
  - `(user-facing)/`: Public-facing pages (Landing, Login, Signup, Onboarding).
  - `(admin)/`: Core application dashboard and protected features.
- `components/`: Shared UI components (Shadcn + Custom).
- `lib/`: Utility functions, Prisma client, and Auth configuration.
- `prisma/`: Database schema and migrations.
- `public/`: Static assets and images.

---

Built with care for the future of career development.
