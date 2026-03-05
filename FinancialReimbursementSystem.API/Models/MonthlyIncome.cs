using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinancialReimbursementSystem.Models
{
    [Table("MonthlyIncome")]
    public class MonthlyIncome
    {
        [Key]
        public int IncomeId { get; set; }

        [ForeignKey("Citizen")]
        public int CitizenId { get; set; }

        public int Year { get; set; }

        [Range(1, 12)]
        public int Month { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal GrossIncome { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal NetIncome { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Citizen Citizen { get; set; } = null!;
    }
}
