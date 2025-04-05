// app/api/uploadPhotos/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { google } from "googleapis";
import { PassThrough } from "stream";
import type { OAuth2Client } from "google-auth-library";

// Google Drive API scopes
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.file"
];

// Convert Buffer to a stream (required by Google Drive API for file uploads)
function bufferToStream(buffer: Buffer) {
  const stream = new PassThrough();
  stream.end(buffer);
  return stream;
}

// Function to upload a single file to Google Drive
async function uploadFile(
  authClient: OAuth2Client,
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
) {
  const drive = google.drive({ version: "v3", auth: authClient });
  try {
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ""], // Optional folder ID
      },
      media: {
        mimeType,
        body: bufferToStream(fileBuffer), // Send file as stream
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw new Error("Failed to upload file to Google Drive.");
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming FormData, which contains the files
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se enviaron archivos." }, { status: 400 });
    }

    // Initialize GoogleAuth for authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Ensure line breaks are correct
      },
      scopes: SCOPES,
    });

    // Get the OAuth2 client from GoogleAuth
    const authClient = (await auth.getClient()) as OAuth2Client;

    // Process files in parallel
    const uploadPromises = files.map(async (file) => {
      const f = file as File;
      const arrayBuffer = await f.arrayBuffer(); // Convert file to array buffer
      const fileBuffer = Buffer.from(arrayBuffer); // Convert to Buffer

      // Determine MIME type based on file extension
      let mimeType = f.type || "image/jpeg";
      const lowerName = f.name.toLowerCase();
      if (lowerName.endsWith(".png")) mimeType = "image/png";
      else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg"))
        mimeType = "image/jpeg";
      else if (lowerName.endsWith(".webp")) mimeType = "image/webp";

      // Upload the file to Google Drive
      return uploadFile(authClient, fileBuffer, f.name, mimeType);
    });

    // Wait for all uploads to finish
    const results = await Promise.all(uploadPromises);

    // Return the results as JSON response
    return NextResponse.json({ success: true, data: results });
  } catch (error: unknown) {
    // Catch and handle errors
    console.error("Error uploading files:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Handle unsupported methods (GET, PUT, DELETE, etc.)
export function GET() {
  return NextResponse.json({ error: "Method GET Not Allowed" }, { status: 405 });
}
