import React, { useState } from 'react';
import api from '../../services/api';
import { CitizenStatus } from '../../types';

const CitizenStatusCheck: React.FC = () => {
  const [identityNumber, setIdentityNumber] = useState<string>('123456789');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citizenStatus, setCitizenStatus] = useState<CitizenStatus | null>(null);

  const checkStatus = async () => {
    if (!identityNumber || identityNumber.length !== 9) {
      setError('אנא הזן מספר זהות תקין (9 ספרות)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/citizen/status/${identityNumber}`);
      setCitizenStatus(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בבדיקת סטטוס');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '20px',
        marginBottom: '30px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '28px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          👤 פורטל אזרח
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
          בדיקת סטטוס בקשת החזר מס
        </p>
      </div>

      {/* Status Check Form */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '20px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 25px 0', color: '#002147', fontSize: '20px', textAlign: 'center' }}>
          🔍 בדיקת סטטוס אישי
        </h3>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'stretch', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              מספר זהות (9 ספרות)
            </label>
            <input
              type="text"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="הזן מספר זהות"
              maxLength={9}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                textAlign: 'center',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#007bff';
                e.target.style.boxShadow = '0 0 10px rgba(0, 123, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <button
            onClick={checkStatus}
            disabled={loading}
            style={{
              padding: '15px 40px',
              background: 'linear-gradient(135deg, #007bff, #0056b3)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s ease',
              alignSelf: 'flex-end'
            }}
          >
            {loading ? '⏳ בודק...' : '🔍 בדוק סטטוס'}
          </button>
        </div>

        {/* Sample IDs */}
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#666'
        }}>
          <strong>מספרי זהות לדוגמה:</strong>
          <div style={{ marginTop: '10px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIdentityNumber('123456789')}
              style={{
                padding: '8px 15px',
                background: '#e9ecef',
                border: '1px solid #ced4da',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              דוד כהן (123456789)
            </button>
            <button
              onClick={() => setIdentityNumber('987654321')}
              style={{
                padding: '8px 15px',
                background: '#e9ecef',
                border: '1px solid #ced4da',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              שרה לוי (987654321)
            </button>
            <button
              onClick={() => setIdentityNumber('456789123')}
              style={{
                padding: '8px 15px',
                background: '#e9ecef',
                border: '1px solid #ced4da',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              משה גולדברג (456789123)
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Citizen Status Results */}
      {citizenStatus && (
        <div style={{
          background: 'white',
          borderRadius: '15px',
          overflow: 'hidden',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            padding: '20px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            📋 סטטוס אזרח: {citizenStatus.firstName} {citizenStatus.lastName}
          </div>
          
          <div style={{ padding: '25px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '25px'
            }}>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>תעודת זהות</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {citizenStatus.identityNumber}
                </div>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>שם מלא</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {citizenStatus.firstName} {citizenStatus.lastName}
                </div>
              </div>
            </div>

            {/* Last Request */}
            {citizenStatus.lastRequest && (
              <div style={{
                background: '#e3f2fd',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #bbdefb',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#1565c0', fontSize: '16px' }}>
                  📄 בקשה אחרונה
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#666' }}>מספר בקשה:</span>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      #{citizenStatus.lastRequest.requestId}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#666' }}>שנת מס:</span>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {citizenStatus.lastRequest.taxYear}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#666' }}>סטטוס:</span>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      <span style={{
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        background: citizenStatus.lastRequest.status === 'PendingCalculation' ? '#fff3cd' : 
                                      citizenStatus.lastRequest.status === 'Calculated' ? '#d1ecf1' :
                                      citizenStatus.lastRequest.status === 'Approved' ? '#d4edda' : '#f8d7da',
                        color: citizenStatus.lastRequest.status === 'PendingCalculation' ? '#856404' : 
                              citizenStatus.lastRequest.status === 'Calculated' ? '#0c5460' :
                              citizenStatus.lastRequest.status === 'Approved' ? '#155724' : '#721c24'
                      }}>
                        {citizenStatus.lastRequest.status === 'PendingCalculation' ? 'ממתין חישוב' :
                         citizenStatus.lastRequest.status === 'Calculated' ? 'חושב' :
                         citizenStatus.lastRequest.status === 'Approved' ? 'אושר' : 'נדחה'}
                      </span>
                    </div>
                  </div>
                  {citizenStatus.lastRequest.calculatedAmount && (
                    <div>
                      <span style={{ fontSize: '14px', color: '#666' }}>סכום מחושב:</span>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
                        ₪{citizenStatus.lastRequest.calculatedAmount.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {citizenStatus.lastRequest.approvedAmount && (
                    <div>
                      <span style={{ fontSize: '14px', color: '#666' }}>סכום מאושר:</span>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
                        ₪{citizenStatus.lastRequest.approvedAmount.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Request History */}
            {citizenStatus.requestHistory.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>
                  📚 היסטוריית בקשות
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>מספר</th>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>שנה</th>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>סטטוס</th>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>מחושב</th>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>מאושר</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citizenStatus.requestHistory.map((request, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>{request.requestId}</td>
                          <td style={{ padding: '10px' }}>{request.taxYear}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '15px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              background: request.status === 'PendingCalculation' ? '#fff3cd' : 
                                            request.status === 'Calculated' ? '#d1ecf1' :
                                            request.status === 'Approved' ? '#d4edda' : '#f8d7da',
                              color: request.status === 'PendingCalculation' ? '#856404' : 
                                    request.status === 'Calculated' ? '#0c5460' :
                                    request.status === 'Approved' ? '#155724' : '#721c24'
                            }}>
                              {request.status === 'PendingCalculation' ? 'ממתין' :
                               request.status === 'Calculated' ? 'חושב' :
                               request.status === 'Approved' ? 'אושר' : 'נדחה'}
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>
                            {request.calculatedAmount ? `₪${request.calculatedAmount.toLocaleString()}` : '-'}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {request.approvedAmount ? `₪${request.approvedAmount.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p style={{ color: '#666' }}>בודק סטטוס...</p>
        </div>
      )}
    </div>
  );
};

export default CitizenStatusCheck;
