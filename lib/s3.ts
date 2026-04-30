import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Prefer AWS_* variables from .env, but fall back to S3_* if present
const REGION = process.env.AWS_REGION || process.env.S3_REGION;
const BUCKET = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET;
const ACCESS_KEY_ID =
  process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY =
  process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;

if (!REGION || !BUCKET || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.warn(
    "S3/AWS environment variables are not fully set. File uploads will be disabled."
  );
}

export const s3Client =
  REGION && ACCESS_KEY_ID && SECRET_ACCESS_KEY
    ? new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
    })
    : null;

export async function uploadLogo(file: File | Blob, ownerId: string) {
  const arrayBuffer = await file.arrayBuffer();
  const ext =
    "name" in file
      ? ((file as any).name as string).split(".").pop()?.toLowerCase() || "png"
      : "png";
  const filename = `${randomUUID()}.${ext}`;

  if (s3Client && BUCKET) {
    const key = `logos/${ownerId}/${filename}`;
    const contentType =
      "type" in file ? (file as any).type : "application/octet-stream";

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: contentType,
      })
    );

    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  }

  // Fallback: store in public/uploads/logos (works for local dev)
  const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, Buffer.from(arrayBuffer));
  return `/uploads/logos/${filename}`;
}

export async function uploadProjectServiceAttachment(
  file: File | Blob,
  projectId: string
): Promise<{ url: string; key: string }> {
  if (!s3Client || !BUCKET) {
    throw new Error("S3 is not configured");
  }
  const arrayBuffer = await file.arrayBuffer();
  const fileName = "name" in file ? (file as any).name : "bin";
  const ext = fileName.split(".").pop() || "bin";
  const key = `project-services/${projectId}/${randomUUID()}.${ext}`;
  const contentType =
    "type" in file ? (file as any).type : "application/octet-stream";
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: contentType,
    })
  );
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  return { url, key };
}

export async function uploadCmsImage(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const fileName = "name" in file ? (file as any).name : "image.jpg";
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;

  if (s3Client && BUCKET) {
    const key = `cms/${filename}`;
    const contentType = "type" in file ? (file as any).type : "image/jpeg";
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: contentType,
      })
    );
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  }

  // Fallback: store in public/uploads/cms (works for local dev)
  const uploadDir = path.join(process.cwd(), "public", "uploads", "cms");
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, Buffer.from(arrayBuffer));
  return `/uploads/cms/${filename}`;
}

export async function uploadKhatabookImage(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const fileName = "name" in file ? (file as any).name : "image.jpg";
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;

  if (s3Client && BUCKET) {
    const key = `khatabook/${filename}`;
    const contentType = "type" in file ? (file as any).type : "image/jpeg";
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: contentType,
      })
    );
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  }

  // Fallback: store in public/uploads/khatabook (works for local dev)
  const uploadDir = path.join(process.cwd(), "public", "uploads", "khatabook");
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, Buffer.from(arrayBuffer));
  return `/uploads/khatabook/${filename}`;
}

export async function uploadProjectDocument(
  file: File | Blob,
  projectId: string,
  name: string
): Promise<{ url: string; key: string }> {
  if (!s3Client || !BUCKET) {
    throw new Error("S3 is not configured");
  }
  const arrayBuffer = await file.arrayBuffer();
  const fileName = "name" in file ? (file as any).name : "bin";
  const ext = fileName.split(".").pop() || "bin";
  const key = `project-documents/${projectId}/${randomUUID()}-${(name || "file").replace(/[^a-zA-Z0-9.-]/g, "_")}.${ext}`;
  const contentType =
    "type" in file ? (file as any).type : "application/octet-stream";
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: contentType,
    })
  );
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  return { url, key };
}

export async function uploadDriveFile(
  file: File | Blob,
  ownerId: string
): Promise<{ url: string; key: string; sizeInBytes: number; mimeType: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const sizeInBytes = arrayBuffer.byteLength;
  const fileName = "name" in file ? (file as any).name : "file.bin";
  const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
  const safeBase = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  const contentType =
    ("type" in file && (file as any).type) || "application/octet-stream";
  const key = `drive/${ownerId}/${randomUUID()}-${safeBase}.${ext}`;

  if (s3Client && BUCKET) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: contentType,
      })
    );

    return {
      url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`,
      key,
      sizeInBytes,
      mimeType: contentType,
    };
  }

  // Fallback: local files for non-S3 development
  const uploadDir = path.join(process.cwd(), "public", "uploads", "drive", ownerId);
  await mkdir(uploadDir, { recursive: true });
  const filename = `${randomUUID()}-${safeBase}.${ext}`;
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, Buffer.from(arrayBuffer));

  return {
    url: `/uploads/drive/${ownerId}/${filename}`,
    key: `uploads/drive/${ownerId}/${filename}`,
    sizeInBytes,
    mimeType: contentType,
  };
}

