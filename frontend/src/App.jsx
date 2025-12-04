import { useState } from 'react'
import './App.css'
import { Register } from './components/Register'
import { ItemList } from './components/ItemList'
import { ItemUpload } from './components/ItemUpload'
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom'

function App() {
    return(
        <BrowserRouter>
            <div className='App'>
                <header style={{ padding: '20px', backgroundColor:'#333', color:'white', marginBottom:'20px', justifyContent: 'space-between', alignItems:'center'}}>
                    <h1 style={{margin:20}}>Croord Pick</h1>
                    <nav>
                        <Link to='/'>商品一覧</Link>
                        <Link to='/register'>会員登録</Link>
                        <Link to='/upload'>出品</Link>
                    </nav>
                </header>
                <Routes>
                    <Route path='/register' element={<Register/>}/>
                    <Route path='/upload' element={<ItemUpload/>}/>
                    <Route path='/' element={<ItemList/>}/>
                </Routes>            
            </div>
        </BrowserRouter>
    )
}

export default App
