const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// CONEXÃO COM O SEU BANCO DO AIVEN
const db = mysql.createConnection({
    host: 'mysql-375ad4d1-unipam-0534.a.aivencloud.com', // Cole o seu Host aqui
    user: 'avnadmin',
    password: 'AVNS_mJ5xMxfMvVFdTxTvvc0', // Cole a sua senha aqui
    database: 'defaultdb',
    port: 24796,
    ssl: { rejectUnauthorized: false }
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
    } else {
        console.log('Conectado com sucesso ao MySQL do Aiven!');
    }
});

// ROTA DE CADASTRO
app.post('/cadastrar', (req, res) => {
    const { email, senha } = req.body;
    const query = 'INSERT INTO usuarios (email, senha) VALUES (?, ?)';
    
    db.query(query, [email, senha], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: 'Usuário já existe ou erro no banco.' });
        }
        res.json({ mensagem: 'Usuário cadastrado com sucesso!' });
    });
});

// ROTA DE LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    
    db.query(query, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        
        if (results.length > 0) {
            res.json({ mensagem: 'Login efetuado com sucesso!' });
        } else {
            res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));