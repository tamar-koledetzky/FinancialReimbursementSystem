using Microsoft.AspNetCore.Mvc;
using FinancialReimbursementSystem.Dtos;
using FinancialReimbursementSystem.Services;

namespace FinancialReimbursementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CitizenController : ControllerBase
    {
        private readonly IReimbursementService _reimbursementService;

        public CitizenController(IReimbursementService reimbursementService)
        {
            _reimbursementService = reimbursementService;
        }

        [HttpGet("status/{identityNumber}")]
        public async Task<ActionResult<CitizenStatusDto>> GetCitizenStatus(string identityNumber)
        {
            var status = await _reimbursementService.GetCitizenStatusAsync(identityNumber);
            if (status == null)
            {
                return NotFound("Citizen not found");
            }
            return Ok(status);
        }
    }
}
