import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env');
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const match = envFile.match(/VITE_GEMINI_API_KEY=(.*)/);
    const apiKey = match ? match[1].trim().replace(/^["']|["']$/g, '') : null;

    if (!apiKey) {
        console.error("❌ No API Key found in .env");
        process.exit(1);
    }

    console.log(`🔑 Testing API Key: ${apiKey.substring(0, 8)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);

    // Check models
    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro-latest"];

    console.log("📡 Testing connectivity...");

    let success = false;

    for (const modelName of models) {
        process.stdout.write(`   - Trying ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            const response = await result.response;
            console.log(`✅ SUCCESS!`);
            console.log(`     Response: "${response.text().trim()}"`);
            success = true;
            break;
        } catch (error) {
            console.log(`❌ FAILED`);
            console.log(`     Error: ${error.message.split('\n')[0]}`); // First line only
        }
    }

    if (!success) {
        console.error("\n🚫 ALL MODELS FAILED. Possible reasons:");
        console.error("1. The API Key might be from 'Google Cloud Vertex AI' instead of 'Google AI Studio'.");
        console.error("2. The 'Generative Language API' is not enabled for this key's project.");
        console.error("3. Regional restrictions (though usually returns 400/403).");
    }

} catch (err) {
    console.error("Error reading .env:", err.message);
}
