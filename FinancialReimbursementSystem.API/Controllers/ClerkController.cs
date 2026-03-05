using Microsoft.AspNetCore.Mvc;
using FinancialReimbursementSystem.Dtos;
using FinancialReimbursementSystem.Services;

namespace FinancialReimbursementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClerkController : ControllerBase
    {
        private readonly IReimbursementService _reimbursementService;

        public ClerkController(IReimbursementService reimbursementService)
        {
            _reimbursementService = reimbursementService;
        }

        [HttpGet("pending-requests")]
        public async Task<ActionResult<List<ReimbursementRequestDto>>> GetPendingRequests()
        {
            var requests = await _reimbursementService.GetPendingRequestsAsync();
            return Ok(requests);
        }

        [HttpGet("request-details/{requestId}")]
        public async Task<ActionResult<ReimbursementRequestDto>> GetRequestDetails(int requestId)
        {
            var request = await _reimbursementService.GetRequestDetailsAsync(requestId);
            if (request == null)
            {
                return NotFound("Request not found");
            }
            return Ok(request);
        }

        [HttpPost("calculate-eligibility")]
        public async Task<ActionResult<EligibilityResultDto>> CalculateEligibility([FromBody] CalculateEligibilityDto dto)
        {
            var result = await _reimbursementService.CalculateEligibilityAsync(dto.RequestId);
            return Ok(result);
        }

        [HttpPost("approve-reimbursement")]
        public async Task<ActionResult<ApprovalResultDto>> ApproveReimbursement([FromBody] ApproveReimbursementDto dto)
        {
            var result = await _reimbursementService.ApproveReimbursementAsync(dto);
            return Ok(result);
        }

        [HttpPost("reject-reimbursement")]
        public async Task<ActionResult<ApprovalResultDto>> RejectReimbursement([FromBody] RejectReimbursementDto dto)
        {
            var result = await _reimbursementService.RejectReimbursementAsync(dto);
            return Ok(result);
        }

        [HttpGet("current-budget")]
        public async Task<ActionResult<BudgetDto>> GetCurrentBudget()
        {
            var budget = await _reimbursementService.GetCurrentBudgetAsync();
            if (budget == null)
            {
                return NotFound("No budget found for current month");
            }
            return Ok(budget);
        }
    }
}
