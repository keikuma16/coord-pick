import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const AUTO_DISMISS_MS = 6000;

interface FlashState {
    flash?: string;
}

// 完了や失敗の通知。以前は alert() で出していたが、
// ブラウザのダイアログは文言も見た目も出る位置も変えられず、操作も止めてしまう。
// 画面遷移をまたいで伝えたいので、遷移先の state に載せてここで拾う。
export const FlashBanner = () => {
    const location = useLocation();
    const flash = (location.state as FlashState | null)?.flash ?? null;
    // location.key は履歴のエントリごとに一意。
    // 同じ文言でも遷移し直せば別のキーになるので、そのときは改めて出る。
    const flashKey = location.key;
    const [dismissedKey, setDismissedKey] = useState<string | null>(null);

    const isVisible = flash !== null && dismissedKey !== flashKey;

    // 出しっぱなしにせず、一定時間で引っ込める
    useEffect(() => {
        if (!isVisible) return;
        const timer = setTimeout(() => setDismissedKey(flashKey), AUTO_DISMISS_MS);
        return () => clearTimeout(timer);
    }, [isVisible, flashKey]);

    if (!isVisible) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-start justify-between gap-4 rounded-3xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-medium text-sky-900"
        >
            <p>{flash}</p>
            <button
                type="button"
                onClick={() => setDismissedKey(flashKey)}
                aria-label="通知を閉じる"
                className="shrink-0 rounded-full px-2 text-lg leading-none text-sky-700 transition hover:bg-sky-100"
            >
                ×
            </button>
        </div>
    );
};
