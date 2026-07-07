import { randomUUID } from "node:crypto";
import { getDb, hasMongoConfig } from "@/lib/db/mongodb";
import type {
  AuthorizedFootageIntake,
  CreateAuthorizedFootageIntakeInput,
} from "@/lib/storage/types";

const AUTHORIZED_FOOTAGE_COLLECTION = "authorized_footage_intakes";

// In-memory fallback keeps local demo/dev usable without MongoDB.
// It is intentionally non-persistent and must not be treated as production storage.
const inMemoryIntakes = new Map<string, AuthorizedFootageIntake>();

function nowIso(): string {
  return new Date().toISOString();
}

function shouldUseInMemoryStore(): boolean {
  return !hasMongoConfig();
}

export async function createAuthorizedFootageIntake(
  input: CreateAuthorizedFootageIntakeInput,
): Promise<AuthorizedFootageIntake> {
  const timestamp = nowIso();
  const intake: AuthorizedFootageIntake = {
    id: randomUUID(),
    title: input.title,
    sourceType: input.sourceType,
    locationLabel: input.locationLabel,
    jurisdiction: input.jurisdiction,
    authorizationContact: input.authorizationContact,
    authorizationReference: input.authorizationReference,
    authorizationDate: input.authorizationDate,
    retentionDays: input.retentionDays,
    privacyMaskingRequired: input.privacyMaskingRequired,
    plateMaskingRequired: input.plateMaskingRequired,
    faceBlurRequired: input.faceBlurRequired,
    status: input.status ?? "awaiting_authorization",
    storageObjectKey: input.storageObjectKey,
    originalFileName: input.originalFileName,
    fileSizeBytes: input.fileSizeBytes,
    contentType: input.contentType,
    createdAt: timestamp,
    updatedAt: timestamp,
    notes: input.notes,
    humanReviewRequired: input.humanReviewRequired ?? true,
  };

  if (shouldUseInMemoryStore()) {
    inMemoryIntakes.set(intake.id, intake);
    return intake;
  }

  const db = await getDb();
  await db.collection<AuthorizedFootageIntake>(AUTHORIZED_FOOTAGE_COLLECTION).insertOne(intake);
  return intake;
}

export async function getAuthorizedFootageIntake(
  id: string,
): Promise<AuthorizedFootageIntake | null> {
  if (shouldUseInMemoryStore()) {
    return inMemoryIntakes.get(id) ?? null;
  }

  const db = await getDb();
  return db.collection<AuthorizedFootageIntake>(AUTHORIZED_FOOTAGE_COLLECTION).findOne({ id });
}

export async function updateAuthorizedFootageIntake(
  id: string,
  patch: Partial<Omit<AuthorizedFootageIntake, "id" | "createdAt">>,
): Promise<AuthorizedFootageIntake | null> {
  const existing = await getAuthorizedFootageIntake(id);
  if (!existing) return null;

  const nextIntake: AuthorizedFootageIntake = {
    ...existing,
    ...patch,
    updatedAt: nowIso(),
  };

  if (shouldUseInMemoryStore()) {
    inMemoryIntakes.set(id, nextIntake);
    return nextIntake;
  }

  const db = await getDb();
  await db
    .collection<AuthorizedFootageIntake>(AUTHORIZED_FOOTAGE_COLLECTION)
    .updateOne({ id }, { $set: nextIntake });
  return nextIntake;
}

export async function listAuthorizedFootageIntakes(
  limit = 20,
): Promise<AuthorizedFootageIntake[]> {
  if (shouldUseInMemoryStore()) {
    return [...inMemoryIntakes.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  const db = await getDb();
  return db
    .collection<AuthorizedFootageIntake>(AUTHORIZED_FOOTAGE_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}
