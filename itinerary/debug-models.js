
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');

console.log("Reading .env from:", envPath);
let apiKey = null;

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
        if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
            apiKey = apiKey.slice(1, -1);
        }
    }
} catch (e) {
    console.error("Could not read .env file");
}

if (!apiKey) {
    console.error("API Key not found in .env");
    process.exit(1);
}

console.log("API Key found. Fetching available models...");

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                const modelsList = json.models
                    .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
                    .map(m => m.name.replace('models/', ''))
                    .join('\n');

                console.log("Writing models to clean_models.txt...");
                fs.writeFileSync('clean_models.txt', modelsList, 'utf8');
                console.log("Done.");
            } else {
                console.log("No models found or error:", JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error("Parse Error:", e);
        }
    });

}).on('error', (err) => {
    console.error("Request Error:", err.message);
});
