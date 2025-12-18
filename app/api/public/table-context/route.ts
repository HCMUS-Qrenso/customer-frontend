import { NextRequest, NextResponse } from 'next/server';
import { TableContextDTO } from '@/app/[tenantSlug]/t/[tableCode]/types';

// Mock data for demo purposes
const MOCK_TENANTS: Record<string, TableContextDTO['tenant']> = {
  'demo-restaurant': {
    id: 'tenant_001',
    name: 'Phở 24',
    slug: 'demo-restaurant',
    address: 'District 1, HCMC',
    settings: {
      logoUrl: undefined,
      coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      primaryColor: '#36e29b',
    },
  },
  'cafe-milano': {
    id: 'tenant_002',
    name: 'Café Milano',
    slug: 'cafe-milano',
    address: '123 Nguyễn Huệ, Q1, HCMC',
    settings: {
      logoUrl: undefined,
      coverImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
      primaryColor: '#8B4513',
    },
  },
};

const MOCK_TABLES: Record<string, Record<string, TableContextDTO['table']>> = {
  'demo-restaurant': {
    'TABLE05': {
      id: 'table_001',
      tableNumber: '05',
      capacity: 4,
      status: 'available',
      isActive: true,
      zoneName: 'Garden Zone',
    },
    'TABLE10': {
      id: 'table_002',
      tableNumber: '10',
      capacity: 6,
      status: 'available',
      isActive: true,
      zoneName: 'Indoor',
    },
    'TABLE99': {
      id: 'table_003',
      tableNumber: '99',
      capacity: 2,
      status: 'maintenance',
      isActive: false,
      zoneName: 'VIP',
    },
  },
  'cafe-milano': {
    'A1': {
      id: 'table_004',
      tableNumber: 'A1',
      capacity: 2,
      status: 'available',
      isActive: true,
      zoneName: 'Terrace',
    },
  },
};

// Simulate stored sessions (in real app, this would be in DB)
const ACTIVE_SESSIONS: Record<string, string> = {};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get('tenantSlug');
  const tableCode = searchParams.get('tableCode');

  // Validate required params
  if (!tenantSlug || !tableCode) {
    return NextResponse.json(
      { error: 'Missing required parameters: tenantSlug and tableCode' },
      { status: 400 }
    );
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Find tenant
  const tenant = MOCK_TENANTS[tenantSlug];
  if (!tenant) {
    return NextResponse.json(
      { error: 'Tenant not found' },
      { status: 404 }
    );
  }

  // Find table
  const tenantTables = MOCK_TABLES[tenantSlug];
  const table = tenantTables?.[tableCode];
  if (!table) {
    return NextResponse.json(
      { error: 'Table not found' },
      { status: 404 }
    );
  }

  // Check for active session
  const sessionKey = `${tenantSlug}:${tableCode}`;
  const activeSession = ACTIVE_SESSIONS[sessionKey]
    ? { sessionToken: ACTIVE_SESSIONS[sessionKey] }
    : undefined;

  const response: TableContextDTO = {
    tenant,
    table,
    activeSession,
  };

  return NextResponse.json(response);
}
