-- Financial Reimbursement System Database Schema
-- SQL Server 2019+

CREATE DATABASE FinancialReimbursementDB;
GO

USE FinancialReimbursementDB;
GO

-- Drop existing objects if they exist
IF OBJECT_ID('dbo.sp_CalculateEligibility', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CalculateEligibility;
GO
IF OBJECT_ID('dbo.sp_ApproveReimbursement', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_ApproveReimbursement;
GO
IF OBJECT_ID('dbo.sp_RejectReimbursement', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RejectReimbursement;
GO
IF OBJECT_ID('dbo.ReimbursementRequests', 'U') IS NOT NULL
    DROP TABLE dbo.ReimbursementRequests;
GO
IF OBJECT_ID('dbo.MonthlyIncome', 'U') IS NOT NULL
    DROP TABLE dbo.MonthlyIncome;
GO
IF OBJECT_ID('dbo.Citizens', 'U') IS NOT NULL
    DROP TABLE dbo.Citizens;
GO
IF OBJECT_ID('dbo.Budgets', 'U') IS NOT NULL
    DROP TABLE dbo.Budgets;
GO

-- Create Budgets table
CREATE TABLE dbo.Budgets (
    BudgetId INT IDENTITY(1,1) PRIMARY KEY,
    Year INT NOT NULL,
    Month INT NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    UsedAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    RemainingAmount AS (TotalAmount - UsedAmount) PERSISTED,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT UQ_Budgets_Year_Month UNIQUE (Year, Month)
);
GO

-- Create Citizens table
CREATE TABLE dbo.Citizens (
    CitizenId INT IDENTITY(1,1) PRIMARY KEY,
    IdentityNumber VARCHAR(9) NOT NULL UNIQUE,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255),
    Phone NVARCHAR(20),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Create MonthlyIncome table
CREATE TABLE dbo.MonthlyIncome (
    IncomeId INT IDENTITY(1,1) PRIMARY KEY,
    CitizenId INT NOT NULL,
    Year INT NOT NULL,
    Month INT NOT NULL,
    GrossIncome DECIMAL(18,2) NOT NULL,
    NetIncome DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_MonthlyIncomes_Citizen FOREIGN KEY (CitizenId) REFERENCES dbo.Citizens(CitizenId),
    CONSTRAINT UQ_MonthlyIncomes_Citizen_Year_Month UNIQUE (CitizenId, Year, Month),
    CONSTRAINT CK_MonthlyIncomes_Month CHECK (Month BETWEEN 1 AND 12),
    CONSTRAINT CK_MonthlyIncomes_Income CHECK (GrossIncome >= 0 AND NetIncome >= 0)
);
GO

-- Create ReimbursementRequests table
CREATE TABLE dbo.ReimbursementRequests (
    RequestId INT IDENTITY(1,1) PRIMARY KEY,
    CitizenId INT NOT NULL,
    TaxYear INT NOT NULL,
    RequestDate DATETIME2 DEFAULT GETDATE(),
    Status NVARCHAR(50) NOT NULL DEFAULT 'PendingCalculation',
    CalculatedAmount DECIMAL(18,2),
    ApprovedAmount DECIMAL(18,2),
    CalculationDate DATETIME2,
    ApprovalDate DATETIME2,
    ClerkId INT,
    Notes NVARCHAR(1000),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_ReimbursementRequests_Citizen FOREIGN KEY (CitizenId) REFERENCES dbo.Citizens(CitizenId),
    CONSTRAINT CK_ReimbursementRequests_Status CHECK (Status IN ('PendingCalculation', 'Calculated', 'Approved', 'Rejected')),
    CONSTRAINT CK_ReimbursementRequests_Amounts CHECK (CalculatedAmount >= 0 AND ApprovedAmount >= 0)
);
GO

-- Create indexes
CREATE INDEX IX_MonthlyIncomes_Citizen_Year ON dbo.MonthlyIncome(CitizenId, Year);
CREATE INDEX IX_ReimbursementRequests_Citizen_Status ON dbo.ReimbursementRequests(CitizenId, Status);
CREATE INDEX IX_ReimbursementRequests_Status_TaxYear ON dbo.ReimbursementRequests(Status, TaxYear);
GO

-- Stored Procedures 

-- Create stored procedure for calculating eligibility
CREATE PROCEDURE dbo.sp_CalculateEligibility
    @RequestId INT,
    @CalculatedAmount DECIMAL(18,2) OUTPUT,
    @IsEligible BIT OUTPUT,
    @ErrorMessage NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @CitizenId INT, @TaxYear INT, @Status NVARCHAR(50);

        -- Lock request row
        SELECT 
            @CitizenId = CitizenId,
            @TaxYear = TaxYear,
            @Status = Status
        FROM dbo.ReimbursementRequests WITH (UPDLOCK, HOLDLOCK)
        WHERE RequestId = @RequestId;

        IF @CitizenId IS NULL
        BEGIN
            SET @ErrorMessage = 'Request not found';
            THROW 50001, @ErrorMessage, 1;
        END

        IF @Status <> 'PendingCalculation'
        BEGIN
            SET @ErrorMessage = 'Request is not in PendingCalculation status';
            THROW 50002, @ErrorMessage, 1;
        END

        -- Check 6 months income
        IF (
            SELECT COUNT(*)
            FROM dbo.MonthlyIncome
            WHERE CitizenId = @CitizenId AND Year = @TaxYear
        ) < 6
        BEGIN
            SET @ErrorMessage = 'Minimum 6 months income required';
            THROW 50003, @ErrorMessage, 1;
        END

        -- Check no approved request for same year
        IF EXISTS (
            SELECT 1
            FROM dbo.ReimbursementRequests
            WHERE CitizenId = @CitizenId
              AND TaxYear = @TaxYear
              AND Status = 'Approved'
        )
        BEGIN
            SET @ErrorMessage = 'Approved request already exists for this year';
            THROW 50004, @ErrorMessage, 1;
        END

        DECLARE @AverageIncome DECIMAL(18,2);

        SELECT @AverageIncome = AVG(NetIncome)
        FROM dbo.MonthlyIncome
        WHERE CitizenId = @CitizenId AND Year = @TaxYear;

        SET @CalculatedAmount = 0;

        IF @AverageIncome <= 5000
            SET @CalculatedAmount = @AverageIncome * 0.15;
        ELSE IF @AverageIncome <= 8000
            SET @CalculatedAmount = (5000 * 0.15) + ((@AverageIncome - 5000) * 0.10);
        ELSE IF @AverageIncome <= 9000
            SET @CalculatedAmount = (5000 * 0.15) + (3000 * 0.10) + ((@AverageIncome - 8000) * 0.05);
        ELSE
            SET @CalculatedAmount = 0;

        SET @IsEligible = CASE WHEN @CalculatedAmount > 0 THEN 1 ELSE 0 END;

        UPDATE dbo.ReimbursementRequests
        SET Status = CASE WHEN @IsEligible = 1 THEN 'Calculated' ELSE 'Rejected' END,
            CalculatedAmount = @CalculatedAmount,
            CalculationDate = GETDATE(),
            Notes = 'Calculation completed'
        WHERE RequestId = @RequestId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @IsEligible = 0;
        SET @CalculatedAmount = 0;
        SET @ErrorMessage = ERROR_MESSAGE();
    END CATCH
END
GO
-- Create stored procedure for approving reimbursement with budget check
CREATE PROCEDURE dbo.sp_ApproveReimbursement
    @RequestId INT,
    @ClerkId INT,
    @ApprovedAmount DECIMAL(18,2),
    @IsApproved BIT OUTPUT,
    @ErrorMessage NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @CalculatedAmount DECIMAL(18,2);

        -- Lock request row
        SELECT @CalculatedAmount = CalculatedAmount
        FROM dbo.ReimbursementRequests WITH (UPDLOCK, HOLDLOCK)
        WHERE RequestId = @RequestId
          AND Status = 'Calculated';

        IF @CalculatedAmount IS NULL
        BEGIN
            SET @ErrorMessage = 'Request not found or not in Calculated status';
            THROW 50010, @ErrorMessage, 1;
        END

        IF @ApprovedAmount > @CalculatedAmount
        BEGIN
            SET @ErrorMessage = 'Approved amount exceeds calculated amount ';
            THROW 50011, @ErrorMessage, 1;
        END

        -- Atomic budget update
        UPDATE dbo.Budgets WITH (UPDLOCK, HOLDLOCK)
        SET UsedAmount = UsedAmount + @ApprovedAmount
        WHERE Year = YEAR(GETDATE())
          AND Month = MONTH(GETDATE())
          AND (TotalAmount - UsedAmount) >= @ApprovedAmount;

        IF @@ROWCOUNT = 0
        BEGIN
            SET @ErrorMessage = 'Insufficient budget';
            THROW 50012, @ErrorMessage, 1;
        END

        UPDATE dbo.ReimbursementRequests
        SET Status = 'Approved',
            ApprovedAmount = @ApprovedAmount,
            ApprovalDate = GETDATE(),
            ClerkId = @ClerkId,
            Notes = 'Approved successfully'
        WHERE RequestId = @RequestId;

        SET @IsApproved = 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @IsApproved = 0;
        SET @ErrorMessage = ERROR_MESSAGE();
    END CATCH
END
GO

-- Create stored procedure for rejecting reimbursement
CREATE PROCEDURE dbo.sp_RejectReimbursement
    @RequestId INT,
    @ClerkId INT,
    @RejectionReason NVARCHAR(500),
    @IsRejected BIT OUTPUT,
    @ErrorMessage NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Status NVARCHAR(50);

        -- Lock request row
        SELECT @Status = Status
        FROM dbo.ReimbursementRequests WITH (UPDLOCK, HOLDLOCK)
        WHERE RequestId = @RequestId;

        IF @Status IS NULL
        BEGIN
            SET @ErrorMessage = 'Request not found';
            THROW 50020, @ErrorMessage, 1;
        END

        IF @Status IN ('Approved', 'Rejected')
        BEGIN
            SET @ErrorMessage = 'Request is already processed';
            THROW 50021, @ErrorMessage, 1;
        END

        UPDATE dbo.ReimbursementRequests
        SET Status = 'Rejected',
            ApprovalDate = GETDATE(),
            ClerkId = @ClerkId,
            Notes = @RejectionReason
        WHERE RequestId = @RequestId;

        SET @IsRejected = 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @IsRejected = 0;
        SET @ErrorMessage = ERROR_MESSAGE();
    END CATCH
END
GO

-- Create stored procedure for getting current budget
CREATE PROCEDURE dbo.sp_GetCurrentBudget
    @TotalAmount DECIMAL(18,2) OUTPUT,
    @UsedAmount DECIMAL(18,2) OUTPUT,
    @RemainingAmount DECIMAL(18,2) OUTPUT,
    @Message NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @BudgetId INT;

        SELECT 
            @BudgetId = BudgetId,
            @TotalAmount = TotalAmount,
            @UsedAmount = UsedAmount,
            @RemainingAmount = TotalAmount - UsedAmount
        FROM dbo.Budgets
        WHERE Year = YEAR(GETDATE())
          AND Month = MONTH(GETDATE());

        IF @BudgetId IS NULL
        BEGIN
            SET @Message = 'No budget found for current month';
            SET @TotalAmount = 0;
            SET @UsedAmount = 0;
            SET @RemainingAmount = 0;
        END
        ELSE
        BEGIN
            SET @Message = 'Budget retrieved successfully';
        END
    END TRY
    BEGIN CATCH
        SET @Message = ERROR_MESSAGE();
        SET @TotalAmount = 0;
        SET @UsedAmount = 0;
        SET @RemainingAmount = 0;
    END CATCH
END
GO
PRINT 'Database schema created successfully!';
