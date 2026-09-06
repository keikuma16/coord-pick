import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import { cloudinaryImage } from "../cloudinary.js";
import { clearToken, getToken, getUserId } from "../auth.js";
import { ConfirmDialog } from "./ConfirmDialog.js";
import { categoryLabel, conditionLabel } from "../constants.js";

// 詳細の写真は 1.2fr のカラムに収まる。高解像度ディスプレイぶんの余裕を見て 1200px を上限にする。
const DETAIL_IMAGE_WIDTH = 1200;

export const ItemDetail = () => {
    interface DetailItem{
        item_id: number,
        item_name: string,
        item_brand: string,
        item_category: string,
        // 後から足した項目。それ以前の投稿では空
        item_condition: string | null,
        // 古着は購入先が無いことがある
        item_url: string | null
    }
    interface DetailStyling {
        styling_id: number,
        styling_explanation: string,
        styling_item_img: string,
        user_id: number,
        items: DetailItem[]
    }
    const navigate = useNavigate();
    const [styling, setStyling] = useState<DetailStyling | null>(null);
    const [currentUserId] = useState<number | null>(() => getUserId());
    // 削除は取り消せないので、押した直後ではなく確認をはさむ
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    // 削除の失敗。読み込みの失敗(error)とは別に持たないと、
    // 表示中の投稿がエラー画面に置き換わってしまう
    const [actionError, setActionError] = useState<string | null>(null);
    // 失敗を持っていないと、通信エラーのとき styling が null のままで
    // 「読み込み中...」が永久に消えない
    const [error, setError] = useState<string | null>(null);
    const { styling_id } = useParams();

    useEffect(() => {
        let cancelled = false;

        const fetchDetail = async () => {
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/detail/${styling_id}`);
                if (response.ok) {
                    const res = await response.json();
                    if (!cancelled) setStyling(res);
                } else {
                    console.log('詳細を表示できません');
                    if (!cancelled) setError('詳細を表示できませんでした');
                }
            } catch (error) {
                console.error('通信エラー', error);
                if (!cancelled) setError('通信に失敗しました');
            }
        };

        fetchDetail();
        return () => {
            cancelled = true;
        };
    }, [styling_id]);

    const handleDelete = async(id: number) => {
        setActionError(null);
        setIsDeleting(true);

        try{
            const token = getToken();
            if (!token) {
                clearToken();
                navigate('/login', {
                    state: {
                        from: `/detail/${id}`,
                        flash: 'この操作にはログインが必要です。',
                    },
                });
                return;
            }

            const res = await fetch(`${API_BASE_URL}/stylings/${id}`,{
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if(res.ok){
                navigate("/items", { state: { flash: '投稿を削除しました。' } });
            } else if (res.status === 401) {
                clearToken();
                navigate('/login', {
                    state: {
                        from: `/detail/${id}`,
                        flash: 'ログインの有効期限が切れました。もう一度ログインしてください。',
                    },
                });
            } else if (res.status === 403) {
                setActionError('この投稿は投稿者本人だけが削除できます。');
            } else if (res.status === 404) {
                setActionError('この投稿は見つかりませんでした。すでに削除されている可能性があります。');
            } else {
                setActionError('削除に失敗しました。時間をおいて、もう一度お試しください。');
            }
        }
        catch(error){
            console.error('消去失敗', error);
            setActionError('通信に失敗しました。時間をおいて、もう一度お試しください。');
        }
        finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-2xl bg-white p-8 shadow-lg text-center">
                    <p className="text-xl font-semibold text-slate-900">{error}</p>
                    <button
                        onClick={() => navigate('/items')}
                        className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                    >
                        一覧に戻る
                    </button>
                </div>
            </div>
        );
    }

    if (!styling) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-2xl bg-white/90 p-8 shadow-lg text-slate-700 text-center">
                    読み込み中...
                </div>
            </div>
        );
    }
    
    const isOwner = currentUserId !== null && styling.user_id === currentUserId;
    
    return(
        <div className="mx-auto w-full max-w-5xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white rounded-3xl p-6 shadow-md">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">投稿の詳細</h2>
                    <p className="mt-2 text-slate-600 max-w-2xl">投稿されたアイテムを一つずつ確認できます。</p>
                </div>
                <button
                    onClick={() => navigate('/items')}
                    className="group inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 hover:shadow-md"
                >
                    <svg
                        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    一覧に戻る
                </button>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl bg-white p-6 shadow-md">
                    <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-inner">
                        <img
                            // 一覧と同じく、原寸ではなく表示幅ぶんに縮めたものを取る
                            src={cloudinaryImage(styling.styling_item_img, DETAIL_IMAGE_WIDTH)}
                            alt="投稿画像"
                            decoding="async"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="mt-6 space-y-4">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="text-lg font-semibold text-slate-900">説明</h3>
                            <p className="mt-2 text-slate-600 leading-relaxed">{styling.styling_explanation}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-5">
                            <p className="text-sm text-slate-500">商品数</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">{styling.items.length}件</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl bg-white p-6 shadow-md">
                        <h3 className="text-xl font-semibold text-slate-900">アイテム一覧</h3>
                        <div className="mt-4 space-y-4">
                            {styling.items.map((item) => (
                                <article key={item.item_id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{categoryLabel(item.item_category)}</span>
                                        {/* 状態は後から足したので、それ以前の投稿では出さない */}
                                        {conditionLabel(item.item_condition) && (
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                {conditionLabel(item.item_condition)}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="mt-3 text-lg font-semibold text-slate-900">{item.item_name}</h4>
                                    <p className="mt-1 text-sm text-slate-600">ブランド: {item.item_brand}</p>
                                    {item.item_url ? (
                                        <a href={item.item_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-medium text-sky-600 hover:text-sky-700">
                                            商品ページへ移動
                                        </a>
                                    ) : (
                                        // 古着で購入先が無い場合。空のリンクを出すと踏んでも何も起きない
                                        <p className="mt-4 text-sm text-slate-500">購入先の情報はありません</p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </div>

                    {isOwner && (
                        <div className="rounded-3xl bg-white p-6 shadow-md">
                            <h3 className="text-xl font-semibold text-slate-900">操作</h3>

                            {actionError && (
                                <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {actionError}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setActionError(null);
                                    setIsConfirmOpen(true);
                                }}
                                className="mt-4 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
                            >
                                この投稿を削除する
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                title="この投稿を削除しますか？"
                description="削除すると、写真とアイテムの購入先リンクは元に戻せません。共有済みのリンクからも見られなくなります。"
                confirmLabel="削除する"
                isProcessing={isDeleting}
                onConfirm={() => handleDelete(styling.styling_id)}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </div>
    )
}
