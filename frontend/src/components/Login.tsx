import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const Login = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const navigate = useNavigate();
    const handleLogin = async(e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch (`https://coord-pick.onrender.com/login`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data = await res.json();
        if(!res.ok){
            alert(data.detail || 'ログイン失敗');
            return;
        }

    const token = data.access_token;
    localStorage.setItem("access_token", token);
    alert('ログイン成功');
    navigate('/');
 }

 return(
    <div className="flex justify-center items-center min-h-[80vh]">
        <form onSubmit={handleLogin} className="bg-white max-w-5xl rounded-2xl w-full p-10">
            <h2 className="text-2xl text-center font-bold">ログイン</h2>
            <div className="flex items-center p-2">
                <label className="text-black shrink-0 w-24">メールアドレス</label>
                <input
                className="grow border border-black-2 rounded-sm ml-2 min-w-0" 
                type="text" 
                value={email} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
                />
            </div>
            <div className="p-2 flex items-center">
                <label className="text-black shrink-0 w-24">パスワード</label>
                <input 
                type="password" 
                value={password} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
                className="grow border border-black-2 rounded-sm ml-2 min-w-0"
                />
            </div>
            <div className="flex justify-center items-center">
                <button 
                type="submit"
                className="text-gray-50 font-bold px-3 rounded-2xl bg-sky-600  ml-2 mt-4 w-2xl h-10" 
                >
                ログイン
                </button>
            </div>
        </form>
    </div>
 );
}