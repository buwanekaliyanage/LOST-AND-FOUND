import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info;
  
  return (
    <div className={`toast ${type}`}>
      <Icon size={20} />
      <span>{message}</span>
    </div>
  );
}
