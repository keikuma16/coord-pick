import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

export const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(username == ''){
            alert('ユーザー名を入力してください')
        }
        console.log('ユーザー登録完了');
        //APIにデータを送る
        const requestData = {
            'user_name':username,
            'email': email,
            'password': password
        }
        try{
            const request = await fetch('https://fastapi-demo-y2bu.onrender.com/users',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(requestData),
            })
            if(request.ok){
                const res = await request.json();
                console.log('登録完了', res);
                alert('登録が完了しました');
                console.log(res)
                navigate('/items')
            }else{
                console.error('登録失敗');
                alert('登録に失敗しました')
            }
        }
        catch(error){
            console.error('通信エラー', error);
        }
        
    }
return(
    <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div  className="w-full max-w-md bg-white p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-800 text-center pb-4">
                新規会員登録
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label className="mr-2 sm:w-24 shrink-0">ユーザー名</label>
                    <input type='text' value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} className="border border-black rounded-sm grow min-w-0"/>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label className="mr-2 sm:w-24 shrink-0">メールアドレス</label>
                    <input type='text' value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className="border border-black rounded-sm grow min-w-0"/>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label className="mr-2 sm:w-24 shrink-0">パスワード</label>
                    <input type='text' value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} className="border border-black rounded-sm grow min-w-0"/>
                </div>
                {/* 登録 */}
                <div className="flex justify-center">
                    <button type="submit" className="border border-black rounded-sm px-2">新規登録</button>
                </div>
            </form>
        </div>
    </div>
)
}
