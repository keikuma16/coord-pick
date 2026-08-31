import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_BASE_URL } from "../api";

export const Login = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('')

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
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
            if (!res.ok) {
                setErrorMessage(data.detail || 'ログインに失敗しました。')
                return;
            }

            const token = data.access_token;
            localStorage.setItem("access_token", token);
            navigate('/items');
        } catch (error) {
            // サーバーに繋がらない等。ここを握らないと、押しても何も起きず沈黙してしまう。
            console.error('通信エラー', error);
            setErrorMessage('通信に失敗しました。時間をおいて再度お試しください。');
        }
    }

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <form onSubmit={handleLogin} className="w-full rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
                <div className="mb-8 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">ログイン</p>
                    <h2 className="mt-4 text-3xl font-bold text-slate-900">CoordPickへようこそ</h2>
                    <p className="mt-3 text-slate-600">メールアドレスとパスワードでログインしてください。</p>
                </div>

                {errorMessage && (
                    <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">メールアドレス</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            placeholder="example@mail.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            placeholder="********"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700"
                    >
                        ログイン
                    </button>
                </div>
            </form>
        </div>
    );
}
