import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/x-msvideo",
  "video/3gpp",
  "video/3gpp2",
];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const ALLOWED_TYPES = [...VIDEO_TYPES, ...IMAGE_TYPES];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN manquant. Créez un Blob Store sur Vercel." },
      { status: 500 }
    );
  }

  const body = await request.json();

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname, _clientPayload, _multipart) => {
      const ext = pathname.split(".").pop()?.toLowerCase() || "";
      const isImage = /^(jpg|jpeg|png|webp|gif)$/.test(ext);
      const maxSize = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
      return {
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: maxSize,
        addRandomSuffix: true,
      };
    },
    onUploadCompleted: async () => {},
  });

  return NextResponse.json(jsonResponse, { headers: corsHeaders });
}
