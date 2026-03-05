# Financial Reimbursement System

A comprehensive financial reimbursement system built with .NET Core Web API, SQL Server, and React TypeScript frontend. This system manages citizen reimbursement requests with complex business logic for eligibility calculation and budget management.

## 🚀 Quick Start

### **Installation & Setup**
- **📖 [Installation Guide](./הוראות_התקנה_והרצה.md)** - הוראות התקנה מלאות בעברית

### **One-Command Setup**
```bash
git clone <REPOSITORY_URL>
cd FinancialReimbursementSystem
# Follow הוראות_התקנה_והרצה.md for database setup
# Backend: cd FinancialReimbursementSystem.API && dotnet run
# Frontend: cd frontend && npm install && npm start
```

## Features

### Core Functionality
- **Citizen Management**: Register and manage citizen information
- **Monthly Income Tracking**: Track monthly income data for each citizen
- **Reimbursement Requests**: Submit and process reimbursement requests
- **Eligibility Calculation**: Complex tiered calculation based on average income
- **Budget Management**: Monthly budget tracking and allocation
- **Concurrent Processing**: Thread-safe budget allocation to prevent double spending

### Business Logic
- **Tiered Refund Calculation**:
  - Average up to 5,000 ILS – 15% refund
  - Average between 5,000 and 8,000 ILS – 10% refund (cumulative)
  - Average above 8,000 and up to 9,000 ILS – 5% refund (cumulative)
  - Average above 9,000 ILS – No refund

- **Eligibility Requirements**:
  - Minimum 6 months of income data in the tax year
  - No other approved request for the same tax year
  - Budget availability check

### User Interfaces
- **Clerk Dashboard**:
  - View all pending reimbursement requests
  - Detailed request view with income history
  - Eligibility calculation and approval workflow
  - Real-time budget information

- **Citizen Portal**:
  - Check reimbursement status by ID number
  - View request history and approved amounts
  - Simple, citizen-friendly interface

## Technology Stack

### Backend
- **.NET Core 6.0** - Web API framework
- **Entity Framework Core 6.0** - ORM for database operations
- **SQL Server** - Database with stored procedures for complex calculations
- **C#** - Programming language

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Database
- **SQL Server** - Primary database
- **Stored Procedures** - Complex business logic implementation
- **Concurrency Control** - Row-level locking for budget operations

## Installation Instructions

### Prerequisites
- **.NET Core 6.0 SDK** or later
- **SQL Server 2019** or later
- **Node.js 16.0** or later
- **npm** or yarn package manager

### Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE FinancialReimbursementDB;
   ```

2. **Run Schema Script**
   - Execute the `Database/Schema.sql` script in SQL Server Management Studio
   - This will create all tables, stored procedures, and sample data

### Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd FinancialReimbursementSystem/FinancialReimbursementSystem.API
   ```

2. **Restore NuGet Packages**
   ```bash
   dotnet restore
   ```

3. **Update Connection String**
   - Edit `appsettings.json`
   - Update the `DefaultConnection` string to match your SQL Server configuration

4. **Run the API**
   ```bash
   dotnet run
   ```
   
   The API will be available at `https://localhost:7001`

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   
   The frontend will be available at `http://localhost:3000`

### Environment Configuration

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=https://localhost:7001/api
```

## Usage

### Clerk Workflow

1. **Access Clerk Dashboard**
   - Navigate to `http://localhost:3000/clerk`
   - View all pending reimbursement requests

2. **Process Request**
   - Click on any request to view details
   - Review citizen information and income data
   - Click "Calculate Eligibility" to determine refund amount
   - Review budget availability
   - Click "Approve Reimbursement" to approve and allocate budget

3. **Budget Management**
   - Real-time budget information displayed on request details page
   - Automatic budget deduction upon approval
   - Concurrent request handling prevents overspending

### Citizen Workflow

1. **Check Status**
   - Navigate to `http://localhost:3000/citizen`
   - Enter 9-digit identity number
   - View current request status and history

2. **Request Information**
   - Last request details with approval status
   - Complete request history with amounts received
   - Clear status indicators (Pending, Calculated, Approved, Rejected)

## API Endpoints

### Clerk Endpoints
- `GET /api/clerk/pending-requests` - Get all pending requests
- `GET /api/clerk/request-details/{id}` - Get detailed request information
- `POST /api/clerk/calculate-eligibility` - Calculate refund eligibility
- `POST /api/clerk/approve-reimbursement` - Approve and allocate budget
- `GET /api/clerk/current-budget` - Get current month budget

### Citizen Endpoints
- `GET /api/citizen/status/{identityNumber}` - Get citizen status and history

## Database Schema

### Core Tables
- **Citizens** - Citizen demographic information
- **MonthlyIncome** - Monthly income data per citizen
- **ReimbursementRequests** - Reimbursement request tracking
- **Budget** - Monthly budget allocation and tracking

### Stored Procedures
- **sp_CalculateEligibility** - Complex eligibility calculation with business rules
- **sp_ApproveReimbursement** - Budget-safe approval with concurrency control

## Security Considerations

- **SQL Injection Protection**: Parameterized queries and stored procedures
- **Concurrency Control**: Row-level locking prevents budget overspending
- **Data Validation**: Input validation at both frontend and backend
- **CORS Configuration**: Properly configured for production environments

## Performance Features

- **Database Indexing**: Optimized queries for common operations
- **Concurrent Processing**: Thread-safe budget operations
- **Efficient Calculations**: Database-side business logic for performance
- **Responsive UI**: Modern React with optimized rendering

## Sample Data

The database schema includes sample data for testing:
- 3 sample citizens with income data
- 12 months of income records for each citizen
- Sample reimbursement requests in various statuses
- Monthly budget configuration for the current year

## Development Notes

### Additional Features Implemented
- **Real-time Budget Tracking**: Live budget updates during approval process
- **Comprehensive Error Handling**: User-friendly error messages
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Modern UI/UX**: Clean, intuitive interface design

### Code Quality
- **Clean Architecture**: Separation of concerns with service layers
- **TypeScript Interfaces**: Strong typing for all data structures
- **Error Boundaries**: Proper error handling in React components
- **Logging**: Comprehensive error logging and debugging information

## Testing

### Backend Testing
```bash
cd FinancialReimbursementSystem.API
dotnet test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment
- Publish API using `dotnet publish`
- Configure production database connection
- Set up IIS or appropriate hosting environment

### Frontend Deployment
- Build using `npm run build`
- Deploy static files to web server
- Configure API endpoint for production

## Support

For technical questions or issues, please refer to the code documentation or contact the development team.

---

**Note**: This system was developed as a technical assessment and demonstrates advanced programming capabilities including complex business logic implementation, concurrent processing, and modern web development practices.
