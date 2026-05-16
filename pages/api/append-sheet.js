import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not signed in" });

  const { transactions, sheetId } = req.body;
  if (!transactions?.length) return res.status(400).json({ error: "No transactions provided" });
  if (!sheetId) return res.status(400).json({ error: "No sheet ID provided" });

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Check if header row exists
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A1:E1",
    });

    const hasHeader = existing.data.values?.[0]?.length > 0;

    if (!hasHeader) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A:E",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [["Date", "Description", "Amount (₱)", "Category", "Notes"]],
        },
      });
    }

    const values = transactions.map((t) => [
      t.date,
      t.description,
      t.amount,
      t.category,
      t.notes || "",
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });

    return res.status(200).json({ success: true, rowsAdded: values.length });
  } catch (err) {
    console.error("Sheets error:", err);
    return res.status(500).json({ error: err.message || "Failed to write to Google Sheet" });
  }
}
