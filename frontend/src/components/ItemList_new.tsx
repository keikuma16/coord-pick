import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import type { Item } from "../types.js";
import { API_BASE_URL } from "../api";

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
        creator: User,
        items: Item[]
    }
    const [stylings, setStylings] = useState<Styling[]>([]);
    
    const get_data = async () => {
        try{
            const response = await fetch(`${API_BASE_URL}/stylings`)
            if(response.ok){
                const res = await response.json();
                setStylings(res);
                console.log('スタイリング表示完了',res);
            }else{
                console.log('スタイリングを表示できません');
            }
        }
        catch(error){
            console.error('通信エラー',error);
        }
    }
    
    useEffect (() => {
        get_data();
    },[])

    return(
        <>
            <div className="mb-8">
                <h2 className="font-bold text-center text-3xl sm:text-4xl text-slate-800 mb-2">
                    スタイリング一覧
                </h2>
                <p className="text-center text-slate-600 text-sm sm:text-base">
                    様々なコーディネートを発見してください
                </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {stylings.map((styling) => (
                    <Link 
                        key={styling.styling_id} 
                        to={`/detail/${styling.styling_id}`}
                        className="group cursor-pointer"
                    >
                        <div className="flex flex-col bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
                            {/* 画像エリア */}
                            <div className="aspect-square overflow-hidden bg-slate-200">
                                <img
                                    className="w-full h-full object-contain group-hover:scale-110 duration-300 transition-transform"
                                    src={styling.styling_item_img}
                                    alt={styling.styling_explanation}
                                />
                            </div>
                            
                            {/* コンテンツエリア */}
                            <div className="p-4 flex flex-col grow">
                                {/* 説明 */}
                                <p className="text-sm sm:text-base text-slate-800 font-semibold mb-3 line-clamp-2 group-hover:text-sky-600 transition-colors">
                                    {styling.styling_explanation}
                                </p>
                                
                                {/* 商品数 */}
                                <p className="text-xs text-slate-500 mb-3">
                                    📦 {styling.items.length}件の商品
                                </p>
                                
                                {/* 投稿者情報 */}
                                <div className="border-t border-slate-200 pt-3 mt-auto">
                                    <p className="text-xs sm:text-sm text-slate-600">
                                        <span className="text-sky-600 font-medium">{styling.creator.user_name}</span>
                                        <span className="text-slate-400"> さんのコーディネート</span>
                                    </p>
                                </div>

                                {/* 詳細ボタン */}
                                <div className="mt-3">
                                    <div className="inline-block px-3 py-2 text-xs sm:text-sm rounded-md bg-sky-50 text-sky-600 font-medium group-hover:bg-sky-600 group-hover:text-white transition-colors duration-200">
                                        詳細を見る →
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {stylings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-600 text-lg">まだコーディネートがありません</p>
                    <Link 
                        to="/upload"
                        className="inline-block mt-4 px-6 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
                    >
                        最初のコーディネートを投稿する
                    </Link>
                </div>
            )}
        </>
    )
}
