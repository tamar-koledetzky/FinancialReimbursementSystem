# Financial Reimbursement System

A financial reimbursement eligibility system built with .NET Web API, SQL Server and React.

The system allows a clerk to calculate reimbursement eligibility for citizens based on their income history and approve requests while ensuring that monthly budget cannot be exceeded, even when multiple approvals occur concurrently.

## Technologies

### Backend
- **.NET 8 / ASP.NET Core Web API**
- **Entity Framework Core**
- **C#**

### Frontend
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Axios**

### Database
- **SQL Server**
- **Stored Procedures for core business logic:**
  - `sp_CalculateEligibility` - Calculates reimbursement eligibility
  - `sp_ApproveReimbursement` - Approves reimbursement with budget check
  - `sp_RejectReimbursement` - Rejects reimbursement with reason

## Project Structure

```
FinancialReimbursementSystem
│
├── FinancialReimbursementSystem.API   # .NET Web API
├── frontend                           # React application
├── Database
│   ├── Schema.sql               # Database schema and stored procedures
│   ├── ProductionReadySetup.sql # Test data and budget setup
│   └── README.md                # Database documentation
│
└── README.md
```

## System Architecture

The system is composed of three main layers:

### Frontend (React)
Responsible for user interface.

Main responsibilities:
- Display citizen and clerk dashboards
- Send API requests to backend
- Display eligibility results and request status

### Backend (.NET Web API)
Handles application logic and communication with database.

Main responsibilities:
- Expose REST API endpoints
- Validate requests
- Coordinate business operations
- Call stored procedures for core calculations

### Database (SQL Server)
Responsible for persistent data storage and core business logic.

Main components:
- Tables for citizens, income records and reimbursement requests
- Monthly budget tracking
- Stored procedures for:
  - eligibility calculation
  - safe reimbursement approval
  - concurrency-safe budget updates

### Request Processing Flow
1. Clerk opens a reimbursement request
2. Backend retrieves citizen income history
3. Stored procedure calculates eligibility based on income tiers
4. Clerk reviews calculated amount
5. If approved, another stored procedure:
   - checks available budget
   - locks budget row
   - updates used budget
   - updates request status

This ensures consistent and safe budget allocation even with concurrent requests.

## Setup Instructions

### 1. Clone repository
```bash
git clone https://github.com/tamar-koledetzky/FinancialReimbursementSystem.git
cd FinancialReimbursementSystem
```

### 2. Database Setup

Create a database in SQL Server:
```sql
CREATE DATABASE FinancialReimbursementDB;
```

Run the database schema and setup scripts:
```bash
# First run the schema
sqlcmd -S localhost -E -d FinancialReimbursementDB -i "Database\Schema.sql"

# Then run the data setup
sqlcmd -S localhost -E -d FinancialReimbursementDB -i "Database\ProductionReadySetup.sql"
```

This will:
- Create all tables (Citizens, MonthlyIncome, ReimbursementRequests, Budgets)
- Create stored procedures
- Insert test data (5 citizens, 30 income records, budget data)

### 3. Run Backend

Navigate to API project:
```bash
cd FinancialReimbursementSystem.API
dotnet restore
dotnet run
```

The API will run on:
http://localhost:5000

### 4. Run Frontend
```bash
cd frontend
npm install
npm start
```

The application will run on:
http://localhost:3000

## Application Interfaces

### Clerk Interface
http://localhost:3000/clerk

Allows clerk to:
- View pending reimbursement requests
- Review citizen income history
- Calculate eligibility
- Approve or reject requests
- View current monthly budget

### Citizen Interface
http://localhost:3000/citizen

Allows a citizen to:
- Check reimbursement request status
- View request history
- See approved reimbursement amounts

## Business Logic

### Eligibility Calculation

Refund percentage is determined by citizen's average monthly income:

| Average Income | Refund |
|---------------|---------|
| Up to 5,000 ILS | 15% |
| 5,000 – 8,000 ILS | 10% |
| 8,000 – 9,000 ILS | 5% |
| Above 9,000 ILS | Not eligible |

Additional conditions:
- At least 6 months of income data in tax year
- Only one approved request per tax year
- Approval allowed only if budget is available

### Budget Concurrency Protection

The system ensures that monthly budget cannot be exceeded by multiple simultaneous approvals.

This is implemented using:
- SQL transactions
- Row-level locking
- Stored procedure based approval logic

## Sample Data

The database scripts include sample data:
- Citizens
- Monthly income records
- Reimbursement requests
- Monthly budget configuration

This allows the system to be tested immediately after installation.

## Notes

This project was developed as part of a technical home assignment and demonstrates:
- Full-stack development (.NET + React)
- Implementation of complex business logic in SQL
- Safe concurrent operations for financial transactions
- Clean API and frontend separation
