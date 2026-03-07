# CoordPick

SNS（TikTok/Instagram等）のコメント欄で頻発する「購入先が分からない」という課題を解決するための、ファッション特定・共有プラットフォームです。

##URL
https://coord-pick.vercel.app

##起動手順

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
```bash
cd frontend
npm install
npm run dev

##技術スタック
### Backend
- **Python / FastAPI**
- **SQLAlchemy**
- **Uvicorn**

### Frontend
- **React (Vite)**
- **Axios**

### Infrastructure / Tools
- **Cloudinary**
- **Vercel**
- **Git / GitHub**

##ディレクトリ構成
```bash
.
├── backend        
│   ├── main.py    
│   ├── models.py
│   ├── schemas.py   
│   └── database.py  
├── frontend         
│   ├── src
│   │   ├── components 
│   │   └── App.jsx    
│   └── index.html
└── README.md

## こだわり
- **型安全な設計**: FastAPIのPydanticモデルとSQLAlchemyを組み合わせ、堅牢でメンテナンス性の高いAPIを構築しました。
- **効率的な画像管理**: サーバー負荷を軽減し、高速に画像を表示させるため、Cloudinaryを採用して画像管理基盤を構築しました。
- **モダンな開発環境**: Viteを採用することで、開発体験の向上とビルドの高速化を図っています。
