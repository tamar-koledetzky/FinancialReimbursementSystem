import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReimbursementRequest, EligibilityResult, ApprovalResult, Budget, Citizen, MonthlyIncome } from '../../types';
import { clerkApi } from '../../services/api';

interface RequestWithDetails extends ReimbursementRequest {
  citizen: Citizen;
  monthlyIncomes: MonthlyIncome[];
  pastRequests: ReimbursementRequest[];
}

const ClerkRequestDetails: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<RequestWithDetails | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(null);
  const [clerkId, setClerkId] = useState<string>('1');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  const loadRequestDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clerkApi.getRequestDetails(parseInt(requestId!));
      setRequest({
        ...data,
        citizen: {
          citizenId: data.citizenId,
          identityNumber: data.identityNumber,
          firstName: data.citizenName.split(' ')[0],
          lastName: data.citizenName.split(' ')[1] || '',
          email: '',
          phone: '',
          createdAt: data.requestDate
        },
        monthlyIncomes: data.monthlyIncomes,
        pastRequests: data.pastRequests
      });
      setError(null);
    } catch (err) {
      setError('Failed to load request details');
      console.error('Error loading request details:', err);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const loadBudget = async () => {
    try {
      const data = await clerkApi.getCurrentBudget();
      setBudget(data);
    } catch (err) {
      console.error('Error loading budget:', err);
    }
  };

  const handleCalculateEligibility = async () => {
    if (!request) return;

    try {
      setCalculating(true);
      const result = await clerkApi.calculateEligibility(request.requestId);
      setEligibilityResult(result);
      
      // Reload request details to get updated status
      await loadRequestDetails();
      await loadBudget();
      
      // Check if calculation was successful
      if (result.isEligible) {
        // Keep eligibility result for approval
        setEligibilityResult(result);
      }
    } catch (err) {
      setError('Failed to calculate eligibility');
      console.error('Error calculating eligibility:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleApproveReimbursement = async () => {
    if (!request) return;

    // Use eligibilityResult amount if available, otherwise use request.calculatedAmount
    const amountToApprove = eligibilityResult?.calculatedAmount || request.calculatedAmount || 0;
    
    if (amountToApprove <= 0) {
      setError('No valid amount to approve');
      return;
    }

    try {
      setApproving(true);
      const result = await clerkApi.approveReimbursement(
        request.requestId,
        amountToApprove,
        parseInt(clerkId)
      );
      setApprovalResult(result);
      
      // Force immediate budget refresh
      await loadBudget();
      
      // Reload request details to get updated status
      await loadRequestDetails();
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Additional budget refresh to ensure it's updated
      setTimeout(async () => {
        await loadBudget();
      }, 500);
      
      setShowApprovalDialog(false);
    } catch (err) {
      setError('Failed to approve reimbursement');
      console.error('Error approving reimbursement:', err);
    } finally {
      setApproving(false);
    }
  };

  const handleRejectReimbursement = async () => {
    if (!request) return;

    try {
      setApproving(true);
      // Call reject API (we need to create this)
      const result = await clerkApi.rejectReimbursement(
        request.requestId,
        parseInt(clerkId)
      );
      
      // Reload request details and budget
      await loadRequestDetails();
      await loadBudget();
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Show success message
      alert('הבקשה נדחתה בהצלחה');
    } catch (err) {
      setError('Failed to reject reimbursement');
      console.error('Error rejecting reimbursement:', err);
      alert('שגיאה בדחיית הבקשה');
    } finally {
      setApproving(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      loadRequestDetails();
      loadBudget();
    }
  }, [requestId, loadRequestDetails]);

  const formatCurrency = (amount: number): string => {
    return `₪${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="rtl-container" style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        <div className="hebrew-fix" style={{ fontSize: '18px', color: 'white' }}>
          טוען...
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="rtl-container" style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        <div className="hebrew-fix" style={{ fontSize: '18px', color: '#ff6b6b' }}>
          {error || 'Request not found'}
        </div>
        <button
          onClick={() => navigate('/clerk')}
          className="btn-hebrew"
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            border: '1px solid #007bff',
            borderRadius: '8px',
            fontSize: '14px',
            background: '#007bff',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          חזור לבקשות
        </button>
      </div>
    );
  }

  return (
    <div className="rtl-container" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="hebrew-fix" style={{
              color: '#002147',
              fontSize: '28px',
              marginBottom: '10px'
            }}>
              פרטי בקשה לטיפול
            </h1>
            <p className="hebrew-fix" style={{
              color: '#666',
              fontSize: '16px',
              marginBottom: '0'
            }}>
              מידע מפורט על בקשת הזכאות של האזרח ופעולות אפשריות
            </p>
          </div>
          <button
            onClick={() => navigate('/clerk')}
            className="btn-hebrew"
            style={{
              padding: '10px 20px',
              border: '1px solid #6c757d',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#6c757d',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ← חזור לרשימה
          </button>
        </div>
      </div>

      {/* Request Details */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 className="hebrew-fix" style={{
          color: '#002147',
          fontSize: '24px',
          marginBottom: '20px'
        }}>
          פרטי הבקשה
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <span className="hebrew-fix" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>מספר בקשה:</span>
            <span className="hebrew-fix">{request.requestId}</span>
          </div>
          <div>
            <span className="hebrew-fix" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>שם אזרח:</span>
            <span className="hebrew-fix">{request.citizenName}</span>
          </div>
          <div>
            <span className="hebrew-fix" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>תעודת זהות:</span>
            <span className="hebrew-fix">{request.identityNumber}</span>
          </div>
          <div>
            <span className="hebrew-fix" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>שנת מס:</span>
            <span className="hebrew-fix">{request.taxYear}</span>
          </div>
          <div>
            <span className="hebrew-fix" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>תאריך בקשה:</span>
            <span className="hebrew-fix">{formatDate(request.requestDate)}</span>
          </div>
          <div>
            <span className="hebrew-fix" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>סטטוס:</span>
            <span style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              background: request.status === 'PendingCalculation' ? '#fff3cd' : '#d1ecf1',
              color: request.status === 'PendingCalculation' ? '#856404' : '#0c5460'
            }}>
              {request.status === 'PendingCalculation' ? 'ממתין חישוב' : 'חושב'}
            </span>
          </div>
        </div>

        {request.calculatedAmount && (
          <div style={{ marginBottom: '20px' }}>
            <span className="hebrew-fix" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>סכום מחושב:</span>
            <span className="hebrew-fix" style={{ fontSize: '18px', color: '#28a745', fontWeight: 'bold' }}>
              {formatCurrency(request.calculatedAmount)}
            </span>
          </div>
        )}

        {request.approvedAmount && (
          <div style={{ marginBottom: '20px' }}>
            <span className="hebrew-fix" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>סכום מאושר:</span>
            <span className="hebrew-fix" style={{ fontSize: '18px', color: '#007bff', fontWeight: 'bold' }}>
              {formatCurrency(request.approvedAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Income Details */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 className="hebrew-fix" style={{
          color: '#002147',
          fontSize: '24px',
          marginBottom: '20px'
        }}>
          פרטי ההכנסות של האזרח על פי שנים
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>חודש</th>
                <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>הכנסה גולמית</th>
                <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>הכנסה נטו</th>
              </tr>
            </thead>
            <tbody>
              {request.monthlyIncomes.map((income) => (
                <tr key={income.incomeId}>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    {new Date(income.year, income.month - 1).toLocaleDateString('he-IL', { month: 'long' })} {income.year}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    {formatCurrency(income.grossIncome)}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    {formatCurrency(income.netIncome)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Requests */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 className="hebrew-fix" style={{
          color: '#002147',
          fontSize: '24px',
          marginBottom: '20px'
        }}>
          בקשות עבר של האזרח כולל ההחזר שהוא קיבל
        </h2>
        
        {request.pastRequests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>שנת מס</th>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>תאריך</th>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>סטטוס</th>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>סכום מאושר</th>
                </tr>
              </thead>
              <tbody>
                {request.pastRequests.map((pastRequest) => (
                  <tr key={pastRequest.requestId}>
                    <td style={{ padding: '15px', textAlign: 'right' }}>{pastRequest.taxYear}</td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>{formatDate(pastRequest.requestDate)}</td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>{pastRequest.status}</td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      {pastRequest.approvedAmount ? formatCurrency(pastRequest.approvedAmount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="hebrew-fix" style={{ color: '#666' }}>אין בקשות עבר</p>
        )}
      </div>

      {/* Budget Information - Always Show */}
      <div style={{
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(40, 167, 69, 0.3)',
        color: 'white'
      }}>
        <h2 className="hebrew-fix" style={{
          color: 'white',
          fontSize: '24px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          💰 התקציב העומד לרשות הפקיד
        </h2>
        
        {budget ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              <div className="hebrew-fix" style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.9 }}>תקציב כולל</div>
              <div className="hebrew-fix" style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(budget.totalAmount)}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              <div className="hebrew-fix" style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.9 }}>תקציב בשימוש</div>
              <div className="hebrew-fix" style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(budget.usedAmount)}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
              <div className="hebrew-fix" style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.9 }}>תקציב נותר</div>
              <div className="hebrew-fix" style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700' }}>
                {formatCurrency(budget.remainingAmount)}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="hebrew-fix" style={{ fontSize: '16px', opacity: 0.8 }}>
              טוען מידע תקציב...
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 className="hebrew-fix" style={{
          color: '#002147',
          fontSize: '24px',
          marginBottom: '20px'
        }}>
          פעולות אפשריות
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label className="hebrew-fix" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            מזהה פקיד:
          </label>
          <input
            type="text"
            value={clerkId}
            onChange={(e) => setClerkId(e.target.value)}
            className="input-hebrew"
            style={{
              width: '200px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="הכנס מזהה פקיד"
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Show calculate button only for PendingCalculation status */}
          {request.status === 'PendingCalculation' && (
            <button
              onClick={handleCalculateEligibility}
              disabled={calculating}
              className="btn-hebrew"
              style={{
                padding: '15px 30px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #007bff, #0056b3)',
                color: 'white',
                cursor: calculating ? 'not-allowed' : 'pointer',
                opacity: calculating ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {calculating ? '⏳ מחשב...' : '🧮 בצע חישוב זכאות'}
            </button>
          )}

          {/* Show approve/reject buttons for Calculated status (after calculation) or Approved/Rejected status */}
          {(request.status === 'Calculated' || request.status === 'Approved' || request.status === 'Rejected') && (
            <>
              <button
                onClick={() => setShowApprovalDialog(true)}
                disabled={approving || request.status === 'Approved' || request.status === 'Rejected'}
                className="btn-hebrew"
                style={{
                  padding: '15px 30px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: request.status === 'Approved' || request.status === 'Rejected'
                    ? 'linear-gradient(135deg, #6c757d, #5a6268)' 
                    : 'linear-gradient(135deg, #28a745, #20c997)',
                  color: 'white',
                  cursor: (approving || request.status === 'Approved' || request.status === 'Rejected') ? 'not-allowed' : 'pointer',
                  opacity: (approving || request.status === 'Approved' || request.status === 'Rejected') ? 0.7 : 1,
                  boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {request.status === 'Approved' ? '✅ אושר כבר' : 
                 request.status === 'Rejected' ? '❌ נדחה כבר' : 
                 (approving ? '⏳ מאשר...' : '✅ אשר בקשה')}
              </button>
              
              <button
                onClick={() => {
                  if (request.status === 'Rejected' || request.status === 'Approved') {
                    alert('הבקשה כבר טופלה');
                    return;
                  }
                  handleRejectReimbursement();
                }}
                disabled={approving || request.status === 'Approved' || request.status === 'Rejected'}
                className="btn-hebrew"
                style={{
                  padding: '15px 30px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: request.status === 'Approved' || request.status === 'Rejected'
                    ? 'linear-gradient(135deg, #6c757d, #5a6268)' 
                    : 'linear-gradient(135deg, #dc3545, #c82333)',
                  color: 'white',
                  cursor: (approving || request.status === 'Approved' || request.status === 'Rejected') ? 'not-allowed' : 'pointer',
                  opacity: (approving || request.status === 'Approved' || request.status === 'Rejected') ? 0.7 : 1,
                  boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {request.status === 'Rejected' ? '❌ נדחה כבר' : 
                 request.status === 'Approved' ? '✅ אושר כבר' : 
                 (approving ? '⏳ דוחה...' : '❌ דחה בקשה')}
              </button>
            </>
          )}
        </div>

        {eligibilityResult && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            borderRadius: '8px',
            background: eligibilityResult.isEligible ? '#d4edda' : '#f8d7da',
            border: `1px solid ${eligibilityResult.isEligible ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <h3 className="hebrew-fix" style={{
              fontSize: '18px',
              marginBottom: '10px',
              color: eligibilityResult.isEligible ? '#155724' : '#721c24'
            }}>
              תוצאת חישוב זכאות
            </h3>
            <p className="hebrew-fix" style={{
              marginBottom: '10px',
              color: eligibilityResult.isEligible ? '#155724' : '#721c24'
            }}>
              {eligibilityResult.message}
            </p>
            {eligibilityResult.isEligible && (
              <p className="hebrew-fix" style={{
                color: '#155724',
                fontWeight: 'bold'
              }}>
                גובה הזכאות הניתנת לאזרח: {formatCurrency(eligibilityResult.calculatedAmount)}
              </p>
            )}
          </div>
        )}

        {approvalResult && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            borderRadius: '8px',
            background: approvalResult.isApproved ? '#d4edda' : '#f8d7da',
            border: `1px solid ${approvalResult.isApproved ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <h3 className="hebrew-fix" style={{
              fontSize: '18px',
              marginBottom: '10px',
              color: approvalResult.isApproved ? '#155724' : '#721c24'
            }}>
              תוצאת אישור
            </h3>
            <p className="hebrew-fix" style={{
              color: approvalResult.isApproved ? '#155724' : '#721c24'
            }}>
              {approvalResult.message}
            </p>
            {approvalResult.isApproved && (
              <p className="hebrew-fix" style={{
                color: '#155724',
                fontWeight: 'bold'
              }}>
                תקציב נותר: {formatCurrency(approvalResult.remainingBudget)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Approval Confirmation Dialog */}
      {showApprovalDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 className="hebrew-fix" style={{
              fontSize: '20px',
              color: '#002147',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              אישור החזר מס
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <p className="hebrew-fix" style={{ marginBottom: '10px' }}>
                <strong>שם אזרח:</strong> {request.citizenName}
              </p>
              <p className="hebrew-fix" style={{ marginBottom: '10px' }}>
                <strong>תעודת זהות:</strong> {request.identityNumber}
              </p>
              <p className="hebrew-fix" style={{ marginBottom: '10px' }}>
                <strong>שנת מס:</strong> {request.taxYear}
              </p>
              <p className="hebrew-fix" style={{ marginBottom: '10px' }}>
                <strong>סכום לאישור:</strong> {formatCurrency(eligibilityResult?.calculatedAmount || request.calculatedAmount || 0)}
              </p>
              <p className="hebrew-fix" style={{ marginBottom: '10px' }}>
                <strong>מזהה פקיד:</strong> {clerkId}
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  handleApproveReimbursement();
                }}
                disabled={approving}
                className="btn-hebrew"
                style={{
                  padding: '12px 24px',
                  border: '1px solid #28a745',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#28a745',
                  color: 'white',
                  cursor: approving ? 'not-allowed' : 'pointer',
                  opacity: approving ? 0.7 : 1
                }}
              >
                {approving ? 'מאשר...' : 'אשר'}
              </button>
              <button
                onClick={() => setShowApprovalDialog(false)}
                className="btn-hebrew"
                style={{
                  padding: '12px 24px',
                  border: '1px solid #6c757d',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#6c757d',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClerkRequestDetails;
