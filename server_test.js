const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

let routeHistory = [];

// 保存 (POST)
app.post('/upload', upload.single('image_file'), (req, res) => {
    try {
        const points = JSON.parse(req.body.points_data);
        const route = JSON.parse(req.body.route_data);
        const dateStr = new Date().toLocaleString(); // 保存した日時

        const imageUrl = req.file 
            ? `https://test-server-757e.onrender.com/uploads/${req.file.filename}` 
            : (routeHistory.length > 0 ? routeHistory[0].imageUrl : "");

        const newEntry = {
            id: Date.now(),
            name: dateStr, // 日時を名前にセット
            points: points,
            imageUrl: imageUrl,
            route: route
        };

        routeHistory.unshift(newEntry);
        res.status(200).json(newEntry);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 一覧取得
app.get('/list', (req, res) => res.json(routeHistory));

// 削除
app.delete('/history/:id', (req, res) => {
    const id = parseInt(req.params.id);
    routeHistory = routeHistory.filter(item => item.id !== id);
    res.status(200).json({ message: "Deleted" });
});

app.listen(PORT, () => console.log(`Server started: https://test-server-757e.onrender.com`));
