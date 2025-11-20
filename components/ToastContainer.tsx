'use client';

import { useState, useCallback, useEffect } from 'react';
import Toast, { Toast as ToastType } from './Toast';

// Global toast state management
let toastListeners: Array<(toasts: ToastType[]) => void> = [];
let toasts: ToastType[] = [];

function notify() {
  toastListeners.forEach(listener => listener([...toasts]));
}

export function showToast(message: string, type: ToastType['type'] = 'info', duration?: number) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastType = { id, message, type, duration };
  toasts = [...toasts, newToast];
  notify();
  return id;
}

export function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

export default function ToastContainer() {
  const [toastList, setToastList] = useState<ToastType[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastType[]) => {
      setToastList(newToasts);
    };
    toastListeners.push(listener);
    setToastList([...toasts]);

    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const handleRemove = useCallback((id: string) => {
    removeToast(id);
  }, []);

  if (toastList.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col items-end">
      {toastList.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={handleRemove} />
      ))}
    </div>
  );
}

