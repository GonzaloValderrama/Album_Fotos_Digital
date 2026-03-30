import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert(error.message || 'Error de autenticación.');
    }
  };

  return (
    <div className="full-center" style={{ background: '#f9fafb' }}>
      <div style={{
        background: 'white',
        padding: '3rem 4rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#111827' }}>Admin Panel</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Sign in to manage your portfolio.</p>
        
        <button 
          onClick={handleLogin}
          className="btn btn-primary"
          style={{ width: '100%', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="G" 
            style={{ width: 18, height: 18 }}
          />
          Acceder con Google
        </button>
      </div>
    </div>
  );
};

export default Login;
