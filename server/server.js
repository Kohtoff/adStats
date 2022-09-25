import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
const port = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/log', (req, res) => {
    console.log(req.body?.url);
    res.status(200).send()
})

app.use(express.static(path.join(__dirname, '../client')))

app.listen(port, async () => {
    console.log("Web server is on port " + port);
});
