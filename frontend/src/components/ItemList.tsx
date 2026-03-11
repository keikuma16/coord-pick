import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import "./ItemList.css";
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
            <h2>スタイリング一覧</h2>
            <div className="item-grid">
            {stylings.map((styling) => (
                <div key={styling.styling_id} className="card">
                    <img
                    className="card-img"
                    src={styling.styling_item_img}
                    />
                    <p>説明:{styling.styling_explanation}</p>
                    <Link to={`/detail/${styling.styling_id}`} className="detail-button">
                        詳細
                    </Link>
                </div>
            ))}
            </div>
        </>
    )
}