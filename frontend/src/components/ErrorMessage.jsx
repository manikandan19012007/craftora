import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import './ErrorMessage.css';

export default function ErrorMessage({
  title = "Something went wrong",
  message = "Please try again later or check your internet connection.",
  onRetry = null
}) {
  return (
    <div className="craftora-error-box" role="alert">
      <AlertCircle size={28} className="error-icon" />
      <div className="error-content">
        <h4>{title}</h4>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="error-retry-btn">
          <RotateCcw size={16} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}