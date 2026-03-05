using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using FinancialReimbursementSystem.Models;
using FinancialReimbursementSystem.Dtos;
using FinancialReimbursementSystem.Data;

namespace FinancialReimbursementSystem.Services
{
    public interface IReimbursementService
    {
        Task<List<ReimbursementRequestDto>> GetPendingRequestsAsync();
        Task<ReimbursementRequestDto?> GetRequestDetailsAsync(int requestId);
        Task<EligibilityResultDto> CalculateEligibilityAsync(int requestId);
        Task<ApprovalResultDto> ApproveReimbursementAsync(ApproveReimbursementDto dto);
        Task<ApprovalResultDto> RejectReimbursementAsync(RejectReimbursementDto dto);
        Task<CitizenStatusDto?> GetCitizenStatusAsync(string identityNumber);
        Task<BudgetDto?> GetCurrentBudgetAsync();
    }

    public class ReimbursementService : IReimbursementService
    {
        private readonly ApplicationDbContext _context;

        public ReimbursementService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ReimbursementRequestDto>> GetPendingRequestsAsync()
        {
            var requests = await _context.ReimbursementRequests
                .Include(r => r.Citizen)
                .Where(r => r.Status == "PendingCalculation" || r.Status == "Calculated")
                .OrderBy(r => r.RequestDate)
                .ToListAsync();

            return requests.Select(r => new ReimbursementRequestDto
            {
                RequestId = r.RequestId,
                CitizenId = r.CitizenId,
                CitizenName = $"{r.Citizen.FirstName} {r.Citizen.LastName}",
                IdentityNumber = r.Citizen.IdentityNumber,
                TaxYear = r.TaxYear,
                RequestDate = r.RequestDate,
                Status = r.Status,
                CalculatedAmount = r.CalculatedAmount,
                ApprovedAmount = r.ApprovedAmount,
                CalculationDate = r.CalculationDate,
                ApprovalDate = r.ApprovalDate,
                ClerkId = r.ClerkId,
                Notes = r.Notes
            }).ToList();
        }

        public async Task<ReimbursementRequestDto?> GetRequestDetailsAsync(int requestId)
        {
            var request = await _context.ReimbursementRequests
                .Include(r => r.Citizen)
                .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (request == null) return null;

            // Get monthly incomes for the tax year
            var monthlyIncomes = await _context.MonthlyIncomes
                .Where(mi => mi.CitizenId == request.CitizenId && mi.Year == request.TaxYear)
                .OrderBy(mi => mi.Month)
                .ToListAsync();

            // Get past requests
            var pastRequests = await _context.ReimbursementRequests
                .Include(r => r.Citizen)
                .Where(r => r.CitizenId == request.CitizenId && r.RequestId != requestId)
                .OrderByDescending(r => r.TaxYear)
                .ToListAsync();

            return new ReimbursementRequestDto
            {
                RequestId = request.RequestId,
                CitizenId = request.CitizenId,
                CitizenName = $"{request.Citizen.FirstName} {request.Citizen.LastName}",
                IdentityNumber = request.Citizen.IdentityNumber,
                TaxYear = request.TaxYear,
                RequestDate = request.RequestDate,
                Status = request.Status,
                CalculatedAmount = request.CalculatedAmount,
                ApprovedAmount = request.ApprovedAmount,
                CalculationDate = request.CalculationDate,
                ApprovalDate = request.ApprovalDate,
                ClerkId = request.ClerkId,
                Notes = request.Notes,
                MonthlyIncomes = monthlyIncomes.Select(mi => new MonthlyIncomeDto
                {
                    IncomeId = mi.IncomeId,
                    CitizenId = mi.CitizenId,
                    Year = mi.Year,
                    Month = mi.Month,
                    GrossIncome = mi.GrossIncome,
                    NetIncome = mi.NetIncome,
                    CreatedAt = mi.CreatedAt
                }).ToList(),
                PastRequests = pastRequests.Select(pr => new ReimbursementRequestDto
                {
                    RequestId = pr.RequestId,
                    CitizenId = pr.CitizenId,
                    CitizenName = $"{pr.Citizen.FirstName} {pr.Citizen.LastName}",
                    IdentityNumber = pr.Citizen.IdentityNumber,
                    TaxYear = pr.TaxYear,
                    RequestDate = pr.RequestDate,
                    Status = pr.Status,
                    CalculatedAmount = pr.CalculatedAmount,
                    ApprovedAmount = pr.ApprovedAmount,
                    CalculationDate = pr.CalculationDate,
                    ApprovalDate = pr.ApprovalDate,
                    ClerkId = pr.ClerkId,
                    Notes = pr.Notes
                }).ToList()
            };
        }

        public async Task<EligibilityResultDto> CalculateEligibilityAsync(int requestId)
        {
            try
            {
                await using var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();

                var command = connection.CreateCommand();
                command.CommandText = "sp_CalculateEligibility";
                command.CommandType = System.Data.CommandType.StoredProcedure;

                var requestIdParam = new SqlParameter("@RequestId", requestId);
                command.Parameters.Add(requestIdParam);

                var eligibleAmountParam = new SqlParameter("@EligibleAmount", System.Data.SqlDbType.Decimal)
                {
                    Direction = System.Data.ParameterDirection.Output,
                    Precision = 18,
                    Scale = 2
                };
                command.Parameters.Add(eligibleAmountParam);

                var messageParam = new SqlParameter("@Message", System.Data.SqlDbType.NVarChar, 500)
                {
                    Direction = System.Data.ParameterDirection.Output
                };
                command.Parameters.Add(messageParam);

                await command.ExecuteNonQueryAsync();

                var eligibleAmount = (decimal?)eligibleAmountParam.Value ?? 0;
                var message = messageParam.Value?.ToString() ?? "Success";

                return new EligibilityResultDto
                {
                    IsEligible = eligibleAmount > 0,
                    CalculatedAmount = eligibleAmount,
                    Message = message
                };
            }
            catch (Exception ex)
            {
                return new EligibilityResultDto
                {
                    IsEligible = false,
                    CalculatedAmount = 0,
                    Message = $"Error calculating eligibility: {ex.Message}"
                };
            }
        }

        public async Task<ApprovalResultDto> ApproveReimbursementAsync(ApproveReimbursementDto dto)
        {
            try
            {
                await using var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();

                var command = connection.CreateCommand();
                command.CommandText = "sp_ApproveReimbursement";
                command.CommandType = System.Data.CommandType.StoredProcedure;

                var requestIdParam = new SqlParameter("@RequestId", dto.RequestId);
                command.Parameters.Add(requestIdParam);

                var approvedAmountParam = new SqlParameter("@ApprovedAmount", dto.ApprovedAmount);
                command.Parameters.Add(approvedAmountParam);

                var clerkIdParam = new SqlParameter("@ClerkId", dto.ClerkId);
                command.Parameters.Add(clerkIdParam);

                var isApprovedParam = new SqlParameter("@IsApproved", System.Data.SqlDbType.Bit)
                {
                    Direction = System.Data.ParameterDirection.Output
                };
                command.Parameters.Add(isApprovedParam);

                var messageParam = new SqlParameter("@ErrorMessage", System.Data.SqlDbType.NVarChar, 500)
                {
                    Direction = System.Data.ParameterDirection.Output
                };
                command.Parameters.Add(messageParam);

                await command.ExecuteNonQueryAsync();

                var isApproved = (bool?)isApprovedParam.Value ?? false;
                var message = messageParam.Value?.ToString() ?? "Success";

                return new ApprovalResultDto
                {
                    IsApproved = isApproved,
                    Message = message
                };
            }
            catch (Exception ex)
            {
                return new ApprovalResultDto
                {
                    IsApproved = false,
                    Message = $"Error approving reimbursement: {ex.Message}"
                };
            }
        }

        public async Task<ApprovalResultDto> RejectReimbursementAsync(RejectReimbursementDto dto)
        {
            try
            {
                await using var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();

                var command = connection.CreateCommand();
                command.CommandText = "sp_RejectReimbursement";
                command.CommandType = System.Data.CommandType.StoredProcedure;

                var requestIdParam = new SqlParameter("@RequestId", dto.RequestId);
                command.Parameters.Add(requestIdParam);

                var clerkIdParam = new SqlParameter("@ClerkId", dto.ClerkId);
                command.Parameters.Add(clerkIdParam);

                var isRejectedParam = new SqlParameter("@IsRejected", System.Data.SqlDbType.Bit)
                {
                    Direction = System.Data.ParameterDirection.Output
                };
                command.Parameters.Add(isRejectedParam);

                var messageParam = new SqlParameter("@ErrorMessage", System.Data.SqlDbType.NVarChar, 500)
                {
                    Direction = System.Data.ParameterDirection.Output
                };
                command.Parameters.Add(messageParam);

                await command.ExecuteNonQueryAsync();

                var isRejected = (bool?)isRejectedParam.Value ?? false;
                var message = messageParam.Value?.ToString() ?? "Success";

                return new ApprovalResultDto
                {
                    IsApproved = false, // This is a rejection, so always false
                    Message = message
                };
            }
            catch (Exception ex)
            {
                return new ApprovalResultDto
                {
                    IsApproved = false,
                    Message = $"Error rejecting reimbursement: {ex.Message}"
                };
            }
        }

        public async Task<CitizenStatusDto?> GetCitizenStatusAsync(string identityNumber)
        {
            var citizen = await _context.Citizens
                .FirstOrDefaultAsync(c => c.IdentityNumber == identityNumber);

            if (citizen == null) return null;

            var requests = await _context.ReimbursementRequests
                .Where(r => r.CitizenId == citizen.CitizenId)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            var lastRequest = requests.FirstOrDefault();
            var requestHistory = requests.ToList();

            return new CitizenStatusDto
            {
                IdentityNumber = citizen.IdentityNumber,
                FirstName = citizen.FirstName,
                LastName = citizen.LastName,
                LastRequest = lastRequest != null ? new ReimbursementRequestDto
                {
                    RequestId = lastRequest.RequestId,
                    CitizenId = lastRequest.CitizenId,
                    CitizenName = $"{citizen.FirstName} {citizen.LastName}",
                    IdentityNumber = citizen.IdentityNumber,
                    TaxYear = lastRequest.TaxYear,
                    RequestDate = lastRequest.RequestDate,
                    Status = lastRequest.Status,
                    CalculatedAmount = lastRequest.CalculatedAmount,
                    ApprovedAmount = lastRequest.ApprovedAmount,
                    CalculationDate = lastRequest.CalculationDate,
                    ApprovalDate = lastRequest.ApprovalDate,
                    ClerkId = lastRequest.ClerkId,
                    Notes = lastRequest.Notes
                } : null,
                RequestHistory = requestHistory.Select(r => new ReimbursementRequestDto
                {
                    RequestId = r.RequestId,
                    CitizenId = r.CitizenId,
                    CitizenName = $"{citizen.FirstName} {citizen.LastName}",
                    IdentityNumber = citizen.IdentityNumber,
                    TaxYear = r.TaxYear,
                    RequestDate = r.RequestDate,
                    Status = r.Status,
                    CalculatedAmount = r.CalculatedAmount,
                    ApprovedAmount = r.ApprovedAmount,
                    CalculationDate = r.CalculationDate,
                    ApprovalDate = r.ApprovalDate,
                    ClerkId = r.ClerkId,
                    Notes = r.Notes
                }).ToList()
            };
        }

        public async Task<BudgetDto?> GetCurrentBudgetAsync()
        {
            try
            {
                await using var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();

                var command = connection.CreateCommand();
                command.CommandText = "sp_GetCurrentBudget";
                command.CommandType = System.Data.CommandType.StoredProcedure;

                var totalAmountParam = new SqlParameter("@TotalAmount", System.Data.SqlDbType.Decimal)
                {
                    Direction = System.Data.ParameterDirection.Output,
                    Precision = 18,
                    Scale = 2
                };
                command.Parameters.Add(totalAmountParam);

                var usedAmountParam = new SqlParameter("@UsedAmount", System.Data.SqlDbType.Decimal)
                {
                    Direction = System.Data.ParameterDirection.Output,
                    Precision = 18,
                    Scale = 2
                };
                command.Parameters.Add(usedAmountParam);

                var remainingAmountParam = new SqlParameter("@RemainingAmount", System.Data.SqlDbType.Decimal)
                {
                    Direction = System.Data.ParameterDirection.Output,
                    Precision = 18,
                    Scale = 2
                };
                command.Parameters.Add(remainingAmountParam);

                var messageParam = new SqlParameter("@Message", System.Data.SqlDbType.NVarChar, 500)
                {
                    Direction = System.Data.ParameterDirection.Output
                };
                command.Parameters.Add(messageParam);

                await command.ExecuteNonQueryAsync();

                var totalAmount = (decimal?)totalAmountParam.Value;
                var usedAmount = (decimal?)usedAmountParam.Value;
                var remainingAmount = (decimal?)remainingAmountParam.Value;
                var message = messageParam.Value?.ToString() ?? "";

                if (totalAmount == null || totalAmount == 0)
                    return null;

                return new BudgetDto
                {
                    BudgetId = 0, // Not relevant for current budget
                    Year = DateTime.Now.Year,
                    Month = DateTime.Now.Month,
                    TotalAmount = totalAmount.Value,
                    UsedAmount = usedAmount ?? 0,
                    RemainingAmount = remainingAmount ?? 0,
                    CreatedAt = DateTime.Now
                };
            }
            catch (Exception ex)
            {
                // Fallback to EF Core approach if stored procedure fails
                var budget = await _context.Budgets
                    .Where(b => b.Year == DateTime.Now.Year && b.Month == DateTime.Now.Month)
                    .FirstOrDefaultAsync();

                if (budget == null) return null;

                return new BudgetDto
                {
                    BudgetId = budget.BudgetId,
                    Year = budget.Year,
                    Month = budget.Month,
                    TotalAmount = budget.TotalAmount,
                    UsedAmount = budget.UsedAmount,
                    RemainingAmount = budget.RemainingAmount,
                    CreatedAt = budget.CreatedAt
                };
            }
        }
    }
}
