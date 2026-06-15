const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que o seu arquivo script.js acesse esta API

// CONFIGURAÇÃO DA CONEXÃO COM O SEU BANCO DO AIVEN
const db = mysql.createConnection({
    host: 'mysql-375ad4d1-unipam-0534.a.aivencloud.com', // <-- Cole o seu Host do Aiven aqui
    user: 'avnadmin',
    password: 'AVNS_mJ5xMxfMvVFdTxTvvc0',          // <-- Cole a sua senha do Aiven aqui
    database: 'defaultdb',
    port: 24796,       // <-- Mude para a sua Porta do Aiven (sem aspas)
    ssl: { rejectUnauthorized: false }        // Exigência de segurança do Aiven
});

// TESTA A CONEXÃO COM O BANCO DE DADOS AO INICIAR
db.connect(err => {
    if (err) {
        console.error('Erro crítico ao conectar no MySQL:', err);
    } else {
        console.log('Conectado com sucesso ao MySQL do Aiven!');
    }
});

// ==========================================
// ROTA DE CADASTRO (SOLICITAR INSCRIÇÃO)
// ==========================================
app.post('/cadastrar', (req, res) => {
    const { cpf, senha, school, tipo } = req.body; // Mudei para pegar os dados do formulário escolar
    
    // Como você usou "loginEscola" e "loginSenha" no HTML, o script.js envia como cpf, senha, escola, tipo
    // Aqui usamos "escola" para bater com a coluna que criamos no MySQL
    const escola = req.body.escola || school; 

    const query = 'INSERT INTO usuarios (cpf, senha, escola, tipo) VALUES (?, ?, ?, ?)';
    
    db.query(query, [cpf, senha, escola, tipo], (err, result) => {
        if (err) {
            console.error('Erro no MySQL ao cadastrar:', err);
            // Se o CPF já existir, o MySQL vai barrar por ser UNIQUE e cairá aqui
            return res.status(500).json({ erro: 'Este CPF já está cadastrado ou houve um erro no servidor.' });
        }
        res.json({ mensagem: 'Solicitação de inscrição enviada com sucesso!' });
    });
});

// ==========================================
// ROTA DE LOGIN
// ==========================================
app.post('/login', (req, res) => {
    const { cpf, senha, escola } = req.body;
    
    // O banco busca um usuário onde o CPF, a Senha E a Escola estejam perfeitamente corretos
    const query = 'SELECT id, cpf, escola, tipo FROM usuarios WHERE cpf = ? AND senha = ? AND escola = ?';
    
    db.query(query, [cpf, senha, escola], (err, results) => {
        if (err) {
            console.error('Erro no MySQL ao logar:', err);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
        
        // Se encontrou alguma linha, os dados batem!
        if (results.length > 0) {
            // Retorna sucesso e envia os dados do usuário logado (como o tipo: Aluno/Professor)
            res.json({ 
                mensagem: 'Login efetuado com sucesso!', 
                usuario: results[0] 
            });
        } else {
            // Se não encontrou nada, os dados digitados estão errados
            res.status(401).json({ erro: 'CPF, Senha ou Escola incorretos.' });
        }
    });
});

// LIGA O SERVIDOR NA PORTA 3000 DO CODESPACES
app.listen(3000, () => {
    console.log('Servidor back-end rodando na porta 3000');
});