interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-900/90 border-b border-red-700 px-4 py-3 text-center">
      <span className="text-sm text-red-200">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 text-sm font-medium text-red-100 underline hover:text-white"
        >
          Retry
        </button>
      )}
    </div>
  );
}
