import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import type { Item } from "../types.js";
import { API_BASE_URL } from "../api";
import { cloudinaryImage } from "../cloudinary.js";

// カードは最大でも 3 カラムなので実寸は 400px 程度。高解像度ディスプレイぶんの余裕を見て 2 倍。
const CARD_IMAGE_WIDTH = 800;

// バックエンドは Render の無料プランで、しばらく使われないと停止する。
// 起動から始まると 30〜60 秒かかるので、待たせている理由をこの秒数で伝える。
const COLD_START_HINT_MS = 5000;

export const ItemList = () => {
    interface User {
        user_id: number,
        user_name: string
    }
    interface Styling {
        styling_id: number,
        styling_explanation: string,
        styling_item_img: string,
        user_id: number,
        creator?: User,
        items: Item[]
    }
    const [stylings, setStylings] = useState<Styling[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // 失敗を持っていないと、通信エラーでも「まだ投稿がありません」が出てしまう
    const [error, setError] = useState<string | null>(null);
    // 待ちが長引いたときだけ、サーバー起動待ちであることを足す
    const [isSlow, setIsSlow] = useState(false);

    const get_data = async () => {
        setIsLoading(true);
        setError(null);
        setIsSlow(false);
        const slowTimer = setTimeout(() => setIsSlow(true), COLD_START_HINT_MS);
        try {
            const response = await fetch(`${API_BASE_URL}/stylings`)
            if (response.ok) {
                const res = await response.json();
                setStylings(res);
            } else {
                console.error('スタイリングを表示できません');
                setError('スタイリングを表示できませんでした');
            }
        } catch (error) {
            console.error('通信エラー', error);
            setError('通信に失敗しました');
        } finally {
            clearTimeout(slowTimer);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        get_data();
    }, [])

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-3xl bg-white/90 p-8 shadow-md text-slate-700 text-center" aria-live="polite">
                    <p>読み込み中...</p>
                    {/* 30秒以上黙って待たせると「壊れている」に見えるので、理由を出す */}
                    {isSlow && (
                        <p className="mt-2 max-w-xs text-sm text-slate-500">
                            しばらく使われていないと、サーバーの起動に30秒ほどかかります。
                        </p>
                    )}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-3xl bg-white p-8 shadow-md text-center">
                <p className="text-xl font-semibold text-slate-900">{error}</p>
                <p className="mt-2 text-slate-600">時間をおいて、もう一度お試しください。</p>
                <button
                    onClick={get_data}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition"
                >
                    もう一度読み込む
                </button>
            </div>
        )
    }

    return (
        <>
            <div className="mb-8">
                <div className="text-center">
                    <p className="text-sm font-semibold text-sky-600 uppercase tracking-[0.3em]">CoordPick</p>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">Styling一覧</h2>
                </div>
            </div>

            {stylings.length === 0 ? (
                <div className="rounded-3xl bg-white p-8 shadow-md text-center">
                    <p className="text-xl font-semibold text-slate-900">まだ投稿がありません</p>
                    <p className="mt-2 text-slate-600">最初の投稿を作成して、他の人にシェアしましょう。</p>
                    <Link
                        to="/upload"
                        className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition"
                    >
                        投稿を作成する
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stylings.map((styling) => (
                        <Link
                            to={`/detail/${styling.styling_id}`}
                            key={styling.styling_id}
                            className="group block overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="aspect-square overflow-hidden bg-slate-100">
                                <img
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    // 原寸のままだとカード1枚に数 MB 落ちる。表示幅ぶんに縮めたものを取る
                                    src={cloudinaryImage(styling.styling_item_img, CARD_IMAGE_WIDTH)}
                                    alt={styling.styling_explanation}
                                    // 画面外のカードまで一斉に読み込まないようにする
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <div className="p-5 sm:p-6">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">{styling.creator?.user_name ?? '投稿者'} の投稿</p>
                                <h3 className="mt-3 text-lg font-semibold text-slate-900 line-clamp-2">{styling.styling_explanation}</h3>
                                <div className="mt-4 flex items-center text-sm text-slate-500">
                                    <span>商品数 {styling.items.length}</span>
                                </div>
                                <div className="mt-5 inline-flex items-center rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition group-hover:bg-sky-600 group-hover:text-white">
                                    詳細を見る
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    )
}
