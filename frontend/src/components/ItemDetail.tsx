import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

// JWT から user_id を取得する関数
const getUserIdFromToken = (): number | null => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = parts[1];
        const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decoded = JSON.parse(atob(padded));
        
        return decoded.user_id || null;
    } catch (error) {
        console.error("Token decode error:", error);
        return null;
    }
};

export const ItemDetail = () => {
    interface DetailItem{
        item_id: number,
        item_name: string,
        item_brand: string,
        item_category: string,
        item_url:string
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
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const { styling_id } = useParams();
    
    useEffect(() => {
        setCurrentUserId(getUserIdFromToken());
    }, []);
    
    const get_data = async () => {
        try{
            const response = await fetch(`${API_BASE_URL}/detail/${styling_id}`)
            if(response.ok){
                const res = await response.json();
                setStyling(res);
                console.log('詳細表示完了',res);
            }else{
                console.log('詳細を表示できません');
            }
        }
        catch(error){
            console.error('通信エラー',error);
        }
    }
    
    useEffect (() => {
        get_data();
    },[styling_id])

    const handleDelete = async(id: number) => {
        if(!window.confirm('本当に削除しますか？')) return;

        try{
            const token = localStorage.getItem("access_token");
            if (!token) {
                alert('ログインをしてください');
                navigate('/login');
                return;
            }

            const res = await fetch(`${API_BASE_URL}/stylings/${id}`,{
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if(res.ok){
                alert('投稿を削除しました');
                navigate("/items");
            } else if (res.status === 403) {
                alert('他人の投稿は削除できません');
            } else if (res.status === 404) {
                alert('投稿が見つかりません');
            } else {
                alert('削除に失敗しました');
            }
        }
        catch(error){
            console.error('消去失敗', error);
            alert('削除に失敗しました');
        }
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
                    <p className="mt-2 text-slate-600 max-w-2xl">投稿されたアイテムを一つずつ確認し、必要なら削除できます。</p>
                </div>
                <button
                    onClick={() => navigate('/items')}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                    一覧に戻る
                </button>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl bg-white p-6 shadow-md">
                    <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-inner">
                        <img src={styling.styling_item_img} alt="投稿画像" className="h-full w-full object-contain" />
                    </div>
                    <div className="mt-6 space-y-4">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="text-lg font-semibold text-slate-900">説明</h3>
                            <p className="mt-2 text-slate-600 leading-relaxed">{styling.styling_explanation}</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-slate-200 bg-white p-5">
                                <p className="text-sm text-slate-500">投稿者ID</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{styling.user_id}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-white p-5">
                                <p className="text-sm text-slate-500">商品数</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{styling.items.length}件</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl bg-white p-6 shadow-md">
                        <h3 className="text-xl font-semibold text-slate-900">アイテム一覧</h3>
                        <div className="mt-4 space-y-4">
                            {styling.items.map((item) => (
                                <article key={item.item_id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{item.item_category}</span>
                                        <span className="text-sm text-slate-500">ID {item.item_id}</span>
                                    </div>
                                    <h4 className="mt-3 text-lg font-semibold text-slate-900">{item.item_name}</h4>
                                    <p className="mt-1 text-sm text-slate-600">ブランド: {item.item_brand}</p>
                                    <a href={item.item_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-medium text-sky-600 hover:text-sky-700">
                                        商品ページへ移動
                                    </a>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-md">
                        <h3 className="text-xl font-semibold text-slate-900">操作</h3>
                        <p className="mt-2 text-sm text-slate-600">この投稿は、投稿したユーザーだけが削除できます。</p>
                        {isOwner ? (
                            <button
                                onClick={() => handleDelete(styling.styling_id)}
                                className="mt-5 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
                            >
                                投稿を削除する
                            </button>
                        ) : (
                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                この投稿は削除できません
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
