import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ItemDetail.css"

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
        items: DetailItem[]
    }
    const navigate = useNavigate();
    const [styling, setStyling] = useState<DetailStyling | null>(null);
    const { styling_id } = useParams();
        //APIからデータをとってくる
        const get_data = async () => {
                try{
                    const response = await fetch(`https://fastapi-demo-y2bu.onrender.com/detail/${styling_id}`)
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
            if(!window.confirm('消去してよろしいでしょうか')) return;

            try{
                const res = await fetch(`https://fastapi-demo-y2bu.onrender.com/delete/${id}`,{
                    method: "DELETE",
                })
                if(res.ok){
                    alert('消去しました')
                    navigate("/items");
                }
            }
            catch(error){
                console.error('消去失敗')
            }
        } 

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
                <button className="delete-button" onClick={() => handleDelete(styling.styling_id)}>消去</button>
            </div>
    )
}