import { NextResponse } from "next/server";
import {
  createAuthorizedFootageIntake,
  listAuthorizedFootageIntakes,
} from "@/lib/db/authorized-footage";
import { getStorageConfig } from "@/lib/storage/config";
import type {
  AuthorizedFootageSourceType,
  CreateAuthorizedFootageIntakeInput,
} from "@/lib/storage/types";

type CreateIntakePayload = Partial<CreateAuthorizedFootageIntakeInput>;

const VALID_SOURCE_TYPES: AuthorizedFootageSourceType[] = [
  "municipal_uploaded_clip",
  "traffic_department_clip",
  "ward_office_clip",
  "synthetic_demo",
  "external_dataset_reference",
];

export async function GET() {
  const intakes = await listAuthorizedFootageIntakes();
  return NextResponse.json({
    intakes,
    storage: getStorageConfig(),
    note: "Authorized footage intake stores metadata only unless controlled storage is explicitly enabled.",
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateIntakePayload;

  if (!body.title || !body.locationLabel || !body.jurisdiction || !body.sourceType) {
    return NextResponse.json(
      { error: "title, sourceType, locationLabel, and jurisdiction are required." },
      { status: 400 },
    );
  }

  if (!VALID_SOURCE_TYPES.includes(body.sourceType)) {
    return NextResponse.json({ error: "Invalid authorized footage source type." }, { status: 400 });
  }

  if (!body.authorizationContact && !body.notes) {
    return NextResponse.json(
      { error: "authorizationContact or notes is required for intake traceability." },
      { status: 400 },
    );
  }

  if (
    body.privacyMaskingRequired === false ||
    body.faceBlurRequired === false ||
    body.plateMaskingRequired === false ||
    body.humanReviewRequired === false
  ) {
    return NextResponse.json(
      {
        error:
          "Privacy masking, face blur, plate masking, and human review are mandatory for authorized footage intake.",
      },
      { status: 400 },
    );
  }

  const retentionDays =
    typeof body.retentionDays === "number" && body.retentionDays > 0 ? body.retentionDays : 30;
  const status = body.status === "authorized" ? "authorized" : "awaiting_authorization";

  if (status === "authorized" && !body.authorizationReference?.trim()) {
    return NextResponse.json(
      { error: "An authorization reference is required before an intake can be marked authorized." },
      { status: 400 },
    );
  }

  const intake = await createAuthorizedFootageIntake({
    title: body.title,
    sourceType: body.sourceType,
    locationLabel: body.locationLabel,
    jurisdiction: body.jurisdiction,
    authorizationContact: body.authorizationContact ?? "Pending authorization contact",
    authorizationReference: body.authorizationReference,
    authorizationDate: body.authorizationDate,
    retentionDays,
    privacyMaskingRequired: true,
    plateMaskingRequired: true,
    faceBlurRequired: true,
    status,
    notes: body.notes,
    humanReviewRequired: true,
  });

  return NextResponse.json(
    {
      intake,
      note: "Authorized footage intake created. Persistent storage stays disabled by default; direct worker analysis deletes source clips.",
    },
    { status: 201 },
  );
}
