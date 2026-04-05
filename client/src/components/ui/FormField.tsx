const INPUT_BASE =
  'w-full rounded-lg border bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:ring-2 disabled:opacity-50';

export const getInputClass = (hasError?: string | false): string =>
  hasError
    ? `${INPUT_BASE} border-red-400 focus:border-red-500 focus:ring-red-500/20`
    : `${INPUT_BASE} border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20`;

export const FieldError = ({ message }: { message?: string | false }) =>
  message ? (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  ) : null;
