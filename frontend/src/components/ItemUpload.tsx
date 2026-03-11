import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./ItemUpload.css";
import type { Item } from "../types.js";

export const ItemUpload = () => {
    const navigate = useNavigate();
    const [explanation, setExplanation] = useState<string>('');
    const [items, setItems] = useState<Item[]>([]);
    const [imageUrl, setImageUrl] = useState<File | null>(null);
    const [itemname, setItemname] = useState<string>('');
    const [brand, setBrand] = useState<string>('');
    const [itemurl, setItemurl] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    
    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!imageUrl) {
            alert("画像を選択してください");
            return;
        }
        if(items.length === 0){
            alert('商品を一つ以上追加してください')
            return;
        }

        console.log('items:', items);
        console.log('items JSON:', JSON.stringify(items));
        console.log('explanation:', explanation);
        console.log('imageUrl:', imageUrl);
        const formData = new FormData();
        formData.append('styling_explanation', explanation);
        formData.append('styling_item_img', imageUrl);
        formData.append('items', JSON.stringify(items));

        try{
            const res = await fetch(`https://fastapi-demo-y2bu.onrender.com/upload`, {
                method:'POST',
                body: formData
            });

            if(res.ok){
                alert('出品が完了しました');
                console.log(res.json());
                navigate('/');
            }
        }
        catch(error){
            alert('出品できませんでした');
            console.error(error);
        }
    }
    const addItem = () => {
        const newItem = {
            name: itemname,
            brand: brand,
            url: itemurl,
            category: category
        }
        if(!itemname || !brand || !itemurl || !category){
            alert('入力されてない項目があります');
            return;
        }
        setItems(prev => [...prev, newItem]);
        setItemname('');
        setBrand('');
        setItemurl('');
        setCategory('');
        console.log(items);
    }
    return(
        <div className="input-grid">
            <form onSubmit={handleSubmit}>
                <h2>投稿</h2>
                    <div className="explanation">
                        <label>Styling説明</label>
                        <input type="text" value={explanation} onChange={(e) => setExplanation(e.target.value)}/>
                    </div>
                    <div className="img-url">
                        <label>写真</label>
                        <input type="file" onChange={(e) =>{ 
                            if(e.target.files && e.target.files[0]){
                                setImageUrl(e.target.files[0])
                            }
                        }}/>
                    </div>
                    <div className="item-name">
                       <label>商品名</label> 
                       <input type="text" value={itemname} onChange={(e) => setItemname(e.target.value)}/>
                    </div>
                    <div className="item-category">
                        <label>カテゴリー</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}/>
                    </div>
                    <div className="item-brand">
                        <label>ブランド</label>
                        <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}/>
                    </div>
                    <div className="item-url">
                        <label>商品URL</label>
                        <input type="text" value={itemurl} onChange={(e) => setItemurl(e.target.value)}/>
                    </div>
                    <button type="button" onClick={addItem} className="add-button">商品を追加</button>
                    <ul>
                        {items.map((item,index) => (
                            <li key={index}>{item.name}</li>
                        ))}
                    </ul>

                    
                    <button type="submit" className="submit-button">出品</button>
                </form>
            </div>
    )
}