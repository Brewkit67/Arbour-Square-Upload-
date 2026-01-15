const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

const app = express();
const port = 3001;

// Credentials Path
const KEY_FILE_PATH = path.join(__dirname, 'credentials.json');

// Startup Check
if (!fs.existsSync(KEY_FILE_PATH)) {
    console.error("\n\n[CRITICAL WARNING] ==================================================");
    console.error("  credentials.json NOT FOUND in project root!");
    console.error("  Uploads will fail. Please place the file here:");
    console.error(`  ${KEY_FILE_PATH}`);
    console.error("[CRITICAL WARNING] ==================================================\n\n");
}

app.use(cors());
app.use(express.json());

// Configure Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Full Drive scope
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

const uploadToDrive = async (fileBuffer, fileName, mimeType) => {
    const folderId = '17SN0ojnJ7u6us0UaGRGfa6pbohrUjrjR'; // Shared Drive Destination

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    try {
        const response = await drive.files.create({
            media: {
                mimeType: mimeType,
                body: bufferStream,
            },
            requestBody: {
                name: fileName,
                parents: [folderId],
            },
            supportsAllDrives: true,     // Critical for Shared/Team Drives
            fields: 'id, name',
        });

        return response.data;
    } catch (error) {
        console.error("\n[GOOGLE API ERROR] ---------------------------------------");
        console.error("Failed to create file in Shared Drive.");
        if (error.response && error.response.data) {
            console.error("API Response:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Details:", error.message);
        }
        console.error("----------------------------------------------------------\n");
        throw error;
    }
};

app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('[UPLOAD REQUEST] Received.');

        if (!fs.existsSync(KEY_FILE_PATH)) {
            throw new Error('credentials.json is missing on server.');
        }

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { originalname, mimetype, buffer } = req.file;
        console.log(`[PROCESSING] ${originalname} (${mimetype})`);

        const result = await uploadToDrive(buffer, originalname, mimetype);

        console.log(`[SUCCESS] Uploaded: ${originalname} (ID: ${result.id})`);
        res.status(200).json({ success: true, fileId: result.id });

    } catch (error) {
        console.error('[UPLOAD FAILED]', error.message);
        // Return full error details to frontend/console for debugging
        const errorDetails = error.response ? error.response.data : error.message;
        res.status(500).json({
            error: 'Upload Failed',
            details: errorDetails
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    if (fs.existsSync(KEY_FILE_PATH)) {
        console.log("✅ credentials.json found.");
    } else {
        console.log("❌ credentials.json MISSING.");
    }
});
