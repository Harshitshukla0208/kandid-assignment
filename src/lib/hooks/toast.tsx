import { toast as sonnerToast, Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  );
}

export function useToast() {
  // API: toast({ title, description, status })
  return useCallback(({ title, description, status }: { title: string; description?: string; status?: 'success' | 'error' | 'info' | 'warning' }) => {
    sonnerToast[status || 'info'](
      title + (description ? `: ${description}` : '')
    );
  }, []);
}
