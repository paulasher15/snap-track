import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not signed in" });

  const { imageBase64, mimeType } = req.body;
  if (!imageBase64 || !mimeType)
    return res.status(400).json({ error: "Missing image data" });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a transaction extractor. Analyze this image (receipt, bank statement, invoice, or expense photo) and extract transaction data.

Return ONLY a raw JSON array (no markdown, no backticks, no explanation). Each item:
{
  "date": "YYYY-MM-DD or best guess from today if unclear",
  "description": "merchant or item name",
  "amount": number (positive for expense, negative for income/refund),
  "category": one of [Food, Transport, Shopping, Bills, Health, Entertainment, Other],
  "notes": "any extra detail or empty string"
}

If no transaction found, return: []`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const transactions = JSON.parse(clean);

    return res.status(200).json({ transactions });
  } catch (err) {
    console.error("Gemini extract error:", err);
    return res.status(500).json({ error: "Failed to extract transactions: " + err.message });
  }
}
