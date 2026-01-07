import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    loading = false
}: ConfirmDialogProps) {
    const buttonClass = variant === 'danger' ? 'btn-danger' :
        variant === 'warning' ? 'btn-warning' : 'btn-primary';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
                <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-full)',
                    background: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' :
                        variant === 'warning' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-lg)'
                }}>
                    <AlertTriangle
                        size={28}
                        color={variant === 'danger' ? 'var(--color-error)' :
                            variant === 'warning' ? 'var(--color-warning)' : 'var(--color-info)'}
                    />
                </div>
                <p style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-xl)',
                    lineHeight: 1.5
                }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${buttonClass}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
