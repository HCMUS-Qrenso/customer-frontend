import { NextRequest, NextResponse } from 'next/server';
import { StartSessionRequest, StartSessionResponse } from '@/app/[tenantSlug]/t/[tableCode]/types';

// Generate a random session token
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Mock database of valid tenant/table combinations
const VALID_TABLES: Record<string, string[]> = {
  'demo-restaurant': ['TABLE05', 'TABLE10', 'TABLE99'],
  'cafe-milano': ['A1'],
};

export async function POST(request: NextRequest) {
  try {
    const body: StartSessionRequest = await request.json();
    const { tenantSlug, tableCode, preferredLanguage, partySize } = body;

    // Validate required fields
    if (!tenantSlug || !tableCode || !preferredLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantSlug, tableCode, preferredLanguage' },
        { status: 400 }
      );
    }

    // Simulate network delay (realistic session creation time)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate tenant/table combination
    const tenantTables = VALID_TABLES[tenantSlug];
    if (!tenantTables || !tenantTables.includes(tableCode)) {
      return NextResponse.json(
        { error: 'Invalid tenant or table' },
        { status: 404 }
      );
    }

    // Check if table is inactive (TABLE99 is maintenance)
    if (tableCode === 'TABLE99') {
      return NextResponse.json(
        { error: 'Table is currently unavailable' },
        { status: 409 } // Conflict
      );
    }

    // Generate new session token
    const sessionToken = generateSessionToken();

    // Log for demo purposes (in real app, this would write to DB)
    console.log('[Session Start]', {
      tenantSlug,
      tableCode,
      preferredLanguage,
      partySize,
      sessionToken,
      startedAt: new Date().toISOString(),
    });

    const response: StartSessionResponse = {
      sessionToken,
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
