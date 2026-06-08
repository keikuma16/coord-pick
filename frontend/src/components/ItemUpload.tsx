import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Item } from "../types.js";
import { API_BASE_URL } from "../api";

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
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.status === 401) {
                setErrorMessage('ログインが必要です。');
                localStorage.removeItem("access_token");
                navigate('/login');
                return;
            }
            if (!res.ok) {
                setErrorMessage('出品できませんでした。');
                return;
            }

            alert('出品が完了しました');
            navigate('/items');
        } catch (error) {
            console.error(error);
            setErrorMessage('通信エラーが発生しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addItem = () => {
        const newItem = {
            name: itemname,
            brand: brand,
            url: itemurl,
            category: category
        };
        if (!itemname || !brand || !itemurl || !category) {
            setErrorMessage('入力されていない項目があります。');
            return;
        }
        setItems(prev => [...prev, newItem]);
        setItemname('');
        setBrand('');
        setItemurl('');
        setCategory('');
        setErrorMessage('');
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 lg:p-10">
                <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">投稿フォーム</p>
                        <h1 className="mt-4 text-3xl font-bold text-slate-900">あなただけのコーデをシェアしよう</h1>
                        <p className="mt-3 text-slate-600 sm:text-lg">画像と商品情報を登録して、他のユーザーにコーディネートを届けましょう。</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                        <p className="text-sm font-semibold text-slate-700">投稿のポイント</p>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600">
                            <li>✅ 画像は1枚だけ選択できます</li>
                            <li>✅ 商品は1つ以上追加してください</li>
                            <li>✅ URLを入れると詳細ページから移動できます</li>
                        </ul>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="space-y-6">
                        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <label className="block text-sm font-semibold text-slate-700">Styling説明</label>
                            <textarea
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                rows={4}
                                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                placeholder="このコーデのおすすめポイントを入力してください。"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <label className="block text-sm font-semibold text-slate-700">商品名</label>
                                <input
                                    type="text"
                                    value={itemname}
                                    onChange={(e) => setItemname(e.target.value)}
                                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />
                            </div>
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <label className="block text-sm font-semibold text-slate-700">ブランド</label>
                                <input
                                    type="text"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <label className="block text-sm font-semibold text-slate-700">カテゴリー</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />
                            </div>
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <label className="block text-sm font-semibold text-slate-700">商品URL</label>
                                <input
                                    type="text"
                                    value={itemurl}
                                    onChange={(e) => setItemurl(e.target.value)}
                                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                            <span className="self-center text-sm text-slate-500">{items.length} 件を追加済み</span>
                        </div>

                        {items.length > 0 && (
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                                <h2 className="text-sm font-semibold text-slate-800">追加済みの商品</h2>
                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                                            <p className="text-sm text-slate-600">{item.brand} / {item.category}</p>
                                            <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-sky-600 hover:text-sky-700">商品ページを見る</a>
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
                                    <img src={imagePreview} alt="プレビュー" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-400">画像を選択してください</div>
                                )}
                            </div>
                            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                                画像を選ぶ
                                <input
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
