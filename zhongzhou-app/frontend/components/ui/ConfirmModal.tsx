"use client";

interface ConfirmModalProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  message,
  confirmText = "确定",
  cancelText = "取消",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[300] isolate">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto bg-rice-paper rounded-sm shadow-2xl border border-charcoal/10 max-w-sm w-full animate-fade-in-up">
          <div className="px-6 py-5">
            <p className="text-sm text-ink font-body leading-relaxed">{message}</p>
          </div>
          <div className="flex border-t border-charcoal/10">
            <button
              onClick={onCancel}
              className="flex-1 py-3 text-sm font-display tracking-wider text-charcoal/60 hover:text-ink hover:bg-charcoal/5 transition-colors rounded-bl-sm"
            >
              {cancelText}
            </button>
            <div className="w-px bg-charcoal/10" />
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 text-sm font-display tracking-wider transition-colors rounded-br-sm ${
                danger
                  ? "text-white bg-cinnabar hover:bg-cinnabar-deep"
                  : "text-cinnabar hover:text-cinnabar-deep hover:bg-cinnabar/5"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
