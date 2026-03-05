export interface Citizen {
  citizenId: number;
  identityNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface MonthlyIncome {
  incomeId: number;
  citizenId: number;
  year: number;
  month: number;
  grossIncome: number;
  netIncome: number;
  createdAt: string;
}

export enum RequestStatus {
  PendingCalculation = 'PendingCalculation',
  Calculated = 'Calculated',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export interface ReimbursementRequest {
  requestId: number;
  citizenId: number;
  citizenName: string;
  identityNumber: string;
  taxYear: number;
  requestDate: string;
  status: RequestStatus;
  calculatedAmount?: number;
  approvedAmount?: number;
  calculationDate?: string;
  approvalDate?: string;
  clerkId?: number;
  notes?: string;
  monthlyIncomes: MonthlyIncome[];
  pastRequests: ReimbursementRequest[];
}

export interface EligibilityResult {
  isEligible: boolean;
  calculatedAmount: number;
  errorMessage?: string;
  message: string;
}

export interface ApprovalResult {
  isApproved: boolean;
  errorMessage?: string;
  message: string;
  remainingBudget: number;
}

export interface Budget {
  budgetId: number;
  year: number;
  month: number;
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  createdAt: string;
}

export interface CitizenStatus {
  identityNumber: string;
  firstName: string;
  lastName: string;
  lastRequest?: ReimbursementRequest;
  requestHistory: ReimbursementRequest[];
}
