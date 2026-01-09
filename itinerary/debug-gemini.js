
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');

console.log("Reading .env from:", envPath);
let apiKey = null;

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
        // Remove quotes if present
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

console.log("API Key found (length):", apiKey.length);

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro",
    "gemini-1.5-pro-001",
    "gemini-pro",
    "gemini-1.0-pro"
];

async function testModels() {
    console.log("Starting Model Connectivity Test...");

    for (const modelName of modelsToTest) {
        console.log(`\nTesting: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = "Hello, are you working?";
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log(`PASS: ${modelName}`);
        } catch (error) {
            console.log(`FAIL: ${modelName} - ${error.message.split('\n')[0]}`);
        }
    }
}

testModels();
