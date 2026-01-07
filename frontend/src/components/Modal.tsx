import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showClose?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true
}: ModalProps) {
    // Close on ESC key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: '380px',
        md: '480px',
        lg: '600px',
        xl: '800px'
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth: sizeClasses[size] }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    {showClose && (
                        <button className="modal-close" onClick={onClose}>
                            <X size={18} />
                        </button>
                    )}
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
