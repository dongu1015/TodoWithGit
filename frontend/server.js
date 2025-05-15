// 서버.js
const express = require('express');
const app = express();
const cors = require('cors'); // 👈 CORS 모듈 추가

app.use(cors()); // 👈 모든 요청 다 허용
app.use(express.json());

app.post('/commit', (req, res) => {
    console.log('받은 데이터:', req.body);
    res.json({ message: '서버 잘 받음!' });
});

app.listen(8000, () => console.log('8000번 포트에서 대기중'));
