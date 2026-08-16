import type { NextConfig } from "next";
import { getLanIpv4Address } from "./src/lib/lan-ip";

const devOrigins = new Set<string>([
  "192.168.*.*",
  "10.*.*.*",
  "172.16.*.*",
  "172.17.*.*",
  "172.18.*.*",
  "172.19.*.*",
  "172.20.*.*",
  "172.21.*.*",
  "172.22.*.*",
  "172.23.*.*",
  "172.24.*.*",
  "172.25.*.*",
  "172.26.*.*",
  "172.27.*.*",
  "172.28.*.*",
  "172.29.*.*",
  "172.30.*.*",
  "172.31.*.*",
]);

const lanIp = getLanIpv4Address();
if (lanIp) {
  devOrigins.add(lanIp);
}

const envHost = process.env.LAN_HOST ?? process.env.APP_HOST;
if (envHost) {
  devOrigins.add(envHost.split(":")[0]);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [...devOrigins],
};

export default nextConfig;
