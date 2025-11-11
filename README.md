# College Mastermind - Student Registration Platform

A full-stack Next.js application for student registration and admin management, built with MongoDB integration.

## Features

### Student Registration
- Multi-step registration form (4 steps)
- Student information collection
- Parent/guardian information
- Academic profile and preferences  
- Form validation and error handling

### Admin Dashboard
- Interactive analytics dashboard
- Student data management
- Registration status tracking 
- Data export functionality
- Real-time statistics and charts

### Technical Features
- **Frontend**: Next.js 15 with App Router
- **Database**: MongoDB with Mongoose
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Notifications**: Sonner for toast messages
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (connection string included)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd asia-fest
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── register/           # Student registration
│   ├── api/               # API routes
│   └── (auth)/            # Authentication pages
├── components/
│   ├── admin/             # Admin dashboard components
│   ├── registration/      # Registration form components
│   ├── shared/           # Shared components (navbar, footer)
│   └── ui/               # Reusable UI components
├── lib/
│   └── mongodb.js        # Database connection
└── models/
    └── Student.js        # Student data model
```

## API Endpoints

### Students
- `POST /api/students` - Create new student registration
- `GET /api/students` - Get students with pagination and filters
- `GET /api/students/[id]` - Get specific student
- `PATCH /api/students/[id]` - Update student status
- `DELETE /api/students/[id]` - Delete student

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

The Student model includes:
- Student Information (name, email, phone, school, graduation year, gender)
- Parent Information (contact details, address)
- Academic Information (GPA, course rigor, university preferences)
- Additional Questions (stressors, concerns, registration code)
- Metadata (submission date, status)

## Key Pages

1. **Home** (`/`) - Automatically redirects to registration page
2. **Registration** (`/register`) - Multi-step student registration form (no navbar/footer)
3. **Admin Dashboard** (`/admin`) - Secured admin panel with login protection
4. **Admin Login** - Built into admin dashboard (email/password authentication)

## Admin Features

- **Secure Authentication**: Email/password login system with JWT tokens
- **Protected Routes**: Admin panel requires authentication
- **Overview Dashboard**: Statistics, charts, and metrics
- **Student Management**: View, filter, and manage registrations
- **Status Updates**: Track student progress (pending, reviewed, contacted)
- **Data Export**: Export student data to CSV
- **Search & Filter**: Find students by name, school, or status
- **Session Management**: Secure logout and session handling

### Default Admin Credentials
- **Email**: admin@collegemastermind.com
- **Password**: admin123

## Form Validation

The registration form includes comprehensive validation:
- Required field validation
- Email format validation
- GPA range validation (0.0 - 4.0)
- Graduation year validation
- Real-time error feedback

## Deployment

The application is ready for deployment on platforms like:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- Any platform supporting Node.js

Make sure to set the `MONGODB_URI` environment variable in your deployment platform.

## Environment Variables

Create a `.env.local` file with:
```
MONGODB_URI=your_mongodb_connection_string
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **MongoDB** - Database with Mongoose ODM
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Recharts** - Chart library for dashboard analytics
- **Sonner** - Toast notification system
- **Lucide React** - Icon library

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License


This project is licensed under the MIT License.

