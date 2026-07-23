import { NextResponse } from "next/server";
import {
  getAuthorizedFootageIntake,
  updateAuthorizedFootageIntake,
} from "@/lib/db/authorized-footage";
import { createPresignedUploadUrl } from "@/lib/storage/storage-adapter";
import type { PresignedUploadRequest } from "@/lib/storage/types";

const ALLOWED_CONTENT_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<PresignedUploadRequest>;

  if (!body.intakeId || !body.fileName || !body.contentType || typeof body.fileSizeBytes !== "number") {
    return NextResponse.json(
      { error: "intakeId, fileName, contentType, and fileSizeBytes are required." },
      { status: 400 },
    );
  }

  const intake = await getAuthorizedFootageIntake(body.intakeId);
  if (!intake) {
    return NextResponse.json({ error: "Authorized footage intake not found." }, { status: 404 });
  }

  if (!ALLOWED_CONTENT_TYPES.has(body.contentType)) {
    return NextResponse.json(
      { error: "Only MP4, QuickTime, and WebM footage metadata requests are supported." },
      { status: 400 },
    );
  }

  if (intake.status !== "authorized") {
    return NextResponse.json(
      { error: `Upload URL cannot be issued while intake is ${intake.status}; written authorization is required first.` },
      { status: 400 },
    );
  }

  if (
    !intake.authorizationReference ||
    !intake.privacyMaskingRequired ||
    !intake.faceBlurRequired ||
    !intake.plateMaskingRequired ||
    !intake.humanReviewRequired
  ) {
    return NextResponse.json(
      { error: "Authorization reference and all privacy/human-review controls are required." },
      { status: 400 },
    );
  }

  const response = await createPresignedUploadUrl({
    intakeId: body.intakeId,
    fileName: body.fileName,
    contentType: body.contentType,
    fileSizeBytes: body.fileSizeBytes,
  });

  await updateAuthorizedFootageIntake(intake.id, {
    status: response.enabled ? "upload_url_issued" : intake.status,
    originalFileName: body.fileName,
    fileSizeBytes: body.fileSizeBytes,
    contentType: body.contentType,
    storageObjectKey: response.objectKey ?? intake.storageObjectKey,
    notes: intake.notes,
  });

  return NextResponse.json(response);
}
