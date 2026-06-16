require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// CORS para Codespaces
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Conexão com o banco
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 24796,
    ssl: {
        rejectUnauthorized: false
    }
});

// Testa conexão
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
        return;
    }

    console.log('Conectado com sucesso ao MySQL do Aiven!');
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('API funcionando!');
});

// Cadastro
app.post('/cadastrar', (req, res) => {
    console.log('CADASTRO RECEBIDO:', req.body);

    const { cpf, senha, escola, tipo } = req.body;

    if (!cpf || !senha || !escola || !tipo) {
        return res.status(400).json({
            erro: 'Todos os campos são obrigatórios.'
        });
    }

    const query =
        'INSERT INTO usuarios (cpf, senha, escola, tipo) VALUES (?, ?, ?, ?)';

    db.query(query, [cpf, senha, escola, tipo], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar:', err);

            return res.status(500).json({
                erro: 'CPF já cadastrado ou erro no banco.'
            });
        }

        res.json({
            mensagem: 'Solicitação de inscrição enviada com sucesso!'
        });
    });
});

// Login
app.post('/login', (req, res) => {
    console.log('LOGIN RECEBIDO:', req.body);

    const { cpf, senha, escola } = req.body;

    if (!cpf || !senha || !escola) {
        return res.status(400).json({
            erro: 'Todos os campos são obrigatórios.'
        });
    }

    const query = `
        SELECT id, cpf, escola, tipo
        FROM usuarios
        WHERE cpf = ?
        AND senha = ?
        AND escola = ?
    `;

    db.query(query, [cpf, senha, escola], (err, results) => {
        if (err) {
            console.error('Erro no login:', err);

            return res.status(500).json({
                erro: 'Erro interno do servidor.'
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                erro: 'CPF, senha ou escola incorretos.'
            });
        }

        res.json({
            mensagem: 'Login efetuado com sucesso!',
            usuario: results[0]
        });
    });
});

// Inicializa servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});