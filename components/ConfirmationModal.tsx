import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  bodyText: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title,
  bodyText,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container animate-frame-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-button" aria-label="Close modal">
            &times;
        </button>
        <h2 className="text-xl font-heading text-glow text-center mb-4 text-[var(--danger-color-hover)]">{title}</h2>
        <p className="text-sm text-center text-text-secondary mb-6">
          {bodyText}
        </p>
        <div className="flex justify-end items-center gap-4">
            <button 
              onClick={onClose}
              className="action-button px-4 py-2"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className="action-button danger px-4 py-2"
            >
              {confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;