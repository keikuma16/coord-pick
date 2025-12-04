import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
export const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('ユーザー登録完了');
        //APIにデータを送る
        const requestData = {
            'user_name':username,
            'email':email,
            'password':password
        }
        try{
            const request = await fetch('https://coord-pick.onrender.com/users',{
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
                navigate('/list');
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
    <div>
        <h2>新規会員登録</h2>
        <form onSubmit={handleSubmit}>
            {/* ユーザー名入力 */}
            <div>
                <label>ユーザー名</label>
                <input type='text' value={username} onChange={(e) => setUsername(e.target.value)}/>
            </div>
            {/* メアド入力 */}
            <div>
                <label>メールアドレス</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {/* パスワード入力 */}
            <div>
                <label>パスワード</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {/* 登録 */}
            <button type="submit">新規登録</button>
        </form>
    </div>
)
}
