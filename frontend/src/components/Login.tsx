import { useState } from "react";

export const Login = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
 const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault();
    try{
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
        const token = data.acess_token;
        localStorage.setItem("token", token);
        alert('ログインに成功し ました');
    }
    catch(error: any){
        alert(error.res?.data?.detail || 'ログイン失敗');
    }
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