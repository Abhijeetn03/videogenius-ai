import { GoogleGenAI } from '@google/genai';
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
if (!apiKey) {
    throw new Error('Missing Gemini API key. Set GEMINI_API_KEY in server/.env.');
}
if (apiKey.startsWith('ya29.') || apiKey.trim().startsWith('{')) {
    throw new Error('Invalid Gemini API key. GEMINI_API_KEY must be a Google AI Studio API key, not an OAuth token or service account JSON.');
}
const ai = new GoogleGenAI({
    apiKey,
});
export default ai;
