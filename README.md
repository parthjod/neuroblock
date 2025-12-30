# NeuroBlock

This is a Next.js application for AI-assisted physical therapy with blockchain-based progress tracking.

## Features

*   **Role-based Authentication:** Users can sign up and log in as either a "Patient" or a "Neurologist".
*   **Patient Portal:** Patients have a dedicated portal to manage their profile and data sharing preferences.
*   **Data Visibility Control:** Patients can control whether their data is visible to neurologists.
*   **Neurologist Selection:** Patients can choose which neurologists are able to view their data.
*   **Dynamic Neurologist Dashboard:** The neurologist dashboard dynamically displays data from patients who have granted them access.
*   **Database:** The application uses Prisma ORM with a SQLite database to persist all data.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up the database:**
    Create a `.env` file in the `studio` directory and add the following:
    ```
    DATABASE_URL="file:./dev.db"
    ```
    Then run the following command to create the database and the tables:
    ```bash
    npx prisma migrate dev --name init
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

## How to Use

1.  **Sign up:** Navigate to `http://localhost:9002/signup` and create an account as either a "Patient" or a "Neurologist".
2.  **Log in:** Navigate to `http://localhost:9002/login` and log in with your credentials.
3.  **Patient Portal:** If you are a patient, you will be redirected to the patient portal. Here you can:
    *   Add or update your personal and medical information.
    *   Toggle the visibility of your data.
    *   Select the neurologists who can view your data.
4.  **Neurologist Dashboard:** If you are a neurologist, you will see the main dashboard. This dashboard will display a list of patients who have selected you as their neurologist and have made their data visible.