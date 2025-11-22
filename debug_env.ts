import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '.env');
console.log(`Loading .env from: ${envPath}`);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env:", result.error);
} else {
    console.log(".env loaded successfully.");
    console.log("Parsed keys:", Object.keys(result.parsed || {}));
}

console.log("Process Env Check:");
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "Present" : "Missing");
if (process.env.CLERK_SECRET_KEY) {
    console.log("Key Length:", process.env.CLERK_SECRET_KEY.length);
}
