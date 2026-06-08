import './index.css'
import { Register } from './components/Register.js'
import { ItemList } from './components/ItemList.js'
import { ItemUpload } from './components/ItemUpload.js'
import { Login } from './components/Login.js'
import { Routes, Route, Link, useNavigate} from 'react-router-dom'
import { ItemDetail } from './components/ItemDetail.js'
import { useEffect, useState } from 'react'


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const navigate = useNavigate();

    // ページ読み込み時とローカルストレージ変更時にログイン状態を確認
    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem("access_token");
            if (token) {
                setIsLoggedIn(true);
                // token から user_name を取得（簡易版、実装時には API で取得する選択肢も）
                try {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                        const payload = parts[1];
                        const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
                        const decoded = JSON.parse(atob(padded));
                        setUserName(decoded.user_name || "ユーザー");
                    }
                } catch (error) {
                    console.error("Token decode error:", error);
                    setUserName("ユーザー");
                }
            } else {
                setIsLoggedIn(false);
                setUserName(null);
            }
        };

        checkLoginStatus();

        // storage イベントをリッスン（他のタブでの変更に対応）
        window.addEventListener("storage", checkLoginStatus);
        return () => window.removeEventListener("storage", checkLoginStatus);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        setUserName(null);
        navigate("/items");
        alert("ログアウトしました");
    };

    return(
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-900'>
                <header className="bg-white shadow-md sticky top-0 z-50">
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <div className='py-4 border-b border-slate-200'>
                            <Link to='/items' className='inline-block'>
                                <h1 className='text-3xl sm:text-4xl font-bold text-sky-600 hover:text-sky-700 transition-colors'>
                                    CoordPick
                                </h1>
                            </Link>
                        </div>

                        <nav className='flex items-center justify-between py-3 gap-2 sm:gap-4'>
                            <div className='flex items-center gap-2 sm:gap-4 flex-wrap'>
                                <Link 
                                    to='/items' 
                                    className='px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md hover:bg-sky-50 text-sky-600 font-medium transition-colors duration-200'
                                >
                                    一覧
                                </Link>
                                
                                {isLoggedIn ? (
                                    <>
                                        <Link 
                                            to='/upload' 
                                            className='px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors duration-200'
                                        >
                                            + 投稿
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link 
                                            to='/register' 
                                            className='px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md hover:bg-slate-100 text-slate-700 font-medium transition-colors duration-200'
                                        >
                                            会員登録
                                        </Link>
                                        <Link 
                                            to='/login' 
                                            className='px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors duration-200'
                                        >
                                            ログイン
                                        </Link>
                                    </>
                                )}
                            </div>

                            {isLoggedIn && (
                                <div className='flex items-center gap-3 sm:gap-4'>
                                    <span className='text-xs sm:text-sm text-slate-600'>
                                        {userName}
                                    </span>
                                    <button 
                                        onClick={handleLogout}
                                        className='px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition-colors duration-200'
                                    >
                                        ログアウト
                                    </button>
                                </div>
                            )}
                        </nav>
                    </div>
                </header>
                
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <Routes>
                        <Route path="/" element={<ItemList />} />
                        <Route path='/register' element={<Register/>}/>
                        <Route path='/upload' element={<ItemUpload/>}/>
                        <Route path='/items' element={<ItemList/>}/>
                        <Route path='/login' element={<Login/>}/>
                        <Route path='/detail/:styling_id' element={<ItemDetail />}/>
                    </Routes>      
                </main>
            </div>
    )
}

export default App
