using FinancialReimbursementSystem.Models;

namespace FinancialReimbursementSystem.Dtos
{
    public class CitizenDto
    {
        public int CitizenId { get; set; }
        public string IdentityNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MonthlyIncomeDto
    {
        public int IncomeId { get; set; }
        public int CitizenId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal GrossIncome { get; set; }
        public decimal NetIncome { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ReimbursementRequestDto
    {
        public int RequestId { get; set; }
        public int CitizenId { get; set; }
        public string CitizenName { get; set; } = string.Empty;
        public string IdentityNumber { get; set; } = string.Empty;
        public int TaxYear { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? CalculatedAmount { get; set; }
        public decimal? ApprovedAmount { get; set; }
        public DateTime? CalculationDate { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public int? ClerkId { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<MonthlyIncomeDto> MonthlyIncomes { get; set; } = new();
        public List<ReimbursementRequestDto> PastRequests { get; set; } = new();
    }

    public class CreateReimbursementRequestDto
    {
        public string IdentityNumber { get; set; } = string.Empty;
        public int TaxYear { get; set; }
    }

    public class CalculateEligibilityDto
    {
        public int RequestId { get; set; }
    }

    public class ApproveReimbursementDto
    {
        public int RequestId { get; set; }
        public decimal ApprovedAmount { get; set; }
        public int ClerkId { get; set; }
    }

    public class RejectReimbursementDto
    {
        public int RequestId { get; set; }
        public int ClerkId { get; set; }
        public string RejectionReason { get; set; } = string.Empty;
    }

    public class EligibilityResultDto
    {
        public bool IsEligible { get; set; }
        public decimal CalculatedAmount { get; set; }
        public string? ErrorMessage { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ApprovalResultDto
    {
        public bool IsApproved { get; set; }
        public string? ErrorMessage { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal RemainingBudget { get; set; }
    }

    public class BudgetDto
    {
        public int BudgetId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal UsedAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CitizenStatusDto
    {
        public string IdentityNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public ReimbursementRequestDto? LastRequest { get; set; }
        public List<ReimbursementRequestDto> RequestHistory { get; set; } = new();
    }
}
