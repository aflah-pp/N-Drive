import { SignupForm } from './form/register-form';

export default function Register() {
  return (
    <div
      className="h-dvh w-full overflow-hidden bg-[var(--background)] antialiased
        p-2 sm:p-4 md:p-6 flex items-center justify-center"
    >
      <div className="w-full max-w-6xl h-full max-h-[720px]">
        <SignupForm className="h-full" />
      </div>
    </div>
  );
}
