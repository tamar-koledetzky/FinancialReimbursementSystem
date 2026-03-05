import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClerkDashboard from './components/clerk/ClerkDashboard';
import ClerkRequestDetails from './components/clerk/ClerkRequestDetails';
import CitizenStatusCheck from './components/citizen/CitizenStatusCheck';
import './styles/hebrew.css';

function App() {
  return (
    <Router>
      <div className="rtl-container min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        direction: 'rtl'
      }}>
        {/* Header */}
        <header style={{
          background: 'linear-gradient(90deg, #002147 0%, #003d82 50%, #002147 100%)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          position: 'relative'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '15px 30px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Israeli Flag Colors */}
            <div style={{
              width: '40px',
              height: '30px',
              background: 'white',
              position: 'relative',
              marginRight: '15px',
              border: '1px solid #ddd'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                right: '0',
                height: '2px',
                background: '#0038b8',
                transform: 'translateY(-50%)'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '0',
                height: '0',
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '12px solid #0038b8'
              }}></div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 className="hebrew-fix" style={{ 
                  color: 'white', 
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                ברוכים הבאים למערכת החזרי מס
              </h1>
              <p className="hebrew-fix" style={{ 
                color: '#ffd700', 
                margin: '5px 0 0 0',
                fontSize: '14px'
              }}>
                משרד האוצר - מנהל הכנסה
              </p>
            </div>
            
            <nav style={{ marginLeft: 'auto', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Link
                to="/clerk"
                className="link-hebrew"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                פורטל עובד
              </Link>
              <Link
                to="/citizen"
                className="link-hebrew"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  background: 'rgba(255,215,0,0.3)',
                  border: '1px solid rgba(255,215,0,0.5)',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                פורטל אזרח
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px 20px'
        }}>
          <Routes>
            <Route path="/" element={
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: '20px',
                padding: '60px 40px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <h2 className="hebrew-fix" style={{ 
                  color: '#002147',
                  fontSize: '32px',
                  marginBottom: '20px',
                  fontWeight: 'bold'
                }}>
                  ברוכים הבאים למערכת החזרי מס
                </h2>
                <p className="hebrew-fix" style={{ 
                  color: '#666',
                  fontSize: '18px',
                  marginBottom: '40px',
                  lineHeight: '1.6'
                }}>
                  אנא בחרו את סוג הכניסה הרצויה להמשיך
                </p>
                
                <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to="/clerk"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '20px 40px',
                      borderRadius: '15px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease',
                      border: 'none'
                    }}
                  >
                    <span className="hebrew-fix" style={{ marginLeft: '10px' }}>🏢</span>
                    כניסת עובד
                  </Link>
                  <Link
                    to="/citizen"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '20px 40px',
                      borderRadius: '15px',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 25px rgba(240, 147, 251, 0.4)',
                      transition: 'all 0.3s ease',
                      border: 'none'
                    }}
                  >
                    <span className="hebrew-fix" style={{ marginLeft: '10px' }}>👤</span>
                    כניסת אזרח
                  </Link>
                </div>
              </div>
            } />
            <Route path="/clerk" element={<ClerkDashboard />} />
            <Route path="/clerk/requests/:requestId" element={<ClerkRequestDetails />} />
            <Route path="/citizen" element={<CitizenStatusCheck />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{
          background: '#002147',
          color: 'white',
          textAlign: 'center',
          padding: '20px',
          marginTop: '50px'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            © 2024 משרד האוצר - כל הזכויות שמורות | גרסה 1.0
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
