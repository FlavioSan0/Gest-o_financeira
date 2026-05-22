const REQUIRED_SSL_MODE = "verify-full";
const REQUIRED_CHANNEL_BINDING = "require";

export function getRequiredDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL não configurada. Defina a connection string do PostgreSQL/Neon com sslmode=verify-full e channel_binding=require.",
    );
  }

  const parsedUrl = new URL(databaseUrl);
  const sslMode = parsedUrl.searchParams.get("sslmode");
  const channelBinding = parsedUrl.searchParams.get("channel_binding");

  if (
    sslMode !== REQUIRED_SSL_MODE ||
    channelBinding !== REQUIRED_CHANNEL_BINDING
  ) {
    throw new Error(
      "DATABASE_URL inválida. Use sslmode=verify-full e channel_binding=require na connection string.",
    );
  }

  return databaseUrl;
}
