import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAuthStore from '../service/store/authStore';

export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuthStore();
  const { isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
