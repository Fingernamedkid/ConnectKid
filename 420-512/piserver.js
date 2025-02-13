import express from 'express';
import cors from 'cors';
import { status } from './lib/axios';
const app = express();
const PORT = 3005;

app.use(express.json());
app.use(cors());

app.post('/alert', async (req, res) => {
    const { message } = req.body;
    try {
        console.log(`Received alert: ${message}`);
        res.status(200).json({ message: 'Alert received' });
        await status(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});