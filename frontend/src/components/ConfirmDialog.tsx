import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
    isProcessing?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

// window.confirm の置き換え。
// ネイティブのダイアログは文言も見た目も変えられず、
// 「削除」のような取り消せない操作でどちらが破壊的な選択肢か示せない。
export const ConfirmDialog = ({
    isOpen,
    title,
    description,
    confirmLabel,
    cancelLabel = "キャンセル",
    isProcessing = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    const cancelRef = useRef<HTMLButtonElement>(null);
    // 閉じたあと、開く前に触っていたボタンへフォーカスを返す
    const lastFocused = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        lastFocused.current = document.activeElement as HTMLElement | null;
        // 既定のフォーカスは安全側（キャンセル）に置く
        cancelRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            lastFocused.current?.focus();
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4"
            onClick={onCancel}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                // 背景クリックで閉じるので、中身のクリックは伝えない
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8"
            >
                <h2 id="confirm-dialog-title" className="text-xl font-bold text-slate-900">
                    {title}
                </h2>
                <p id="confirm-dialog-description" className="mt-3 text-sm leading-relaxed text-slate-600">
                    {description}
                </p>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {isProcessing ? "処理中..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
