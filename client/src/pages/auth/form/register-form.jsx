import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Cloud, Eye, EyeOff, Phone, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { registerUser } from '@/service/endpoints/auth';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    first_name: z.string().trim().max(150, 'First name is too long.'),
    last_name: z.string().trim().max(150, 'Last name is too long.'),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters.')
      .max(150, 'Username is too long.')
      .regex(/^[\w.@+-]+$/, 'Use letters, numbers and @/./+/-/_ only.'),
    email: z.string().trim().email('Enter a valid email address.'),
    phone: z
      .string()
      .trim()
      .min(1, 'Phone number is required.')
      .refine(
        (v) => /^(\+91|91)?[6-9]\d{9}$/.test(v.replace(/[\s()-]/g, '')),
        'Enter a valid Indian mobile number (e.g. +91 98765 43210).',
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .refine((v) => !/^\d+$/.test(v), 'Password can’t be entirely numeric.'),
    password2: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((d) => d.password === d.password2, {
    message: 'Passwords do not match.',
    path: ['password2'],
  });

const BACKEND_FIELD_ALIASES = {
  password2: 'password2',
  re_password: 'password2',
  confirm_password: 'password2',
};

const FEATURES = [
  { icon: Zap, label: 'Fast uploads and instant previews' },
  { icon: ShieldCheck, label: 'Private by default — nothing is shared' },
  { icon: Sparkles, label: 'AI-assisted thinking when you need it' },
];

function PasswordInput({ id, disabled, autoComplete, registration, placeholder = '••••••••' }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        className="h-8 sm:h-9 pr-9 text-sm"
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        {...registration}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? (
          <EyeOff className="size-4 text-muted-foreground" />
        ) : (
          <Eye className="size-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden md:block">
      <div
        className="absolute inset-0 flex flex-col justify-between p-8 text-white"
        style={{
          background: 'linear-gradient(160deg,#142620 0%,#1f3d33 40%,#2e5c4a 75%,#6b9082 100%)',
        }}
      >
        <div
          className="absolute -top-32 -right-24 w-72 h-72 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-40 -left-24 w-80 h-80 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm
              flex items-center justify-center"
          >
            <Cloud size={16} />
          </span>
          <span className="font-bold font-manrope tracking-tight text-sm">N-drive</span>
        </div>
        <div className="relative max-w-xs">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-white/10 backdrop-blur-sm text-[11px] font-semibold mb-4"
          >
            <Sparkles size={11} />A quieter way to keep your work
          </div>
          <h2
            className="font-extrabold font-manrope text-2xl leading-tight
              tracking-tight mb-3"
          >
            Your workspace, without the noise.
          </h2>
          <p className="text-xs text-white/70 leading-relaxed mb-6">
            Files, ideas, and payments in one calm place. Built for makers who want to move fast without losing their
            mind.
          </p>
          <ul className="space-y-2.5 text-xs text-white/85">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5">
                <span
                  className="w-5 h-5 rounded-md bg-white/15 backdrop-blur-sm
                    flex items-center justify-center shrink-0"
                >
                  <Icon size={11} />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-[10px] text-white/50">
          © {new Date().getFullYear()} N-drive · A demo experience
        </div>
      </div>
    </div>
  );
}

export function SignupForm({ className, ...props }) {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      password2: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        first_name: values.first_name?.trim() || '',
        last_name: values.last_name?.trim() || '',
        phone: values.phone.replace(/[\s()-]/g, ''),
      };
      await registerUser(payload);
      toast.success('Registered Successfully');
      navigate('/login', {
        replace: true,
        state: { registered: true, username: values.username },
      });
    } catch (error) {
      const data = error?.error || error?.response?.data || error?.response?.error;
      if (!data) {
        form.setError('root', {
          type: 'server',
          message: 'Unable to create your account. Please try again.',
        });
        return;
      }
      if (typeof data === 'string') {
        form.setError('root', { type: 'server', message: data });
        return;
      }
      Object.entries(data).forEach(([field, value]) => {
        const message = Array.isArray(value) ? value.join(' ') : String(value);
        const formField = BACKEND_FIELD_ALIASES[field] ?? field;
        if (['detail', 'error', 'non_field_errors'].includes(formField)) {
          form.setError('root', { type: 'server', message });
          return;
        }
        if (formField in form.getValues()) {
          form.setError(formField, { type: 'server', message });
        } else {
          form.setError('root', { type: 'server', message });
        }
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const errors = form.formState.errors;

  return (
    <div className={cn('h-full flex flex-col gap-1.5 sm:gap-3', className)} {...props}>
      <Card className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0 flex-1 min-h-0">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col min-h-0 overflow-hidden p-3 sm:p-5 md:p-8"
          >
            <FieldGroup className="flex flex-col flex-1 min-h-0 gap-2 sm:gap-3 md:gap-4">
              <div className="text-center shrink-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Create your account</h1>
                <p className="text-[11px] sm:text-xs mt-0.5 text-balance text-muted-foreground">
                  Enter your details to get started
                </p>
              </div>

              {errors.root && (
                <div
                  className="rounded-md border border-red-500/30 bg-red-500/10
                    px-2 py-1.5 text-[11px] text-red-700 dark:text-red-300 shrink-0"
                >
                  {errors.root.message}
                </div>
              )}

              <Field className="grid grid-cols-2 gap-2 sm:gap-3">
                <Field>
                  <FieldLabel htmlFor="first_name" className="text-[11px] sm:text-xs">
                    First Name
                  </FieldLabel>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="John"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    className="h-8 sm:h-9 text-sm"
                    {...form.register('first_name')}
                  />
                  {errors.first_name && (
                    <FieldError className="text-[10px] sm:text-xs">{errors.first_name.message}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="last_name" className="text-[11px] sm:text-xs">
                    Last Name
                  </FieldLabel>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Doe"
                    autoComplete="family-name"
                    disabled={isSubmitting}
                    className="h-8 sm:h-9 text-sm"
                    {...form.register('last_name')}
                  />
                  {errors.last_name && (
                    <FieldError className="text-[10px] sm:text-xs">{errors.last_name.message}</FieldError>
                  )}
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="username" className="text-[11px] sm:text-xs">
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="john09"
                  autoComplete="username"
                  disabled={isSubmitting}
                  className="h-8 sm:h-9 text-sm"
                  {...form.register('username')}
                />
                {errors.username && (
                  <FieldError className="text-[10px] sm:text-xs">{errors.username.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="email" className="text-[11px] sm:text-xs">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className="h-8 sm:h-9 text-sm"
                  {...form.register('email')}
                />
                {errors.email && <FieldError className="text-[10px] sm:text-xs">{errors.email.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="phone" className="text-[11px] sm:text-xs">
                  Phone
                </FieldLabel>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute left-2.5 top-1/2
                      size-3.5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    className="h-8 sm:h-9 pl-8 text-sm"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    {...form.register('phone')}
                  />
                </div>
                {errors.phone && <FieldError className="text-[10px] sm:text-xs">{errors.phone.message}</FieldError>}
              </Field>

              <Field className="grid grid-cols-2 gap-2 sm:gap-3">
                <Field>
                  <FieldLabel htmlFor="password" className="text-[11px] sm:text-xs">
                    Password
                  </FieldLabel>
                  <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    registration={form.register('password')}
                  />
                  {errors.password && (
                    <FieldError className="text-[10px] sm:text-xs">{errors.password.message}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password2" className="text-[11px] sm:text-xs">
                    Confirm
                  </FieldLabel>
                  <PasswordInput
                    id="password2"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    placeholder="Confirm"
                    registration={form.register('password2')}
                  />
                  {errors.password2 && (
                    <FieldError className="text-[10px] sm:text-xs">{errors.password2.message}</FieldError>
                  )}
                </Field>
              </Field>

              <Button type="submit" disabled={isSubmitting} className="w-full h-8 sm:h-9 text-sm mt-auto shrink-0">
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>

              <div className="flex items-center gap-2 shrink-0">
                <span className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground">or</span>
                <span className="flex-1 h-px bg-border" />
              </div>

              <Field className="grid grid-cols-3 gap-2 shrink-0">
                <Button variant="outline" type="button" size="sm" disabled={isSubmitting} className="h-8">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Apple</span>
                </Button>
                <Button variant="outline" type="button" size="sm" disabled={isSubmitting} className="h-8">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Google</span>
                </Button>
                <Button variant="outline" type="button" size="sm" disabled={isSubmitting} className="h-8">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Meta</span>
                </Button>
              </Field>

              <FieldDescription className="text-center text-[11px] sm:text-xs shrink-0">
                Already have an account?{' '}
                <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <BrandPanel />
        </CardContent>
      </Card>

      <FieldDescription className="px-2 text-center text-[9px] sm:text-[11px] shrink-0">
        By clicking continue, you agree to our{' '}
        <Link
          to="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms
        </Link>{' '}
        and{' '}
        <Link
          to="/policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
