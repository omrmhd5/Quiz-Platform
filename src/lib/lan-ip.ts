import os from "node:os";

function isIpv4(family: string | number) {
  return family === "IPv4" || family === 4;
}

function privateIpv4Priority(ip: string): number | null {
  if (ip.startsWith("192.168.")) {
    return 0;
  }

  if (ip.startsWith("10.")) {
    return 1;
  }

  const match = /^172\.(\d+)\./.exec(ip);
  if (match) {
    const secondOctet = Number(match[1]);
    if (secondOctet >= 16 && secondOctet <= 31) {
      return 2;
    }
  }

  return null;
}

export function getLanIpv4Address(): string | null {
  const candidates: { ip: string; priority: number }[] = [];

  for (const addresses of Object.values(os.networkInterfaces())) {
    if (!addresses) {
      continue;
    }

    for (const address of addresses) {
      if (!isIpv4(address.family) || address.internal) {
        continue;
      }

      const priority = privateIpv4Priority(address.address);
      if (priority !== null) {
        candidates.push({ ip: address.address, priority });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => a.priority - b.priority);
  return candidates[0].ip;
}
