import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

export const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        if (username.trim() === '') {
            setErrorMessage('ユーザー名を入力してください。');
            return;
        }
        if (email.trim() === '') {
            setErrorMessage('メールアドレスを入力してください。');
            return;
        }
        if (password.trim() === '') {
            setErrorMessage('パスワードを入力してください。');
            return;
        }

        try {
            const request = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: username,
                    email: email,
                    password: password
                }),
            })
            if (request.ok) {
                navigate('/items');
            } else {
                const data = await request.json();
                setErrorMessage(data.detail || '登録に失敗しました。');
            }
        }
        catch (error) {
            console.error('通信エラー', error);
            setErrorMessage('通信エラーが発生しました。');
        }
    }

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
                <div className="mb-8 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">新規会員登録</p>
                    <h2 className="mt-4 text-3xl font-bold text-slate-900">CoordPick に参加する</h2>
                    <p className="mt-3 text-slate-600">アカウントを作成して、投稿と共有を始めましょう。</p>
                </div>

                {errorMessage && (
                    <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <label className="text-sm font-semibold text-slate-700">ユーザー名</label>
                        <input
                            type='text'
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            placeholder="例: 太郎"
                        />
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <label className="text-sm font-semibold text-slate-700">メールアドレス</label>
                        <input
                            type='text'
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            placeholder="example@mail.com"
                        />
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <label className="text-sm font-semibold text-slate-700">パスワード</label>
                        <input
                            type='password'
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            placeholder="********"
                        />
                    </div>
                    <button type="submit" className="w-full rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700">
                        新規登録
                    </button>
                </form>
            </div>
        </div>
    )
}
