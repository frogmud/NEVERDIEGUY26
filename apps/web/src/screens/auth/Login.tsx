import { Navigate } from 'react-router-dom';

// MVP: No login required - redirect to home
export function Login() {
  return <Navigate to="/" replace />;
}
