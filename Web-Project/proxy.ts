import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = new Set([
  "http://localhost:8081",
  "http://127.0.0.1:8081"
]);

const expoDevOriginPattern =
  /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):(8081|19006)$/;

function isAllowedOrigin(origin: string) {
  return allowedOrigins.has(origin) || expoDevOriginPattern.test(origin);
}

function corsHeaders(origin: string | null) {
  const headers = new Headers();

  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-HunaSuna-Client");

  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  return headers;
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers
    });
  }

  const response = NextResponse.next();

  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*"
};
