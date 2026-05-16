import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

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
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are a transaction extractor. Analyze this image and extract transaction data.\n\nReturn ONLY a raw JSON array (no markdown, no backticks, no explanation). Each item:\n{\n  "date": "YYYY-MM-DD or best guess from today if unclear",\n  "description": "merchant or item name",\n  "amount": number (positive for expense, negative for income/refund),\n  "category": one of [Food, Transport, Shopping, Bills, Health, Entertainment, Other],\n  "notes": "any extra detail or empty string"\n}\n\nIf no transaction found, return: []`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64
              }
            }
          ]
        }]
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Gemini API error");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const transactions = JSON.parse(clean);

    return res.status(200).json({ transactions });
  } catch (err) {
    console.error("Gemini extract error:", err);
    return res.status(500).json({ error: "Failed to extract: " + err.message });
  }
}
