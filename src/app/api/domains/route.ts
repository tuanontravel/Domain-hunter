import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_DOMAINS } from '@/data/initialDomains';

const CACHE_JSON_PATH = '/opt/zalo-agent/data/domains_cache.json';

export async function GET() {
  try {
    if (fs.existsSync(CACHE_JSON_PATH)) {
      const data = fs.readFileSync(CACHE_JSON_PATH, 'utf-8');
      const domains = JSON.parse(data);
      if (Array.isArray(domains) && domains.length > 0) {
        return NextResponse.json({ success: true, domains });
      }
    }
    return NextResponse.json({ success: true, domains: INITIAL_DOMAINS });
  } catch (err: any) {
    return NextResponse.json({ success: true, domains: INITIAL_DOMAINS });
  }
}
