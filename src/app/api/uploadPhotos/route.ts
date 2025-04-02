// app/api/uploadPhotos/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { google } from "googleapis";
import { PassThrough } from "stream";
import type { OAuth2Client } from "google-auth-library";

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.file"
];

// Convert a Buffer into a stream (needed for media.body)
function bufferToStream(buffer: Buffer) {
  const stream = new PassThrough();
  stream.end(buffer);
  return stream;
}

async function uploadFile(
  authClient: OAuth2Client,
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ""],
    },
    media: {
      mimeType,
      body: bufferToStream(fileBuffer),
    },
  });
  return response.data;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se enviaron archivos." }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: SCOPES,
    });
    // Cast the result to OAuth2Client to satisfy TypeScript.
    const authClient = (await auth.getClient()) as OAuth2Client;
    const results = [];

    for (const file of files) {
      const f = file as File;
      const arrayBuffer = await f.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      let mimeType = f.type || "image/jpeg";
      const lowerName = f.name.toLowerCase();
      if (lowerName.endsWith(".png")) mimeType = "image/png";
      else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg"))
        mimeType = "image/jpeg";
      else if (lowerName.endsWith(".webp")) mimeType = "image/webp";

      const result = await uploadFile(authClient, fileBuffer, f.name, mimeType);
      results.push(result);
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error: unknown) {
    console.error("Error uploading files:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "Method GET Not Allowed" }, { status: 405 });
}
