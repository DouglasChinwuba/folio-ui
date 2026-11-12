
import './Header.css';
import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import log from 'loglevel';
import axios from 'axios';

log.setLevel('info');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Header() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError('');

      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      // Send token to your FastAPI backend
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/endpoints/auth/google`,
        {
          id_token: idToken,
        }
      );

      // Store authentication information
      localStorage.setItem('token', idToken);
      localStorage.setItem('user', JSON.stringify(response.data));

      log.info('Google sign-in successful');
      navigate('/dashboard');

    } catch (error) {
      log.error('Error signing in:', error);
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="login-header">
      <button
        className="sign-in-button"
        onClick={signInWithGoogle}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>

      {error && <p className="sign-in-error">{error}</p>}
    </header>
  );
}

export default Header;
