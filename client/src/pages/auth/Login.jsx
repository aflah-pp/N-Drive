import { AuthLayout } from '../../components/layout/auth-layout';
import { LoginForm } from './form/login-form';

export default function Login() {
  return (
    <AuthLayout>
      <div className="flex  w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
}
