interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** 是否为危险操作，按钮显示红色 */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-line bg-bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium text-ink">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-ink-muted">{description}</p>
        )}
        <div className="mt-6 flex justify-end gap-3 text-sm">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-ink-muted transition-colors hover:text-accent"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md border px-4 py-2 transition-opacity hover:opacity-80 ${
              danger
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-accent/30 bg-accent/10 text-accent"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
