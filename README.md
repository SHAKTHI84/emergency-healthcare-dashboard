# Emergency Healthcare Dashboard

A comprehensive healthcare management system for handling emergency situations and patient information.

## Features

### Emergency Management
- Report emergencies with detailed information
- "Emergency CRISIS" button for urgent situations
- View and manage emergency reports in real-time
- Bulk selection and deletion of emergency reports
- Filter and sort emergency reports
- Status updates (pending, in progress, completed)

### Patient Management
- Patient profiles with personal details
- Medical history tracking
- Health metrics monitoring
- Secure patient data management

### Healthcare Provider Portal
- Comprehensive dashboard for healthcare professionals
- Patient details editing
- Emergency response coordination
- Medical history management

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- A Supabase account with URL and API keys

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Initialize the database:
```bash
npm run init-db
```

5. Start the development server:
```bash
npm run dev
```

## Database Setup

The application uses Supabase for database operations. The database schema includes:

### Tables
- `patients`: Stores patient information including medical history and health metrics
- `emergencies`: Stores emergency reports with location, type, and status

### Database Initialization
The database can be initialized in three ways:

1. Automatically when the application starts (client-side)
2. Using the `npm run init-db` command (server-side)
3. Directly executing the SQL in `utils/database.sql`

## Usage

### Reporting Emergencies
- Navigate to the emergency report page
- Fill in details or use the CRISIS button for urgent situations
- Your location will be automatically detected if permission is granted

### Managing Emergencies (Healthcare Providers)
- View all emergencies on the healthcare dashboard
- Update status as situations progress
- Select multiple emergencies with checkboxes for bulk deletion
- Sort emergencies by creation time

### Managing Patients (Healthcare Providers)
- View and edit patient details
- Update medical history
- Track health metrics

## License
This project is licensed under the MIT License - see the LICENSE file for details.
