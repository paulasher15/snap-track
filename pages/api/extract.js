import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "google/gemma-4-26b-a4b-it:free",
];

async function tryModel(model, imageBase64, mimeType, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://snap-track-eight.vercel.app",
      "X-Title": "Snap Track",
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a transaction extractor. Analyze this image (receipt, bank statement, invoice, or expense photo) and extract transaction data.\n\nReturn ONLY a raw JSON array (no markdown, no backticks, no explanation). Each item:\n{\n  "date": "YYYY-MM-DD or best guess from today if unclear",\n  "description": "merchant or item name",\n  "amount": number (positive for expense, negative for income/refund),\n  "category": one of [Food, Transport, Shopping, Bills, Health, Entertainment, Other],\n  "notes": "any extra detail or empty string"\n}\n\nIf no transaction found, return: []`
          },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageBase64}` }
          }
        ]
      }]
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || `Model ${model} failed`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "[]";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not signed in" });

  const { imageBase64, mimeType } = req.body;
  if (!imageBase64 || !mimeType)
    return res.status(400).json({ error: "Missing image data" });

  const apiKey = process.env.OPENROUTER_API_KEY;
  let lastError = null;

  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const transactions = await tryModel(model, imageBase64, mimeType, apiKey);
      console.log(`Success with model: ${model}`);
      return res.status(200).json({ transactions });
    } catch (err) {
      console.warn(`Model ${model} failed: ${err.message}`);
      lastError = err;
    }
  }

  console.error("All models failed:", lastError?.message);
  return res.status(500).json({ error: "All models failed. Please try again in a moment." });
}
