import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message?: string;
  onRetry?: (() => void) | null;
  compact?: boolean;
}

const ErrorMessage = ({
  message = 'Something went wrong. Please try again.',
  onRetry = null,
  compact = false,
}: ErrorMessageProps) => (
  <div
    className={`flex flex-col items-center justify-center ${
      compact
        ? 'py-8'
        : 'rounded-xl border border-red-100 bg-red-50 py-12 shadow-sm'
    }`}
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
      <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
    </div>

    <p className="mt-3 max-w-sm text-center text-sm font-medium text-red-700">
      {message}
    </p>

    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;
