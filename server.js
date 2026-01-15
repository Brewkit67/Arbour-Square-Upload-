import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Configure Multer (Temp storage)
// Ensure uploads directory exists or let multer handle it
const upload = multer({ dest: 'uploads/' });

// 1. Authenticate (Service Account)
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/drive'],
});

// 2. Drive Client
const drive = google.drive({ version: 'v3', auth });

// 3. Upload Route
app.post('/upload', upload.array('photos'), async (req, res) => {
    console.log('Received upload request:', req.files.length, 'files');

    try {
        const uploadedFiles = [];

        for (const file of req.files) {
            const response = await drive.files.create({
                requestBody: {
                    name: file.originalname,
                    parents: ['17SN0ojnJ7u6us0UaGRGfa6pbohrUjrjR'], // Target Folder
                },
                media: {
                    mimeType: file.mimetype,
                    body: fs.createReadStream(file.path),
                },
                supportsAllDrives: true, // CRITICAL for Shared Drives
            });

            // Clean up local file
            try {
                fs.unlinkSync(file.path);
            } catch (e) {
                console.error("Failed to delete temp file:", e);
            }
            uploadedFiles.push(response.data);
        }
        console.log('Upload success!');
        res.json({ success: true, files: uploadedFiles });
    } catch (error) {
        console.error('UPLOAD ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
