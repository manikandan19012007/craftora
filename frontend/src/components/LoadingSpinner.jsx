import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = "Loading handcrafted treasures...", size = 32 }) {
  return (
    <div className="craftora-spinner-wrap" role="status">
      <Loader2 size={size} className="spinner-icon" />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}