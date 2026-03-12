# CoordPick

SNS（TikTok/Instagram等）のコメント欄で頻発する「購入先が分からない」という課題を解決するための、ファッション特定・共有プラットフォームです。

## URL
https://coord-pick.vercel.app

##起動手順

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 技術スタックと技術選定理由
### Backend
- **Python / FastAPI**:高速かつ型安全なAPI開発のため採用
- **SQLAlchemy**
- **Uvicorn**

### Frontend
-＊＊Typescript**:型定義による安全性の向上のため。
- **React (Vite)**:開発スピードとビルドパフォーマンスを重視し、Viteを採用。
- **Axios**

### Infrastructure / Tools
- **Cloudinary**:画像データの最適化配信・クラウド管理のため導入。
- **Vercel**
- **Git / GitHub**

## ディレクトリ構成
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
```

## こだわり
- **型安全な設計**: FastAPIのPydanticモデルとSQLAlchemyを組み合わせ、堅牢でメンテナンス性の高いAPIを構築しました。
- **効率的な画像管理**: サーバー負荷を軽減し、高速に画像を表示させるため、Cloudinaryを採用して画像管理基盤を構築しました。
- **モダンな開発環境**: Viteを採用することで、開発体験の向上とビルドの高速化を図っています。
