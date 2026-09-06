import './index.css'
import { Register } from './components/Register.js'
import { ItemList } from './components/ItemList.js'
import { ItemUpload } from './components/ItemUpload.js'
import { Login } from './components/Login.js'
import { Routes, Route, Link, useLocation, useNavigate} from 'react-router-dom'
import { ItemDetail } from './components/ItemDetail.js'
import { FlashBanner } from './components/FlashBanner.js'
import { RequireAuth } from './components/RequireAuth.js'
import { clearToken, getUserName, isLoggedIn } from './auth.js'
import { useEffect, useState } from 'react'


function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // ログイン状態を確認する。
    // 画面遷移のたびに見直さないと、ログイン直後もヘッダーが
    // 「ログイン / 会員登録」のままになる(同じタブの localStorage 変更では
    // storage イベントが飛ばないため)。
    useEffect(() => {
        const checkLoginStatus = () => {
            if (isLoggedIn()) {
                setLoggedIn(true);
                setUserName(getUserName() ?? "ユーザー");
            } else {
                setLoggedIn(false);
                setUserName(null);
            }
        };

        checkLoginStatus();

        // storage イベントをリッスン（他のタブでの変更に対応）
        window.addEventListener("storage", checkLoginStatus);
        return () => window.removeEventListener("storage", checkLoginStatus);
    }, [location]);

    const handleLogout = () => {
        clearToken();
        setLoggedIn(false);
        setUserName(null);
        navigate("/items", { state: { flash: "ログアウトしました。" } });
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
                                
                                {loggedIn ? (
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

                            {loggedIn && (
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
                    <FlashBanner />
                    <Routes>
                        <Route path="/" element={<ItemList />} />
                        <Route path='/register' element={<Register/>}/>
                        <Route
                            path='/upload'
                            element={
                                <RequireAuth>
                                    <ItemUpload/>
                                </RequireAuth>
                            }
                        />
                        <Route path='/items' element={<ItemList/>}/>
                        <Route path='/login' element={<Login/>}/>
                        <Route path='/detail/:styling_id' element={<ItemDetail />}/>
                    </Routes>      
                </main>
            </div>
    )
}

export default App
