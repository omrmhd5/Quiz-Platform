import { headers } from "next/headers";
import { getLanIpv4Address } from "@/lib/lan-ip";

function getDefaultPort() {
  return process.env.APP_PORT ?? "3000";
}

function parseHost(hostHeader: string) {
  const host = hostHeader.trim();

  if (host.startsWith("[")) {
    const match = /^\[([^\]]+)\](?::(\d+))?$/.exec(host);
    if (match) {
      return {
        hostname: match[1],
        port: match[2] ?? getDefaultPort(),
      };
    }
  }

  const colonIndex = host.lastIndexOf(":");
  if (colonIndex > -1 && !host.includes("]")) {
    return {
      hostname: host.slice(0, colonIndex),
      port: host.slice(colonIndex + 1) || getDefaultPort(),
    };
  }

  return { hostname: host, port: getDefaultPort() };
}

function isLoopbackHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "0.0.0.0"
  );
}

function buildJoinUrl(protocol: string, host: string) {
  return `${protocol}://${host.replace(/\/+$/, "")}/join`;
}

export async function getJoinUrl() {
  const headerStore = await headers();
  const rawHost =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    `localhost:${getDefaultPort()}`;
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const hostHeader = rawHost.split(",")[0].trim();

  const envHost = process.env.LAN_HOST ?? process.env.APP_HOST;
  if (envHost) {
    const port = getDefaultPort();
    const host = envHost.includes(":") ? envHost : `${envHost}:${port}`;
    return buildJoinUrl(protocol, host);
  }

  const { hostname, port } = parseHost(hostHeader);

  if (!isLoopbackHost(hostname)) {
    return buildJoinUrl(protocol, hostHeader);
  }

  const lanIp = getLanIpv4Address();
  if (lanIp) {
    return buildJoinUrl(protocol, `${lanIp}:${port}`);
  }

  return buildJoinUrl(protocol, hostHeader);
}

export function buildJoinUrlFromHost(host: string, protocol = "http") {
  return buildJoinUrl(protocol, host);
}
