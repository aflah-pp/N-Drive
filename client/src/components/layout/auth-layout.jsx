import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-3 py-2 shadow-lg shadow-black/5 backdrop-blur-xl sm:px-4">
          <Button variant="outline" size="sm" asChild className="h-9 border-border/50">
            <Link to="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              <span>Back to Home</span>
            </Link>
          </Button>

          <ThemeToggle />
        </div>
      </div>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
