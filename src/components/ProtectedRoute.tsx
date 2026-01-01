import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import type { JSX } from 'react';


const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } : any = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;