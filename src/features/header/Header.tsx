import './Header.css';
import {signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import log from 'loglevel';
import axios from 'axios';


log.setLevel("info");

function Header(){
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try{
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      log.info('Google user:', user);
      log.info('ID token:', idToken);

      // Send token to your FastAPI backend
      const response = await axios.post('http://127.0.0.1:8000/api/v1/endpoints/auth/google', {
        id_token: idToken
      });

      log.info('Backend response:', response.data);

      localStorage.setItem('token', idToken);
      localStorage.setItem('user', JSON.stringify(response.data));

      log.info('Google user:', user);
      navigate('/dashboard');
    }catch(error){
      log.error("Error occurred: ", error);
    }
  }

  return(
    <header>
      <button className='sign-in-button' onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </header>
  )
}

export default Header;