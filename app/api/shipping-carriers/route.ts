import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shippingCarriers } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allCarriers = await db
      .select()
      .from(shippingCarriers)
      .orderBy(desc(shippingCarriers.sortOrder), shippingCarriers.name);
      
    return NextResponse.json(allCarriers);
  } catch (error) {
    console.error('Error fetching shipping carriers:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping carriers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      code,
      description,
      website,
      trackingUrl,
      apiEndpoint,
      apiKey,
      isActive = true,
      sortOrder = 0
    } = await req.json();
    
    // Validate required fields
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }
    
    // Check if code already exists
    const existing = await db
      .select({ id: shippingCarriers.id })
      .from(shippingCarriers)
      .where(eq(shippingCarriers.code, code))
      .limit(1);
      
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Carrier code already exists' }, { status: 400 });
    }
    
    const newCarrier = {
      id: uuidv4(),
      name,
      code,
      description: description || null,
      website: website || null,
      trackingUrl: trackingUrl || null,
      apiEndpoint: apiEndpoint || null,
      apiKey: apiKey || null,
      isActive,
      sortOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(shippingCarriers).values(newCarrier);
    
    return NextResponse.json(newCarrier, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping carrier:', error);
    return NextResponse.json({ error: 'Failed to create shipping carrier' }, { status: 500 });
  }
} 