using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinancialReimbursementSystem.Models
{
    public enum RequestStatus
    {
        PendingCalculation,
        Calculated,
        Approved,
        Rejected
    }

    [Table("ReimbursementRequests")]
    public class ReimbursementRequest
    {
        [Key]
        public int RequestId { get; set; }

        [ForeignKey("Citizen")]
        public int CitizenId { get; set; }

        public int TaxYear { get; set; }

        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Status { get; set; } = "PendingCalculation";

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CalculatedAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ApprovedAmount { get; set; }

        public DateTime? CalculationDate { get; set; }

        public DateTime? ApprovalDate { get; set; }

        public int? ClerkId { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Citizen Citizen { get; set; } = null!;
    }
}
