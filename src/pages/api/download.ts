import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  // Validate URL
  if (!url || !isValidURL(url as string)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const response = await fetch(url as string);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${(url as string).split("/").pop()}"`);
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the file from the provided URL" });
  }
}

function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}
