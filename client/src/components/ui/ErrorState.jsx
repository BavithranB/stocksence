import { AlertTriangle } from 'lucide-react';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="w-6 h-6 text-red-400" />
    </div>
    <h3 className="text-sm font-semibold text-gray-900 mb-1">Failed to load</h3>
    <p className="text-sm text-gray-500 max-w-xs mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-xs px-3 py-1.5">
        Try again
      </button>
    )}
  </div>
);

export default ErrorState;
