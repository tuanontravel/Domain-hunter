import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain')?.toLowerCase().trim();

  if (!domain) {
    return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
  }

  try {
    const isCom = domain.endsWith('.com');
    const rdapUrl = isCom
      ? `https://rdap.verisign.com/com/v1/domain/${encodeURIComponent(domain)}`
      : `https://rdap.org/domain/${encodeURIComponent(domain)}`;

    const res = await fetch(rdapUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (DomainHunter/1.0)',
        'Accept': 'application/rdap+json, application/json',
      },
      next: { revalidate: 3600 }
    });

    if (res.status === 404) {
      return NextResponse.json({
        domain,
        status: 'available',
        sub_status: 'free_to_register',
        registered_date: null,
        expiration_date: null,
        days_left: 0,
        registrar: null,
        nameservers: []
      });
    }

    if (!res.ok) {
      return NextResponse.json({
        domain,
        status: 'error',
        sub_status: `http_${res.status}`,
        message: 'RDAP query failed'
      }, { status: res.status });
    }

    const data = await res.json();
    const statuses: string[] = (data.status || []).map((s: string) => s.toLowerCase());
    const events: Record<string, string> = {};
    for (const ev of data.events || []) {
      if (ev.eventAction && ev.eventDate) {
        events[ev.eventAction] = ev.eventDate;
      }
    }

    const expStr = events['expiration'] || events['registration expiration'] || null;
    const regStr = events['registration'] || null;

    let daysLeft: number | null = null;
    if (expStr) {
      const expDt = new Date(expStr);
      const now = new Date();
      daysLeft = Math.ceil((expDt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    let subStatus = 'active';
    if (statuses.some(s => s.includes('pending delete'))) {
      subStatus = 'pendingDelete';
    } else if (statuses.some(s => s.includes('redemption'))) {
      subStatus = 'redemptionPeriod';
    } else if (statuses.some(s => s.includes('hold'))) {
      subStatus = 'clientHold';
    } else if (daysLeft !== null && daysLeft <= 0) {
      subStatus = 'expired_grace';
    }

    let registrarName = 'Unknown';
    if (data.entities) {
      for (const ent of data.entities) {
        if (ent.roles?.includes('registrar') && ent.vcardArray?.[1]) {
          const fn = ent.vcardArray[1].find((item: any) => item[0] === 'fn');
          if (fn && fn[3]) {
            registrarName = fn[3];
            break;
          }
        }
      }
    }

    return NextResponse.json({
      domain,
      status: 'registered',
      sub_status: subStatus,
      registered_date: regStr,
      expiration_date: expStr,
      days_left: daysLeft,
      registrar: registrarName,
      raw_statuses: statuses
    });
  } catch (err: any) {
    return NextResponse.json({
      domain,
      status: 'error',
      sub_status: 'exception',
      message: err.message || 'Error querying RDAP'
    }, { status: 500 });
  }
}
