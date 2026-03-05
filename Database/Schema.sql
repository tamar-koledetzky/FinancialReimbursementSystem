-- Financial Reimbursement System Database Schema
-- SQL Server 2019+

CREATE DATABASE FinancialReimbursementDB;
GO

USE FinancialReimbursementDB;
GO
-- Drop existing objects if they exist (for clean recreation)
IF OBJECT_ID('dbo.sp_CalculateEligibility', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CalculateEligibility;
GO

IF OBJECT_ID('dbo.sp_ApproveReimbursement', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_ApproveReimbursement;
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

IF OBJECT_ID('dbo.Budget', 'U') IS NOT NULL
    DROP TABLE dbo.Budget;
GO

-- Create Budget table
CREATE TABLE dbo.Budget (
    BudgetId INT IDENTITY(1,1) PRIMARY KEY,
    Year INT NOT NULL,
    Month INT NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    UsedAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    RemainingAmount AS (TotalAmount - UsedAmount) PERSISTED,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT UQ_Budget_Year_Month UNIQUE (Year, Month)
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
    CONSTRAINT FK_MonthlyIncome_Citizen FOREIGN KEY (CitizenId) REFERENCES dbo.Citizens(CitizenId),
    CONSTRAINT UQ_MonthlyIncome_Citizen_Year_Month UNIQUE (CitizenId, Year, Month),
    CONSTRAINT CK_MonthlyIncome_Month CHECK (Month BETWEEN 1 AND 12),
    CONSTRAINT CK_MonthlyIncome_Income CHECK (GrossIncome >= 0 AND NetIncome >= 0)
);
GO

-- Create ReimbursementRequests table
CREATE TABLE dbo.ReimbursementRequests (
    RequestId INT IDENTITY(1,1) PRIMARY KEY,
    CitizenId INT NOT NULL,
    TaxYear INT NOT NULL,
    RequestDate DATETIME2 DEFAULT GETDATE(),
    Status NVARCHAR(50) NOT NULL DEFAULT 'PendingCalculation', -- PendingCalculation, Calculated, Approved, Rejected
    CalculatedAmount DECIMAL(18,2),
    ApprovedAmount DECIMAL(18,2),
    CalculationDate DATETIME2,
    ApprovalDate DATETIME2,
    ClerkId INT, -- Reference to clerk who processed the request
    Notes NVARCHAR(1000),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_ReimbursementRequests_Citizen FOREIGN KEY (CitizenId) REFERENCES dbo.Citizens(CitizenId),
    CONSTRAINT CK_ReimbursementRequests_Status CHECK (Status IN ('PendingCalculation', 'Calculated', 'Approved', 'Rejected')),
    CONSTRAINT CK_ReimbursementRequests_Amounts CHECK (CalculatedAmount >= 0 AND ApprovedAmount >= 0)
);
GO

-- Create indexes for better performance
CREATE INDEX IX_MonthlyIncome_Citizen_Year ON dbo.MonthlyIncome(CitizenId, Year);
CREATE INDEX IX_ReimbursementRequests_Citizen_Status ON dbo.ReimbursementRequests(CitizenId, Status);
CREATE INDEX IX_ReimbursementRequests_Status_TaxYear ON dbo.ReimbursementRequests(Status, TaxYear);
GO

-- Insert sample budget data
INSERT INTO dbo.Budget (Year, Month, TotalAmount) VALUES
(2026, 1, 1000000.00),
(2026, 2, 1000000.00),
(2026, 3, 1000000.00),
(2026, 4, 1000000.00),
(2026, 5, 1000000.00),
(2026, 6, 1000000.00),
(2026, 7, 1000000.00),
(2026, 8, 1000000.00),
(2026, 9, 1000000.00),
(2026, 10, 1000000.00),
(2026, 11, 1000000.00),
(2026, 12, 1000000.00);
GO

-- Insert sample citizens
INSERT INTO dbo.Citizens (IdentityNumber, FirstName, LastName, Email, Phone) VALUES
('123456789', 'David', 'Cohen', 'david.cohen@email.com', '0501234567'),
('987654321', 'Sarah', 'Levy', 'sarah.levy@email.com', '0529876543'),
('456789123', 'Moshe', 'Goldberg', 'moshe.goldberg@email.com', '0544567891');
GO

-- Insert sample monthly income data
INSERT INTO dbo.MonthlyIncome (CitizenId, Year, Month, GrossIncome, NetIncome) VALUES
-- David Cohen - 2023
(1, 2023, 1, 6000.00, 4800.00),
(1, 2023, 2, 6200.00, 4960.00),
(1, 2023, 3, 5800.00, 4640.00),
(1, 2023, 4, 6100.00, 4880.00),
(1, 2023, 5, 5900.00, 4720.00),
(1, 2023, 6, 6300.00, 5040.00),
(1, 2023, 7, 6500.00, 5200.00),
(1, 2023, 8, 6200.00, 4960.00),
(1, 2023, 9, 6000.00, 4800.00),
(1, 2023, 10, 5800.00, 4640.00),
(1, 2023, 11, 6100.00, 4880.00),
(1, 2023, 12, 6400.00, 5120.00),
-- Sarah Levy - 2023
(2, 2023, 1, 8500.00, 6800.00),
(2, 2023, 2, 8700.00, 6960.00),
(2, 2023, 3, 8300.00, 6640.00),
(2, 2023, 4, 8600.00, 6880.00),
(2, 2023, 5, 8400.00, 6720.00),
(2, 2023, 6, 8800.00, 7040.00),
(2, 2023, 7, 8900.00, 7120.00),
(2, 2023, 8, 8700.00, 6960.00),
(2, 2023, 9, 8500.00, 6800.00),
(2, 2023, 10, 8300.00, 6640.00),
(2, 2023, 11, 8600.00, 6880.00),
(2, 2023, 12, 8800.00, 7040.00),
-- Moshe Goldberg - 2023
(3, 2023, 1, 4500.00, 3600.00),
(3, 2023, 2, 4700.00, 3760.00),
(3, 2023, 3, 4300.00, 3440.00),
(3, 2023, 4, 4600.00, 3680.00),
(3, 2023, 5, 4400.00, 3520.00),
(3, 2023, 6, 4800.00, 3840.00),
(3, 2023, 7, 4900.00, 3920.00),
(3, 2023, 8, 4700.00, 3760.00),
(3, 2023, 9, 4500.00, 3600.00),
(3, 2023, 10, 4300.00, 3440.00),
(3, 2023, 11, 4600.00, 3680.00),
(3, 2023, 12, 4800.00, 3840.00);
GO

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
        UPDATE dbo.Budget WITH (UPDLOCK, HOLDLOCK)
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

-- Insert sample reimbursement requests
INSERT INTO dbo.ReimbursementRequests (CitizenId, TaxYear, Status) VALUES
(1, 2023, 'PendingCalculation'),
(2, 2023, 'PendingCalculation'),
(3, 2023, 'PendingCalculation');
GO

PRINT 'Database schema created successfully!';
