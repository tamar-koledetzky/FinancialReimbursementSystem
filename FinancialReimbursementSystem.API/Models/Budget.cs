using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinancialReimbursementSystem.Models
{
    [Table("Budgets")]
    public class Budget
    {
        [Key]
        public int BudgetId { get; set; }

        public int Year { get; set; }

        public int Month { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UsedAmount { get; set; } = 0;

        [NotMapped] // This is calculated in the database
        public decimal RemainingAmount => TotalAmount - UsedAmount;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
