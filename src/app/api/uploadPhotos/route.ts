// app/api/uploadPhotos/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { google } from "googleapis";
import { PassThrough } from "stream";

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
  authClient: any,
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
) {
  const drive = google.drive({ version: "v3", auth: authClient });
  // Use the create method as specified in the documentation:
  // https://developers.google.com/drive/api/reference/rest/v3/files/create
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
    // Parse the incoming FormData instead of JSON
    const formData = await req.formData();
    // Get all files from the "files" field
    const files = formData.getAll("files");
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se enviaron archivos." }, { status: 400 });
    }

    // Authenticate with Google using your Service Account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    const results = [];

    // Process each file
    for (const file of files) {
      const f = file as File;
      const arrayBuffer = await f.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      // Determine mimeType based on file extension
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
  } catch (error: any) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: error.message || "Error uploading files" },
      { status: 500 }
    );
  }
}

// Return 405 for non-POST methods
export function GET() {
  return NextResponse.json({ error: "Method GET Not Allowed" }, { status: 405 });
}
