import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

loadLocalDbEnv();

const DEV_BYPASS_USER_ID =
  process.env.DEV_BYPASS_USER_ID || "dev-bypass-user";
const DEV_BYPASS_EMAIL =
  process.env.DEV_BYPASS_EMAIL || "dev-bypass@pandadraw.local";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prismaClient =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prismaClient;
}

export async function ensureBypassUser() {
  const user = await prismaClient.user.upsert({
    where: {
      email: DEV_BYPASS_EMAIL,
    },
    update: {
      name: "Dev Bypass User",
    },
    create: {
      id: DEV_BYPASS_USER_ID,
      email: DEV_BYPASS_EMAIL,
      password: "dev-bypass-password",
      name: "Dev Bypass User",
    },
  });

  return user.id;
}

function loadLocalDbEnv() {
  const envPath = resolve(__dirname, "../.env");

  if (!existsSync(envPath)) {
    return;
  }

  const envFile = readFileSync(envPath, "utf8");

  for (const rawLine of envFile.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}
