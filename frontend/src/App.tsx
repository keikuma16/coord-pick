import './index.css'
import { Register } from './components/Register.js'
import { ItemList } from './components/ItemList.js'
import { ItemUpload } from './components/ItemUpload.js'
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import { ItemDetail } from './components/ItemDetail.js'


function App() {
    return(
        <BrowserRouter>
            <div className='min-h-screen bg-slate-500 font-sans text-slate-900'>
                <header className="bg-white shadow-sm sticky top-0 z-50">
                    <h1 className='text-5xl text-sky-600 text-center'>Croord Pick</h1>
                    <nav className='flex items-center'>
                        <Link to='/items' className='flex-1 text-center hover:text-sky-600 transition-colors duration-200 border p-5'>
                            スタイリング一覧
                        </Link>
                        <Link to='/register' className='flex-1 text-center hover:text-sky-600 transition-colors duration-200 border p-5'>
                            会員登録
                        </Link>
                        <Link to='/upload' className='flex-1 text-center hover:text-sky-600 transition-colors duration-200 border p-5'>
                            投稿
                        </Link>
                    </nav>
                </header>
                
                <Routes>
                    <Route path="/" element={<ItemList />} />
                    <Route path='/register' element={<Register/>}/>
                    <Route path='/upload' element={<ItemUpload/>}/>
                    <Route path='/items' element={<ItemList/>}/>
                    <Route path='/detail/:styling_id' element={<ItemDetail />}/>
                </Routes>      
            </div>
        </BrowserRouter>
    )
}

export default App
