using Microsoft.EntityFrameworkCore;
using FinancialReimbursementSystem.Models;

namespace FinancialReimbursementSystem.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Citizen> Citizens { get; set; }
        public DbSet<MonthlyIncome> MonthlyIncomes { get; set; }
        public DbSet<ReimbursementRequest> ReimbursementRequests { get; set; }
        public DbSet<Budget> Budgets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Citizen
            modelBuilder.Entity<Citizen>(entity =>
            {
                entity.HasKey(e => e.CitizenId);
                entity.Property(e => e.IdentityNumber).IsRequired().HasMaxLength(9);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(255);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.HasIndex(e => e.IdentityNumber).IsUnique();
            });

            // Configure MonthlyIncome
            modelBuilder.Entity<MonthlyIncome>(entity =>
            {
                entity.HasKey(e => e.IncomeId);
                entity.Property(e => e.GrossIncome).HasColumnType("decimal(18,2)");
                entity.Property(e => e.NetIncome).HasColumnType("decimal(18,2)");
                entity.HasOne(e => e.Citizen).WithMany(c => c.MonthlyIncomes).HasForeignKey(e => e.CitizenId);
                entity.HasIndex(e => new { e.CitizenId, e.Year }).IsUnique();
                entity.HasCheckConstraint("CK_MonthlyIncome_Month", "Month BETWEEN 1 AND 12");
                entity.HasCheckConstraint("CK_MonthlyIncome_Income", "GrossIncome >= 0 AND NetIncome >= 0");
            });

            // Configure ReimbursementRequest
            modelBuilder.Entity<ReimbursementRequest>(entity =>
            {
                entity.HasKey(e => e.RequestId);
                entity.Property(e => e.CalculatedAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ApprovedAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.HasOne(e => e.Citizen).WithMany(c => c.ReimbursementRequests).HasForeignKey(e => e.CitizenId);
                entity.HasIndex(e => new { e.CitizenId, e.Status });
                entity.HasIndex(e => new { e.Status, e.TaxYear });
                entity.HasCheckConstraint("CK_ReimbursementRequests_Amounts", "CalculatedAmount >= 0 AND ApprovedAmount >= 0");
            });

            // Configure Budget
            modelBuilder.Entity<Budget>(entity =>
            {
                entity.HasKey(e => e.BudgetId);
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.UsedAmount).HasColumnType("decimal(18,2)");
                entity.HasIndex(e => new { e.Year, e.Month }).IsUnique();
            });
        }
    }
}
