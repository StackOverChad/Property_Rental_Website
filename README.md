# Property Rental Website

This project is a comprehensive Property Rental & Sales Platform designed to connect landlords and tenants/buyers. Landlords can easily list their properties for rent or sale, providing details and images. Clients can browse these listings, filter by various criteria, and initiate contact to rent or purchase properties. The backend services, including user authentication, property data storage, and potentially real-time updates, are powered by Supabase, while the user interface is built with [React, Vue, Svelte with Vite and TypeScript].


## Prerequisites
- Node.js 
- npm or yarn
- Supabase CLI (if managing migrations/local dev with it): [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YourUsername/YourNewSupabaseRepoName.git
    cd YourNewSupabaseRepoName
    ```

2.  **Install frontend/backend dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Supabase Setup:**
    *   If you're using the Supabase CLI for local development:
        ```bash
        supabase init # If not already initialized in the project
        supabase start # Starts local Supabase services
        ```
    *   Link to your remote Supabase project (if applicable):
        ```bash
        supabase link --project-ref YOUR_PROJECT_REF
        # (Get YOUR_PROJECT_REF from your Supabase project's dashboard URL)
        ```
    *   Apply migrations (if you have them and are setting up a new local instance):
        ```bash
        supabase db reset # Resets local db and applies migrations
        # OR
        # supabase migration up
        ```

4.  **Environment Variables:**
    Create a `.env` file in the root of the project. Copy `.env.example` if you have one.
    It should contain your Supabase URL and Anon Key, and any other necessary variables:
    ```
    # Example for a Vite/React frontend connecting to Supabase
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

    # Example for a Node.js backend
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # Keep this secure!
    PORT=3001
    ```
    **IMPORTANT:** Ensure your actual `.env` file is listed in `.gitignore`.

## Running the Application

**Frontend **
```bash
npm run dev
# or
# yarn dev
```
## Backend
```bash
node server.js
# or
# npm run start:server 
```
## Key Technologies
1. Supabase 
2. Node.js
3. React
4. TypeScript
5. Vite / Tailwind CSS 
##Project Structure
1. src/: Frontend application source code
2. supabase/: Supabase project configuration, migrations, edge functions
