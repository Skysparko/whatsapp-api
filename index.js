const express = require('express');
const venom = require('venom-bot');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, './uploads'));
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`
        );
    },
});

const upload = multer({
    storage: storage,
});
let client;
app.get('/login', async (req, res) => {
    if (!client) {
        try {
            client = await venom.create('session', (base64Qr, asciiQR, attempts, urlCode) => {
                console.log(asciiQR);
                res.status(201).send({ base64Qr, asciiQR, attempts, urlCode });
            }, (status) => {
                console.log(status);
            }, {
                headless: 'new',
            });
        } catch (error) {
            res.status(500).send("Error while creating the client.");
        }
    }
    res.status(200).send("You are Logged in");
});

app.post('/send/message', async (req, res) => {
    try {
        const { number, message } = req.body;

        if (!client) {
            return res.status(400).send('Client not initialized');
        }

        await client.sendText(number, message);

        res.send(`Message sent to ${number}: ${message}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/send/image', upload.single('image'), async (req, res) => {
    try {
        const { number, message } = req.body;
        console.log(number, message);
        const image = req.file;
        if (!client) {
            return res.status(400).send('Client not initialized');
        }

        if (!fs.existsSync(image.path)) {
            throw new Error(`File not found at path: ${image.path}`);
        }
        await client.sendImage(
            number,
            image.path,
            image.originalname,
            message
        )
        res.send(`Image sent to ${number}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/send/video', upload.single('video'), async (req, res) => {
    try {
        const { number, message } = req.body;
        const video = req.file;

        if (!client) {
            return res.status(400).send('Client not initialized');
        }

        if (!fs.existsSync(video.path)) {
            throw new Error(`File not found at path: ${video.path}`);
        }

        await client.sendFile(number, video.path, video.originalname, message);

        res.send(`Video sent to ${number}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/send/audio', upload.single('audio'), async (req, res) => {
    try {
        const { number } = req.body;
        const audio = req.file;

        if (!client) {
            return res.status(400).send('Client not initialized');
        }

        if (!fs.existsSync(audio.path)) {
            throw new Error(`File not found at path: ${audio.path}`);
        }

        await client.sendVoice(number, audio.path);

        res.send(`Audio sent to ${number}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/send/document', upload.single('document'), async (req, res) => {
    try {
        const { number, message } = req.body;
        const document = req.file;

        if (!client) {
            return res.status(400).send('Client not initialized');
        }

        if (!fs.existsSync(document.path)) {
            throw new Error(`File not found at path: ${document.path}`);
        }

        await client.sendFile(number, document.path, document.originalname, message);

        res.send(`Document sent to ${number}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
