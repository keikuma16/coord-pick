import './App.css'
import { Register } from './components/Register'
import { ItemList } from './components/ItemList'
import { ItemUpload } from './components/ItemUpload'
import { BrowserRouter, Routes, Route, Link, useParams} from 'react-router-dom'

function App() {
    return(
        <BrowserRouter>
            <div className='container'>
                <h1 className='title'>Croord Pick</h1>
                <nav className='navigate'>
                    <Link to='/items' className='styling-button'>スタイリング一覧</Link>
                    <Link to='/register' className='register-button'>会員登録</Link>
                    <Link to='/upload' className='upload-button'>投稿</Link>
                </nav>
                
                <Routes>
                    <Route path='/register' element={<Register/>}/>
                    <Route path='/upload' element={<ItemUpload/>}/>
                    <Route path='/items' element={<ItemList/>}/>
                </Routes>        /    
            </div>
        </BrowserRouter>
    )
}

export default App
