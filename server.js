import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Fix Directory Paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Ensure 'uploads' folder exists (Fixes the 500 Error)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Created missing uploads folder');
}

const app = express();
app.use(cors());

// 3. Configure Multer to use the safe folder
const upload = multer({ dest: uploadDir });

// 4. Auth (Logs success/failure to helping debugging)
const keyPath = path.join(__dirname, 'credentials.json');
if (!fs.existsSync(keyPath)) {
    console.error('CRITICAL ERROR: credentials.json not found at', keyPath);
}

const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });

// 5. Serve the Website (Fixes "Not Found")
app.use(express.static(path.join(__dirname, 'dist')));

// 6. Upload Route
app.post('/upload', upload.array('photos'), async (req, res) => {
    console.log('Start upload...');
    try {
        const uploadedFiles = [];
        for (const file of req.files) {
            console.log(`Processing ${file.originalname}`);
            const response = await drive.files.create({
                requestBody: {
                    name: file.originalname,
                    parents: ['17SN0ojnJ7u6us0UaGRGfa6pbohrUjrjR'],
                },
                media: {
                    mimeType: file.mimetype,
                    body: fs.createReadStream(file.path),
                },
                supportsAllDrives: true,
            });
            fs.unlinkSync(file.path); // Clean up
            uploadedFiles.push(response.data);
        }
        res.json({ success: true, files: uploadedFiles });
    } catch (error) {
        console.error('Upload Failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// 7. Catch-all route for the website
app.get('*', (req, res) => {
    const indexFile = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.status(404).send('Site is building... please wait 1 minute and refresh.');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
