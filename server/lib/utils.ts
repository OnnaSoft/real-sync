import crypto from 'crypto';
import { Request } from 'express';
import geoip from "geoip-lite";

const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateUniqueKey(n: number = 32): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString('hex');

  let uniqueKey = '';
  const combined = timestamp + randomBytes;

  for (let i = 0; i < n; i++) {
    const index = parseInt(combined[i], 16) % charset.length;
    uniqueKey += charset[index];
  }

  return uniqueKey;
}

export const getClientIp = (req: Request<any, any, any, any>): string => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ipList = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
      .split(",")
      .map((ip) => ip.trim());
    return ipList[0];
  }

  return req.socket.remoteAddress ?? "";
};

export const getClientMetadata = (req: Request<any, any, any, any>) => {
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] ?? "Unknown";
  const isMobile = /mobile|android|touch|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );  

  const geoData = geoip.lookup(ip);

  return {
    ip,
    userAgent,
    isMobile,
    deviceType: isMobile ? "Mobile" : "Desktop",
    timestamp: new Date(),
    geo: {
      country: geoData?.country ?? "Unknown",
      region: geoData?.region ?? "Unknown",
      city: geoData?.city ?? "Unknown",
      timezone: geoData?.timezone ?? "Unknown",
      coordinates: geoData?.ll ? { lat: geoData.ll[0], lon: geoData.ll[1] } : null,
    },
  };
};
