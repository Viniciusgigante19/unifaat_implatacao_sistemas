import express from 'express';
import { Pool } from 'pg';
const app = express();

app.use(express.json());

// Função auxiliar para Logs Estruturados (Exigência do Item 3)
const logger = (level, message, context = {}) => {
    const log = {
        timestamp: new Date().toISOString(),
        level: level.toUpperCase(),
        message: message,
        ...context
    };
    console.log(JSON.stringify(log));
};

const pool = new Pool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
});

// Requisito: Health Check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        logger('info', 'Health check executado com sucesso');
        res.status(200).json({ status: 'OK', database: 'Connected' });
    } catch (err) {
        logger('error', 'Health check falhou', { error: err.message });
        res.status(500).json({ status: 'Error', database: err.message });
    }
});

// CRUD: Projetos
app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY id DESC');
        logger('info', 'Projetos listados', { count: result.rowCount });
        res.json(result.rows);
    } catch (err) {
        logger('error', 'Erro ao listar projetos', { error: err.message });
        res.status(500).send('Erro no servidor');
    }
});

app.post('/api/projects', async (req, res) => {
    const { title, description, tech_stack } = req.body;
    try {
        await pool.query(
            'INSERT INTO projects (title, description, tech_stack) VALUES ($1, $2, $3)',
            [title, description, tech_stack]
        );
        logger('info', 'Novo projeto criado', { title });
        res.status(201).send('Projeto criado');
    } catch (err) {
        logger('error', 'Erro ao criar projeto', { error: err.message });
        res.status(500).send('Erro no servidor');
    }
});

// REQUISITO: Seção de experiências/habilidades
app.get('/api/skills', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM skills');
        logger('info', 'Habilidades listadas');
        res.json(result.rows);
    } catch (err) {
        logger('error', 'Erro ao listar habilidades', { error: err.message });
        res.status(500).send('Erro no servidor');
    }
});

app.listen(3000, () => {
    logger('info', 'Servidor iniciado', { port: 3000 });
});