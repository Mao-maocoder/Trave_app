interface GeoResponse {
  country: string;
  countryCode: string;
  regionName: string;
  status: string;
}

const cache = new Map<string, { location: string; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

export function extractIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") return "";
  return ip;
}

export async function getIpLocation(req: Request): Promise<string> {
  const ip = extractIp(req);
  if (!ip) return "北京";

  const cached = cache.get(ip);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.location;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN&fields=country,countryCode,regionName,status`, {
      signal: AbortSignal.timeout(3000),
    });
    const data: GeoResponse = await res.json();
    if (data.status === "success") {
      const location = data.countryCode === "CN" ? data.regionName : data.country;
      cache.set(ip, { location, ts: Date.now() });
      return location;
    }
  } catch {
    // fallback
  }

  return "未知";
}
