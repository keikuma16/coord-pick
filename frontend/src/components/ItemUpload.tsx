import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Item } from "../types.js";
import { API_BASE_URL } from "../api";
import { clearToken, getToken } from "../auth.js";

// 購入先に飛べることがこのサービスの中身なので、
// 形式が壊れたURLは投稿前に止める。通してしまうと閲覧者が死んだリンクを踏む。
const isValidItemUrl = (value: string): boolean => {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

export const ItemUpload = () => {
    const navigate = useNavigate();
    const [explanation, setExplanation] = useState<string>('');
    const [items, setItems] = useState<Item[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [itemname, setItemname] = useState<string>('');
    const [brand, setBrand] = useState<string>('');
    const [itemurl, setItemurl] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (!imageFile) {
            setImagePreview('');
            return;
        }

        const url = URL.createObjectURL(imageFile);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');

        if (!imageFile) {
            setErrorMessage('画像を選択してください。');
            return;
        }
        if (items.length === 0) {
            setErrorMessage('商品を一つ以上追加してください。');
            return;
        }
        if (!explanation.trim()) {
            setErrorMessage('投稿の説明を入力してください。');
            return;
        }

        const formData = new FormData();
        formData.append('styling_explanation', explanation.trim());
        formData.append('styling_item_img', imageFile);
        formData.append('items', JSON.stringify(items));

        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                body: formData
            });

            if (res.status === 401) {
                // 入力中に有効期限が切れた場合。戻り先を渡して、ログイン後にここへ帰す
                clearToken();
                navigate('/login', {
                    state: {
                        from: '/upload',
                        flash: 'ログインの有効期限が切れました。もう一度ログインしてください。',
                    },
                });
                return;
            }
            if (!res.ok) {
                // バックエンドは失敗の原因ごとに日本語の説明(detail)を返す
                // (例:「画像の保存に失敗しました」)。数字や汎用文で潰さず、その説明を優先して見せる。
                let detail = '';
                try {
                    const data = await res.json();
                    detail = data?.detail ?? '';
                } catch {
                    // JSON でない想定外の応答。汎用文にフォールバックする
                }
                setErrorMessage(detail || '出品できませんでした。時間をおいて再度お試しください。');
                return;
            }

            navigate('/items', { state: { flash: '投稿を公開しました。' } });
        } catch (error) {
            console.error(error);
            setErrorMessage('通信エラーが発生しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addItem = () => {
        // 「入力されていない項目があります」だけでは、どれを直せばよいか分からない
        const missing: string[] = [];
        if (!itemname.trim()) missing.push('商品名');
        if (!brand.trim()) missing.push('ブランド');
        if (!category.trim()) missing.push('カテゴリー');
        if (!itemurl.trim()) missing.push('商品URL');
        if (missing.length > 0) {
            setErrorMessage(missing.join('・') + 'を入力してください。');
            return;
        }
        if (!isValidItemUrl(itemurl.trim())) {
            setErrorMessage('商品URLは http:// または https:// から始まる形式で入力してください。');
            return;
        }

        setItems(prev => [...prev, {
            name: itemname.trim(),
            brand: brand.trim(),
            url: itemurl.trim(),
            category: category.trim()
        }]);
        setItemname('');
        setBrand('');
        setItemurl('');
        setCategory('');
        setErrorMessage('');
    };

    // 打ち間違えた商品を消せないと、リロードして最初からやり直すしかなくなる
    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 lg:p-10">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">投稿フォーム</p>
                    <h1 className="mt-4 text-3xl font-bold text-slate-900">あなただけのコーデをシェアしよう</h1>
                </div>

                {errorMessage && (
                    <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                {/* 検証は自前でまとめて出すので、ブラウザ標準の吹き出しは止める */}
                <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="space-y-6">
                        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <label htmlFor="styling-explanation" className="block text-sm font-semibold text-slate-700">Styling説明</label>
                            <textarea
                                id="styling-explanation"
                                name="styling_explanation"
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                rows={4}
                                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                placeholder="このコーデのおすすめポイントを入力してください。"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <label htmlFor="item-name" className="block text-sm font-semibold text-slate-700">商品名</label>
                                <input
                                    id="item-name"
                                    name="item_name"
                                    type="text"
                                    value={itemname}
                                    onChange={(e) => setItemname(e.target.value)}
                                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                    placeholder="例: レーシングジャケット"
                                />
                            </div>
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <label htmlFor="item-brand" className="block text-sm font-semibold text-slate-700">ブランド</label>
                                <input
                                    id="item-brand"
                                    name="item_brand"
                                    type="text"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                    placeholder="例: supreme"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <label htmlFor="item-category" className="block text-sm font-semibold text-slate-700">カテゴリー</label>
                                <input
                                    id="item-category"
                                    name="item_category"
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                    placeholder="例: tops"
                                />
                            </div>
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <label htmlFor="item-url" className="block text-sm font-semibold text-slate-700">商品URL</label>
                                <input
                                    id="item-url"
                                    name="item_url"
                                    // スマホで URL 用のキーボードを出す
                                    type="url"
                                    inputMode="url"
                                    value={itemurl}
                                    onChange={(e) => setItemurl(e.target.value)}
                                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                    placeholder="https://example.com/items/123"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                            >
                                商品を追加する
                            </button>
                            <span className="self-center text-sm text-slate-500" aria-live="polite">{items.length} 件を追加済み</span>
                        </div>

                        {items.length > 0 && (
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <h2 className="text-sm font-semibold text-slate-800">追加済みの商品</h2>
                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                                                <p className="text-sm text-slate-600">{item.brand} / {item.category}</p>
                                                <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-sky-600 hover:text-sky-700 break-all">商品ページを見る</a>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                aria-label={`${item.name} を削除する`}
                                                className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                            >
                                                削除
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-center">
                            <div className="mx-auto mb-4 h-64 w-full overflow-hidden rounded-[1.5rem] bg-slate-100">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="選択した画像のプレビュー" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-400">画像を選択してください</div>
                                )}
                            </div>
                            <label htmlFor="styling-image" className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                                画像を選ぶ
                                <input
                                    id="styling-image"
                                    name="styling_item_img"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        setImageFile(file);
                                    }}
                                    className="hidden"
                                />
                            </label>
                            <p className="mt-3 text-sm text-slate-500">JPEG/PNG などの画像ファイルをアップロードしてください。</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-full bg-sky-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {isSubmitting ? '送信中...' : '出品する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
