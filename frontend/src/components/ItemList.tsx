import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import type { Item } from "../types.js";

export const ItemList = () => {
    interface Styling {
        styling_id: number,
        styling_explanation: string,
        styling_item_img: string,
        items: Item[]
    }
    const [stylings, setStylings] = useState<Styling[]>([]);
    //APIからデータをとってくる
    const get_data = async () => {
            try{
                const response = await fetch('https://fastapi-demo-y2bu.onrender.com/stylings')
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
            <h2 className="font-bold text-center p-3 text-2xl text-gray-50">スタイリング一覧</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stylings.map((styling) => (
                <div key={styling.styling_id} className="flex flex-col group bg-gray-50 rounded-lg">
                    <div className="aspect-square overflow-hidden bg-gray-200 rounded-t-lg">
                        <img
                        className="w-full h-full object-contain group-hover:scale-110 duration-100 transition-transform rounded-t-lg"
                        src={styling.styling_item_img}
                        />
                    </div>
                    <div className="p-4 flex flex-col grow">
                        <p className="text-sm text-black ">説明:{styling.styling_explanation}</p>
                        <Link to={`/detail/${styling.styling_id}`} className="text-center border border-black rounded-md">
                            詳細
                        </Link>
                    </div>
                </div>
            ))}
            </div>
        </>
    )
}