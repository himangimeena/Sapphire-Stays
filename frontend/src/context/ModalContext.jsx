import React, { createContext, useContext, useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm'
    title: '',
    message: '',
    resolve: null
  });

  const showAlert = (message, title = 'Sapphire Stays') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'alert',
        title,
        message,
        resolve
      });
    });
  };

  const showConfirm = (message, title = 'Royal Sanctuaries Confirmation') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolve
      });
    });
  };

  const handleClose = (result) => {
    if (modalState.resolve) {
      modalState.resolve(result);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl transition-all scale-100">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="p-2 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                {modalState.type === 'confirm' ? (
                  <HelpCircle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-slate-900 dark:text-slate-100">
                {modalState.title}
              </h3>
            </div>

            {/* Message Body */}
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium whitespace-pre-line">
              {modalState.message}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              {modalState.type === 'confirm' && (
                <button
                  onClick={() => handleClose(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold btn-gold shadow-lg cursor-pointer transition hover:scale-[1.02] flex items-center justify-center min-w-[70px]"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
