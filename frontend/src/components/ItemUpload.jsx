import { useNavigate } from "react-router-dom";
import { Link, useParams } from 'react-router-dom';
import { useState } from "react";

export const ItemUpload = () => {
    const navigate = useNavigate();
    const [explanation, setExplanation] = useState('');
    const [items, setItems] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [itemname, setItemname] = useState('');
    const [brand, setBrand] = useState('');
    const [itemurl, setItemurl] = useState('');
    const [category, setCategory] = useState('');
    
    const handleSubmit = async(e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('styling_explanation', explanation);
        formData.append('styling_item_img', imageUrl);
        formData.append('items', JSON.stringify(items));

        try{
            const res = await fetch(`http://localhost:8000/upload`, {
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
            alert('出品できませんでした',error);
            console.log(error);
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
        <div>
            <Link to='/'>商品一覧</Link>
            <form onSubmit={handleSubmit}>
                    <div>
                        <label>Styling説明</label>
                        <input type="text" value={explanation} onChange={(e) => setExplanation(e.target.value)}/>
                    </div>
                    <div>
                        <label>写真</label>
                        <input type="file" onChange={(e) => setImageUrl(e.target.files[0])}/>
                    </div>
                    <div>
                       <label>商品名</label> 
                       <input type="text" value={itemname} onChange={(e) => setItemname(e.target.value)}/>
                    </div>
                    <div>
                        <label>カテゴリー</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}/>
                    </div>
                    <div>
                        <label>ブランド</label>
                        <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}/>
                    </div>
                    <div>
                        <label>商品URL</label>
                        <input type="text" value={itemurl} onChange={(e) => setItemurl(e.target.value)}/>
                    </div>
                    <button type="button" onClick={addItem}>商品を追加</button>
                    <ul>
                        {items.map((item) => (
                            <li>{item.name}</li>
                        ))}
                    </ul>

                    
                    <button type="submit">出品</button>
                </form>
            </div>
    )
}