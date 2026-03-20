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
    <div>
        <h2>ログイン</h2>
        <form onSubmit={handleLogin}>
            <div>
                <label>メールアドレス</label>
                <input type="text" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
            </div>
            <div>
                <label>パスワード</label>
                <input type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
            </div>
            <button type="submit">ログイン</button>
        </form>
    </div>
 );
}