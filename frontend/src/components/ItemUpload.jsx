import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useState } from "react";

export const ItemUpload = () => {
    const navigate = useNavigate();
    const [price, setPrice] = useState('');
    const [itemname, setItemname] = useState('');
    const [category, setCategory] = useState('');
    const [size, setSize] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const handleSubmit = async(e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('item_name', itemname);
        formData.append('item_price', price);
        formData.append('item_category', category);
        formData.append('item_size',size);
        if(imageFile){
            formData.append('image', imageFile);
        }

        try{
            const res = await fetch('http://127.0.0.1:8000/users/1/items', {
                method:'POST',
                body: formData
            });
            if(res.ok){
                alert('出品が完了しました');
                navigate('/');
            }
        }
        catch(error){
            alert('出品できませんでした',error);
        }
    }
    return(
        <div>
            <Link to='/'>商品一覧</Link>
            <form onSubmit={handleSubmit}>
                    <div>
                        <label>商品名</label>
                        <input type="text" value={itemname} onChange={(e) => setItemname(e.target.value)}/>
                    </div>
                    <div>
                        <label>カテゴリー</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}/>
                    </div>
                    <div>
                        <label>値段</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}/>
                    </div>
                    <div>
                        <label>サイズ</label>
                        <input type="text" value={size} onChange={(e) => setSize(e.target.value)}/>
                    </div>
                    <div>
                        <label>写真</label>
                        <input type="file" onChange={(e) => setImageFile(e.target.files[0])}/>
                    </div>
                    <button type="submit">出品</button>
                </form>
            </div>
    )
}