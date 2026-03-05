# Financial Reimbursement System - Database Setup

## 📋 Overview
This document explains the database setup for the Financial Reimbursement System.

## 🗄️ Database Structure

### Tables
1. **Citizens** - Stores citizen information
2. **MonthlyIncome** - Stores monthly income data for each citizen
3. **ReimbursementRequests** - Stores reimbursement requests with different statuses
4. **Budgets** - Stores budget information for each year/month

## 🚀 Setup Instructions

### Quick Setup
Run the following script to set up the database with clean test data:

```sql
sqlcmd -S localhost -E -d FinancialReimbursementDB -i "Database\ProductionReadySetup.sql"
```

### What the Setup Script Does
1. **Cleans** all existing data
2. **Creates** 5 test citizens with realistic data
3. **Inserts** 30 monthly income records (6 months × 5 citizens)
4. **Provides** different income levels for testing:
   - Low income citizens (eligible for reimbursement)
   - Medium income citizens (eligible for reimbursement)
   - High income citizens (not eligible)

## 📊 Test Data

### Citizens
| ID | Name | Income Category | Eligibility |
|----|------|----------------|-------------|
| 1 | דוד כהן | Low Income | ✅ Eligible |
| 2 | שרה לוי | Medium Income | ✅ Eligible |
| 3 | יוסף מזרחי | High Income | ❌ Not Eligible |
| 4 | רחל אברהם | Medium Income | ✅ Eligible |
| 5 | משה גולדברג | Low Income | ✅ Eligible |

### Income Ranges
- **Low Income**: ~4,000-4,700 NIS/month
- **Medium Income**: ~6,600-7,800 NIS/month
- **High Income**: ~13,300-15,500 NIS/month

## 🎯 Testing Scenarios

The system is designed to test these scenarios:
1. **New Requests** - Citizens submitting new reimbursement requests
2. **Eligibility Calculation** - System calculating eligibility based on income
3. **Approval Process** - Clerks approving eligible requests
4. **Rejection Process** - Clerks rejecting ineligible requests
5. **Budget Management** - Tracking budget usage

## 🔧 Technical Details

### Request Statuses
- `PendingCalculation` - New request, eligibility not yet calculated
- `Calculated` - Eligibility calculated, ready for approval/rejection
- `Approved` - Request approved and processed
- `Rejected` - Request rejected

### Foreign Key Relationships
- `MonthlyIncome.CitizenId` → `Citizens.CitizenId`
- `ReimbursementRequests.CitizenId` → `Citizens.CitizenId`

## 📝 Notes

- All dates use current year (2023) for tax year calculations
- Budget is set for current year/month (2026, March)
- Identity numbers are test numbers (111111111, etc.)
- Email addresses are test addresses
- Phone numbers are Israeli format (050-xxxxxxx)

## 🎉 Ready for Production

The database is now set up with:
- ✅ Clean, professional data
- ✅ No hardcoded values in application
- ✅ Realistic test scenarios
- ✅ Proper foreign key constraints
- ✅ Complete data for all testing scenarios

The system is ready for demonstration and production use!
