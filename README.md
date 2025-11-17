# Minimalist App Suite

A clean, minimalist web application for managing your life across multiple sections.

## Features

### Expenses Tracker
- Add and track expenses by category
- View spending dashboard with statistics
- Browse transaction history
- Visual charts for spending analysis

### Reminders
- Create multiple reminder lists
- Add reminders with due dates and relevance levels
- Mark reminders as complete
- Organize tasks by importance

### Habit Tracker
- Add daily, weekly, or monthly habits
- Track completion with visual indicators
- Monitor streaks for motivation
- Simple one-click habit logging

### Notes
- Create and organize text notes
- Quick access to your notes
- Edit and update notes anytime
- Automatic timestamp tracking

## Getting Started

1. **Set up the database**: Run the database schema script from `/scripts/001_create_schema.sql`
   - Click the execute button in v0 to run the migration

2. **Authentication**: 
   - Sign up for a new account
   - Confirm your email
   - Log in to access the app

3. **Using the App**:
   - Mobile: Use the bottom navigation to switch between sections
   - Desktop: Use the top navigation bar
   - All data is securely stored with Supabase

## Tech Stack

- Next.js 16 with App Router
- Supabase for authentication and database
- shadcn/ui for components
- Tailwind CSS for styling
- Recharts for data visualization

## Data Privacy

All data is encrypted and protected by Supabase Row Level Security (RLS). Only you can access your own data.
