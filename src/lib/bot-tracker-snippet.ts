import { DEFAULT_BOT_TRACKER_ENDPOINT, SITE_API_KEY_HEADER } from "@/lib/constants";
import { BOT_UA_BASIC_PATTERN } from "@/lib/bots";

export type BotNextConvention = "middleware" | "proxy";
export type BotSnippetLanguage = "ts" | "js";

function fileComment(
  convention: BotNextConvention,
  language: BotSnippetLanguage
): string {
  const ext = language === "ts" ? "ts" : "js";
  if (convention === "proxy") {
    return `// src/proxy.${ext} — Next.js 16+ (merge into your existing proxy() if you already have one)`;
  }
  return `// middleware.${ext} — Next.js 15 and earlier`;
}

function handlerName(convention: BotNextConvention): string {
  return convention === "proxy" ? "proxy" : "middleware";
}

function buildImports(language: BotSnippetLanguage): string {
  if (language === "ts") {
    return `import { NextResponse, type NextRequest } from "next/server";`;
  }
  return `import { NextResponse } from "next/server";`;
}

function buildClientIp(language: BotSnippetLanguage): string {
  const body = `  const h = request.headers;

  const cf = h.get("cf-connecting-ip");
  if (cf && cf.trim()) return cf.trim();

  const trueClient = h.get("true-client-ip");
  if (trueClient && trueClient.trim()) return trueClient.trim();

  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const real = h.get("x-real-ip");
  if (real && real.trim()) return real.trim();

  return null;`;

  if (language === "ts") {
    return `function clientIp(request: NextRequest): string | null {
${body}
}`;
  }
  return `function clientIp(request) {
${body}
}`;
}

function buildHandler(
  convention: BotNextConvention,
  language: BotSnippetLanguage
): string {
  const name = handlerName(convention);
  const param = language === "ts" ? "request: NextRequest" : "request";
  const returnType = language === "ts" ? ": Promise<NextResponse>" : "";
  return `export async function ${name}(${param})${returnType} {
  const ua = request.headers.get("user-agent") || "";
  if (BOT_UA.test(ua)) {
    const path = request.nextUrl.pathname.slice(0, 500) || "/";
    const ip = clientIp(request);
    fetch(BOT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "${SITE_API_KEY_HEADER}": API_KEY,
      },
      body: JSON.stringify({
        site_key: SITE_KEY,
        user_agent: ua.slice(0, 500),
        path,
        ip: ip?.slice(0, 45) ?? null,
      }),
    }).catch(() => {});
  }
  return NextResponse.next();
}`;
}

export function buildBotInlineSnippet(opts: {
  siteKey: string;
  apiKey: string;
  endpoint?: string;
  convention: BotNextConvention;
  language: BotSnippetLanguage;
}): string {
  const endpoint = opts.endpoint ?? DEFAULT_BOT_TRACKER_ENDPOINT;
  const siteKey = opts.siteKey;
  const apiKey = opts.apiKey;
  const uaSource = BOT_UA_BASIC_PATTERN.source;

  return `${fileComment(opts.convention, opts.language)}
${buildImports(opts.language)}

// Basic bot check only — Open Analytics verifies UA + IP on the server
const BOT_UA = /${uaSource}/i;
const SITE_KEY = "${siteKey}";
const API_KEY = "${apiKey}";
const BOT_ENDPOINT = "${endpoint}";

${buildClientIp(opts.language)}

${buildHandler(opts.convention, opts.language)}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};`;
}

export function snippetFileLabel(
  convention: BotNextConvention,
  language: BotSnippetLanguage
): string {
  const ext = language === "ts" ? "ts" : "js";
  const base = convention === "proxy" ? "proxy" : "middleware";
  return `${base}.${ext}`;
}
