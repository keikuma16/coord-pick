import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ItemDetail.css"

export const ItemDetail = () => {
    const [styling, setStyling] = useState(null);
    const { styling_id } = useParams();
        //APIからデータをとってくる
        const get_data = async () => {
                try{
                    const response = await fetch(`http://127.0.0.1:8000/detail/${styling_id}`)
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
    if (!styling) {
        return <div style={{color: "white"}}>データを読み込んでいます...</div>;
    }
    return(
            <div className="detail-container">
                <h2>詳細情報</h2>
                <img src={styling.styling_item_img} alt="Main" />
                {styling.items.map((item) => (
                <dl key={item.item_id}>
                    <dt>カテゴリー:{item.item_category}</dt>                                
                    <dd>ブランド:{item.item_brand}</dd>
                    <dd>商品名:{item.item_name}</dd>
                    <dd>説明:{styling.styling_explanation}</dd>
                    <dd>URL:<a href={item.item_url}>商品を見る</a>
                    </dd>
                </dl>
                ))}
            </div>
    )
}