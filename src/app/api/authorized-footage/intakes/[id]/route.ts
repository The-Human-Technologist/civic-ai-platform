import { NextResponse } from "next/server";
import {
  getAuthorizedFootageIntake,
  updateAuthorizedFootageIntake,
} from "@/lib/db/authorized-footage";
import {
  AUTHORIZED_FOOTAGE_INTAKE_STATUSES,
  type AuthorizedFootageIntake,
  type AuthorizedFootageIntakeStatus,
} from "@/lib/storage/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PatchPayload = Partial<Omit<AuthorizedFootageIntake, "id" | "createdAt" | "updatedAt">>;

const STATUS_RANK: Record<AuthorizedFootageIntakeStatus, number> = {
  draft: 0,
  awaiting_authorization: 1,
  authorized: 2,
  upload_url_issued: 3,
  uploaded: 4,
  queued_for_processing: 5,
  rejected: 99,
  expired: 100,
};

function isSafeStatusTransition(
  currentStatus: AuthorizedFootageIntakeStatus,
  nextStatus: AuthorizedFootageIntakeStatus,
): boolean {
  if (currentStatus === nextStatus) return true;
  if (nextStatus === "rejected" || nextStatus === "expired") return true;
  return STATUS_RANK[nextStatus] >= STATUS_RANK[currentStatus];
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const intake = await getAuthorizedFootageIntake(id);

  if (!intake) {
    return NextResponse.json({ error: "Authorized footage intake not found." }, { status: 404 });
  }

  return NextResponse.json({ intake });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const existing = await getAuthorizedFootageIntake(id);

  if (!existing) {
    return NextResponse.json({ error: "Authorized footage intake not found." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as PatchPayload;

  if (body.status) {
    if (!AUTHORIZED_FOOTAGE_INTAKE_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid intake status." }, { status: 400 });
    }

    if (!isSafeStatusTransition(existing.status, body.status)) {
      return NextResponse.json(
        { error: `Unsafe intake status transition from ${existing.status} to ${body.status}.` },
        { status: 400 },
      );
    }

    if (body.status === "uploaded" && !body.storageObjectKey && !body.notes && !existing.storageObjectKey) {
      return NextResponse.json(
        {
          error:
            "Cannot mark intake as uploaded without a storage object key or explicit metadata note.",
        },
        { status: 400 },
      );
    }
  }

  const intake = await updateAuthorizedFootageIntake(id, body);
  return NextResponse.json({ intake });
}
