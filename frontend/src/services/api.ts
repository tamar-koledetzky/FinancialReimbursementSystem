import axios from 'axios';
import { ReimbursementRequest, EligibilityResult, ApprovalResult, Budget, CitizenStatus } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clerk API endpoints
export const clerkApi = {
  getPendingRequests: async (): Promise<ReimbursementRequest[]> => {
    const response = await api.get('/clerk/pending-requests');
    return response.data;
  },

  getRequestDetails: async (requestId: number): Promise<ReimbursementRequest> => {
    const response = await api.get(`/clerk/request-details/${requestId}`);
    return response.data;
  },

  calculateEligibility: async (requestId: number): Promise<EligibilityResult> => {
    const response = await api.post('/clerk/calculate-eligibility', { requestId });
    return response.data;
  },

  approveReimbursement: async (requestId: number, approvedAmount: number, clerkId: number): Promise<ApprovalResult> => {
    const response = await api.post('/clerk/approve-reimbursement', {
      requestId,
      approvedAmount,
      clerkId,
    });
    return response.data;
  },

  rejectReimbursement: async (requestId: number, clerkId: number): Promise<ApprovalResult> => {
    const response = await api.post('/clerk/reject-reimbursement', {
      requestId,
      clerkId,
    });
    return response.data;
  },

  getCurrentBudget: async (): Promise<Budget> => {
    const response = await api.get('/clerk/current-budget');
    return response.data;
  },
};

// Citizen API endpoints
export const citizenApi = {
  getCitizenStatus: async (identityNumber: string): Promise<CitizenStatus> => {
    const response = await api.get(`/citizen/status/${identityNumber}`);
    return response.data;
  },
};

export default api;
