import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const KEYWORDS_FILE = '/opt/zalo-agent/data/domain_keywords.json';

function getKeywords() {
  try {
    if (fs.existsSync(KEYWORDS_FILE)) {
      const data = fs.readFileSync(KEYWORDS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading keywords file:', e);
  }
  return [];
}

function saveKeywords(keywords: any[]) {
  fs.writeFileSync(KEYWORDS_FILE, JSON.stringify(keywords, null, 2), 'utf-8');
}

export async function GET() {
  const keywords = getKeywords();
  return NextResponse.json({ success: true, keywords });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { keyword, category = 'General' } = body;
    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json({ success: false, error: 'Từ khóa không hợp lệ' }, { status: 400 });
    }
    const cleanKw = keyword.trim().toLowerCase();
    const list = getKeywords();
    if (list.some((k: any) => k.keyword.toLowerCase() === cleanKw)) {
      return NextResponse.json({ success: false, error: 'Từ khóa đã tồn tại' }, { status: 400 });
    }
    const newEntry = {
      id: `kw-${Date.now()}`,
      keyword: cleanKw,
      category: category.trim() || 'General',
      enabled: true,
      created_at: new Date().toISOString()
    };
    list.push(newEntry);
    saveKeywords(list);
    return NextResponse.json({ success: true, keyword: newEntry, keywords: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, enabled } = body;
    const list = getKeywords();
    const item = list.find((k: any) => k.id === id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy từ khóa' }, { status: 404 });
    }
    if (typeof enabled === 'boolean') {
      item.enabled = enabled;
    }
    saveKeywords(list);
    return NextResponse.json({ success: true, keyword: item, keywords: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const kw = searchParams.get('keyword');
    let list = getKeywords();
    if (id) {
      list = list.filter((k: any) => k.id !== id);
    } else if (kw) {
      list = list.filter((k: any) => k.keyword.toLowerCase() !== kw.toLowerCase());
    } else {
      return NextResponse.json({ success: false, error: 'Thiếu id hoặc keyword' }, { status: 400 });
    }
    saveKeywords(list);
    return NextResponse.json({ success: true, keywords: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
