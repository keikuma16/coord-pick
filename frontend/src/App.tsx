import './App.css'
import { Register } from './components/Register.js'
import { ItemList } from './components/ItemList.js'
import { ItemUpload } from './components/ItemUpload.js'
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import { ItemDetail } from './components/ItemDetail.js'

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
                    <Route path='/detail/:styling_id' element={<ItemDetail />}/>
                </Routes>      
            </div>
        </BrowserRouter>
    )
}

export default App
