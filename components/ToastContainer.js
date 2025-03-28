import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Create Toast Context
export const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

// Toast types with corresponding colors and icons
const TOAST_TYPES = {
  success: {
    icon: CheckCircleIcon,
    className: 'bg-green-50 text-green-800 border-green-200'
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-red-50 text-red-800 border-red-200'
  },
  warning: {
    icon: ExclamationCircleIcon,
    className: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  info: {
    icon: InformationCircleIcon,
    className: 'bg-blue-50 text-blue-800 border-blue-200'
  }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const toast = ({ type = 'info', message, duration = 5000 }) => {
    const id = Date.now();
    
    setToasts(prevToasts => [
      ...prevToasts,
      { id, type, message, duration }
    ]);
    
    // Auto-remove toast after specified duration
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  // Helper methods for each toast type
  const successToast = (message, duration) => toast({ type: 'success', message, duration });
  const errorToast = (message, duration) => toast({ type: 'error', message, duration });
  const warningToast = (message, duration) => toast({ type: 'warning', message, duration });
  const infoToast = (message, duration) => toast({ type: 'info', message, duration });
  
  // Remove a toast by ID
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, successToast, errorToast, warningToast, infoToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Individual Toast component
function Toast({ id, type, message, removeToast }) {
  const ToastIcon = TOAST_TYPES[type]?.icon || InformationCircleIcon;
  const toastClass = TOAST_TYPES[type]?.className || TOAST_TYPES.info.className;

  return (
    <div 
      className={`flex items-center justify-between p-4 mb-4 rounded-lg shadow-md border ${toastClass} animate-slide-in`}
      role="alert"
    >
      <div className="flex items-center">
        <ToastIcon className="w-5 h-5 mr-3 flex-shrink-0" />
        <div>{message}</div>
      </div>
      <button 
        onClick={() => removeToast(id)} 
        className="ml-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Close"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

// Container for all toasts
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 w-80 z-50">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          removeToast={removeToast}
        />
      ))}
    </div>
  );
}