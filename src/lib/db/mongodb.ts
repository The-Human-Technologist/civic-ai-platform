import { MongoClient, type Db } from "mongodb";

let cachedClient: MongoClient | null = null;

function getMongoUri(): string | undefined {
  const value = process.env.MONGODB_URI?.trim();
  return value ? value : undefined;
}

function getMongoDbName(): string {
  return process.env.MONGODB_DB_NAME?.trim() || "civic_ai_platform";
}

export function hasMongoConfig(): boolean {
  return Boolean(getMongoUri());
}

export async function getMongoClient(): Promise<MongoClient> {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. The public demo can run without MongoDB, but real DB access requires MONGODB_URI.",
    );
  }

  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new MongoClient(uri);
  await cachedClient.connect();
  return cachedClient;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getMongoDbName());
}
