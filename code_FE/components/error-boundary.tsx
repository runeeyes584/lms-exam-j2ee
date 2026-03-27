'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mb-4 flex justify-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Đã có lỗi xảy ra
            </h2>
            <p className="mb-6 text-gray-600">
              {this.state.error?.message || 'Có gì đó không đúng. Vui lòng thử lại.'}
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={this.handleReset}>
                Thử lại
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional error fallback component
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
          Đã có lỗi xảy ra
        </h2>
        <p className="mb-6 text-center text-gray-600">
          {error.message || 'Có gì đó không đúng. Vui lòng thử lại.'}
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={resetError}>
            Thử lại
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
