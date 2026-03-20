import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
            const token = localStorage.getItem("access_token");
            console.log("確認用トークン:", token);
            const res = await fetch(`https://coord-pick.onrender.com/upload`, {
                method:'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if(!res.ok){
                if(res.status === 401){
                    alert('ログインをしてください');
                    navigate('/login');
                }
                alert('出品できませんでした');
            }
            alert('出品が完了しました');
            console.log(res.json());
            navigate('/');
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
        <div className="flex justify-center items-center min-h-[80vh]">
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-3 w-full max-w-xl">
                <h2 className="text-center text-2xl text-black font-bold">投稿</h2>
                <div className="p-2 flex items-center">
                    <label className="text-black w-24 shrink-0">Styling説明</label>
                    <input type="text" value={explanation} onChange={(e) => setExplanation(e.target.value)} className="grow border border-black rounded-sm ml-2"/>
                </div>
                <div className="p-2 flex items-center">
                    <label className="text-black w-24 shrink-0">写真</label>
                    <input type="file" onChange={(e) =>{ 
                        if(e.target.files && e.target.files[0]){
                            setImageUrl(e.target.files[0])
                        }
                    }} className="grow border border-black rounded-sm ml-2 min-w-0"/>
                </div>
                <div className="p-2 flex items-center">
                    <label className="text-black w-24 shrink-0">商品名</label> 
                    <input type="text" value={itemname} onChange={(e) => setItemname(e.target.value)} className="grow border border-black rounded-sm ml-2"/>
                </div>
                <div className="p-2 flex items-center">
                    <label className="text-black w-24 shrink-0">カテゴリー</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="grow border border-black rounded-sm ml-2"/>
                </div>
                <div className="p-2 flex items-center">
                    <label className="text-black w-24 shrink-0">ブランド</label>
                    <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="grow border border-black rounded-sm ml-2"/>
                </div>
                <div className="p-2 flex items-center">
                    <label className="text-black w-24 shrink-0">商品URL</label>
                    <input type="text" value={itemurl} onChange={(e) => setItemurl(e.target.value)} className="grow border border-black rounded-sm ml-2"/>
                </div>
                <button type="button" onClick={addItem} className="text-black px-3 border border-black rounded-sm ml-2">商品を追加</button>
                <ul>
                    {items.map((item,index) => (
                        <li key={index}>{item.name}</li>
                    ))}
                </ul>
                <div className="flex justify-center items-center">
                    <button type="submit" className="text-gray-50 font-bold px-3 rounded-2xl bg-sky-600  ml-2 mt-4 w-2xl h-10">出品</button>
                </div> 
            </form>
        </div>
    )
}