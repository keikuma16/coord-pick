import { useEffect, useState } from "react"
import { Link } from "react-router-dom";

export const ItemList = () => {
    const [items, setItems] = useState([]);

    //APIからデータをとってくる
    const get_data = async () => {
            try{
                const response = await fetch('https://coord-pick.onrender.com/items')
                if(response.ok){
                    const res = await response.json();
                    setItems(res);
                    console.log('商品表示完了',res);
                }else{
                    console.log('商品を表示できません');
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
        <div style={{padding:'20px'}}>
            <h2>商品一覧</h2>
            <Link to='/upload'>
                <button>商品を出品する</button>
            </Link>
            <div className="item-grid">
                {items.map((item)=>(
                    <div key={item.item_id} className='item-card' style={{borderBottom: '1px solid #ccc', margin: '10px 0'}}>
                        <img
                            src={`https://coord-pick.onrender.com/static/image/${item.item_image_URL}`}
                            alt={item.item_name}
                            width='200'
                            height='200'
                            style={{objectFit: 'cover'}}
                            className="item-img"
                        />
                        <div className="item-info">
                            <h3>{item.item_name}</h3>
                            <p>{item.item_price}円</p>
                            <p>カテゴリー:{item.item_category}</p>
                            <p>サイズ:{item.item_size}</p>
                        </div>
                    </div>
                ))}
            
            </div>
        </div>
        
    )
}