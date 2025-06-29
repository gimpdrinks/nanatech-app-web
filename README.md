# Nanatech - Voice AI Reminder Assistant

![Nanatech Logo](public/Nanatech%20Lola.png)

A compassionate voice-activated reminder application designed to empower seniors and provide peace of mind for their families.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup (Supabase)](#database-setup-supabase)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

Nanatech offers a suite of features tailored for ease of use and reliability:

-   **Voice-Activated Reminders**: Seamlessly create reminders using natural voice commands, powered by ElevenLabs AI.
-   **Comprehensive Reminder Management**: Set one-time or recurring reminders (daily, weekly, monthly, yearly) for medications, appointments, bills, and more.
-   **Emergency Contact System**: Users can add trusted emergency contacts who can be notified in critical situations.
-   **User Authentication & Profiles**: Secure user login and personalized profiles managed via Supabase.
-   **Multi-language Support**: Supports English and Taglish (Filipino + English) for a more localized experience.
-   **Light/Dark Theme Toggle**: Customize the app's appearance to suit individual preferences and improve accessibility.
-   **Interactive Tutorials**: Built-in video tutorials to guide users through key functionalities and common online tasks (e.g., paying bills).
-   **Responsive User Interface**: Designed with Tailwind CSS to ensure a consistent and accessible experience across various devices.

## Technologies Used

-   **Frontend**:
    -   [React](https://react.dev/) (v18.3.1) - A JavaScript library for building user interfaces.
    -   [TypeScript](https://www.typescriptlang.org/) (v5.5.3) - A typed superset of JavaScript that compiles to plain JavaScript.
    -   [Vite](https://vitejs.dev/) (v5.4.2) - A fast build tool for modern web projects.
    -   [React Router DOM](https://reactrouter.com/en/main) (v6.20.1) - For declarative routing in React applications.
-   **Styling**:
    -   [Tailwind CSS](https://tailwindcss.com/) (v3.4.1) - A utility-first CSS framework for rapid UI development.
-   **Icons**:
    -   [Lucide React](https://lucide.dev/icons/) (v0.344.0) - A collection of beautiful and customizable SVG icons.
-   **Backend & Database**:
    -   [Supabase](https://supabase.com/) (v2.39.0) - An open-source Firebase alternative providing PostgreSQL database, authentication, and Row Level Security (RLS).
-   **Voice AI**:
    -   [ElevenLabs API](https://elevenlabs.io/) - For advanced text-to-speech and voice AI agent capabilities.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/en/) (LTS version recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)
-   A [Supabase account](https://supabase.com/dashboard/sign-up) and a new project set up.
-   An [ElevenLabs account](https://elevenlabs.io/) and an API key, along with an AI agent ID.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/nanatech-voice-assistant.git
    cd nanatech-voice-assistant
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Environment Variables

Create a `.env` file in the root of your project based on the `.env.example` file and fill in your credentials:
Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

ElevenLabs Configuration (optional - will use browser TTS as fallback)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

ElevenLabs Agent Configuration
VITE_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id



### Database Setup (Supabase)

1.  **Create Tables**: Use the provided schema information to create the necessary tables in your Supabase project. The key tables are `profiles`, `reminders`, `emergency_contacts`, and `tutorials`.
    -   `profiles`: Stores user profile information (`id`, `full_name`, `language`, `updated_at`, `theme`).
    -   `reminders`: Stores user reminders (`id`, `user_id`, `type`, `title`, `description`, `photo_url`, `reminder_time`, `is_completed`, `is_recurring`, `recurrence_pattern`, `recurrence_data`, `end_recurrence_date`, `created_at`).
    -   `emergency_contacts`: Stores emergency contact details for users (`id`, `user_id`, `name`, `relationship`, `phone_number`).
    -   `tutorials`: Stores tutorial content (`id`, `title`, `description`, `steps`, `duration`, `image_url`, `category`, `icon_name`, `created_at`, `updated_at`).

2.  **Configure Row Level Security (RLS)**: Ensure RLS policies are set up correctly for each table to restrict data access based on user authentication. For example, users should only be able to read, insert, update, or delete their own `profiles`, `reminders`, and `emergency_contacts`. `tutorials` can be publicly readable.

3.  **Run the application:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:5173`.

## Project Structure

nanatech-voice-assistant/
├── public/
│   └── Nanatech Lola.png       # Application logo
├── src/
│   ├── App.tsx                 # Main application component and routing
│   ├── main.tsx                # Entry point for React app
│   ├── index.css               # Tailwind CSS entry point
│   ├── components/             # Reusable UI components
│   │   ├── ElevenLabsVoiceAgent.tsx
│   │   ├── Layout.tsx
│   │   └── ReminderCard.tsx
│   ├── contexts/               # React Contexts for global state (Auth, Theme)
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                  # Custom React hooks
│   │   └── useReminderScheduler.ts
│   ├── lib/                    # Utility functions (Supabase client, ElevenLabs TTS)
│   │   ├── elevenlabs.ts
│   │   └── supabase.ts
│   ├── pages/                  # Application pages
│   │   ├── AuthPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── RemindersPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── TutorialsPage.tsx
│   │   └── VoicePage.tsx
│   └── types/                  # TypeScript type definitions
│       └── reminders.ts
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── package.json                # Project dependencies and scripts
└── README.md                   # This file



## Deployment

This application can be easily deployed to platforms like Netlify. The current setup is compatible with Netlify's continuous deployment from a GitHub repository.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
