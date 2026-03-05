import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReimbursementRequest, Citizen, MonthlyIncome } from '../../types';
import { clerkApi } from '../../services/api';

interface RequestWithDetails extends ReimbursementRequest {
  citizen: Citizen;
  monthlyIncomes: MonthlyIncome[];
  pastRequests: ReimbursementRequest[];
}

const ClerkDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await clerkApi.getPendingRequests();
      const requestsWithDetails = await Promise.all(
        data.map(async (request) => {
          const details = await clerkApi.getRequestDetails(request.requestId);
          return {
            ...request,
            citizen: {
              citizenId: details.citizenId,
              identityNumber: details.identityNumber,
              firstName: details.citizenName.split(' ')[0],
              lastName: details.citizenName.split(' ')[1] || '',
              email: '',
              phone: '',
              createdAt: details.requestDate
            },
            monthlyIncomes: details.monthlyIncomes,
            pastRequests: details.pastRequests
          };
        })
      );
      setRequests(requestsWithDetails);
      setError(null);
    } catch (err) {
      setError('Failed to load requests');
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = (request: RequestWithDetails) => {
    setSelectedRequest(request);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
  };

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

  if (error) {
    return (
      <div className="rtl-container" style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        <div className="hebrew-fix" style={{ fontSize: '18px', color: '#ff6b6b' }}>
          {error}
        </div>
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
        <h1 className="hebrew-fix" style={{
          color: '#002147',
          fontSize: '32px',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          פורטל ניהול בקשות
        </h1>
        <p className="hebrew-fix" style={{
          color: '#666',
          fontSize: '16px',
          textAlign: 'center',
          marginBottom: '0'
        }}>
          כל הבקשות הממתינות לאישור כולל פרטי האזרח ותאריך הבקשה
        </p>
      </div>

      {/* Requests Table */}
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
          בקשות ממתינות ({requests.length})
        </h2>

        {requests.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
            <h3 className="hebrew-fix" style={{ fontSize: '20px', marginBottom: '10px' }}>
              אין בקשות ממתינות
            </h3>
            <p className="hebrew-fix">כל הבקשות טופלו</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>מספר בקשה</th>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>שם אזרח</th>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>תעודת זהות</th>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>שנת מס</th>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>תאריך בקשה</th>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>סטטוס</th>
                  <th className="hebrew-fix" style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr 
                    key={request.requestId} 
                    style={{ 
                      borderBottom: '1px solid #dee2e6',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => handleRequestClick(request)}
                  >
                    <td style={{ padding: '15px' }}>{request.requestId}</td>
                    <td style={{ padding: '15px' }}>{request.citizenName}</td>
                    <td style={{ padding: '15px' }}>{request.identityNumber}</td>
                    <td style={{ padding: '15px' }}>{request.taxYear}</td>
                    <td style={{ padding: '15px' }}>{formatDate(request.requestDate)}</td>
                    <td style={{ padding: '15px' }}>
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
                    </td>
                    <td style={{ padding: '15px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clerk/requests/${request.requestId}`);
                        }}
                        className="btn-hebrew"
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #007bff',
                          borderRadius: '6px',
                          fontSize: '12px',
                          background: '#007bff',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        פרטים
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="hebrew-fix" style={{ fontSize: '24px', color: '#002147', margin: 0 }}>
                פרטי בקשה #{selectedRequest.requestId}
              </h2>
              <button
                onClick={handleCloseDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {/* Citizen Details */}
            <div style={{ marginBottom: '20px' }}>
              <h3 className="hebrew-fix" style={{ fontSize: '18px', color: '#002147', marginBottom: '10px' }}>
                פרטי אזרח
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <span className="hebrew-fix" style={{ fontWeight: 'bold' }}>שם: </span>
                  <span className="hebrew-fix">{selectedRequest.citizenName}</span>
                </div>
                <div>
                  <span className="hebrew-fix" style={{ fontWeight: 'bold' }}>תעודת זהות: </span>
                  <span className="hebrew-fix">{selectedRequest.identityNumber}</span>
                </div>
              </div>
            </div>

            {/* Income Details */}
            <div style={{ marginBottom: '20px' }}>
              <h3 className="hebrew-fix" style={{ fontSize: '18px', color: '#002147', marginBottom: '10px' }}>
                פרטי ההכנסות של האזרח על פי שנים
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th className="hebrew-fix" style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>חודש</th>
                      <th className="hebrew-fix" style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>הכנסה גולמית</th>
                      <th className="hebrew-fix" style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>הכנסה נטו</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.monthlyIncomes.map((income) => (
                      <tr key={income.incomeId}>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          {new Date(income.year, income.month - 1).toLocaleDateString('he-IL', { month: 'long' })} {income.year}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          {formatCurrency(income.grossIncome)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          {formatCurrency(income.netIncome)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Past Requests */}
            <div style={{ marginBottom: '20px' }}>
              <h3 className="hebrew-fix" style={{ fontSize: '18px', color: '#002147', marginBottom: '10px' }}>
                בקשות עבר של האזרח כולל ההחזר שהוא קיבל
              </h3>
              {selectedRequest.pastRequests.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th className="hebrew-fix" style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>שנת מס</th>
                        <th className="hebrew-fix" style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>תאריך</th>
                        <th className="hebrew-fix" style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>סטטוס</th>
                        <th className="hebrew-fix" style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>סכום מאושר</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.pastRequests.map((pastRequest) => (
                        <tr key={pastRequest.requestId}>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{pastRequest.taxYear}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{formatDate(pastRequest.requestDate)}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{pastRequest.status}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
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

            {/* Current Request Details */}
            <div>
              <h3 className="hebrew-fix" style={{ fontSize: '18px', color: '#002147', marginBottom: '10px' }}>
                פרטי הבקשה הנוכחית שטרם טופלה
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <span className="hebrew-fix" style={{ fontWeight: 'bold' }}>תאריך בקשה: </span>
                  <span className="hebrew-fix">{formatDate(selectedRequest.requestDate)}</span>
                </div>
                <div>
                  <span className="hebrew-fix" style={{ fontWeight: 'bold' }}>שנת מס: </span>
                  <span className="hebrew-fix">{selectedRequest.taxYear}</span>
                </div>
                <div>
                  <span className="hebrew-fix" style={{ fontWeight: 'bold' }}>סטטוס: </span>
                  <span className="hebrew-fix">{selectedRequest.status}</span>
                </div>
                {selectedRequest.calculatedAmount && (
                  <div>
                    <span className="hebrew-fix" style={{ fontWeight: 'bold' }}>סכום מחושב: </span>
                    <span className="hebrew-fix">{formatCurrency(selectedRequest.calculatedAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center',
              marginTop: '30px'
            }}>
              <button
                onClick={() => {
                  navigate(`/clerk/requests/${selectedRequest.requestId}`);
                  handleCloseDetails();
                }}
                className="btn-hebrew"
                style={{
                  padding: '12px 24px',
                  border: '1px solid #007bff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                פתח בקשה לטיפול מפורט
              </button>
              <button
                onClick={handleCloseDetails}
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
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClerkDashboard;
