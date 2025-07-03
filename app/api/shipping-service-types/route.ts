import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shippingServiceTypes } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allServiceTypes = await db
      .select()
      .from(shippingServiceTypes)
      .orderBy(desc(shippingServiceTypes.sortOrder), shippingServiceTypes.name);
      
    return NextResponse.json(allServiceTypes);
  } catch (error) {
    console.error('Error fetching shipping service types:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping service types' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      code,
      description,
      category,
      isActive = true,
      sortOrder = 0
    } = await req.json();
    
    // Validate required fields
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }
    
    // Check if code already exists
    const existing = await db
      .select({ id: shippingServiceTypes.id })
      .from(shippingServiceTypes)
      .where(eq(shippingServiceTypes.code, code))
      .limit(1);
      
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Service type code already exists' }, { status: 400 });
    }
    
    const newServiceType = {
      id: uuidv4(),
      name,
      code,
      description: description || null,
      category: category || null,
      isActive,
      sortOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(shippingServiceTypes).values(newServiceType);
    
    return NextResponse.json(newServiceType, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping service type:', error);
    return NextResponse.json({ error: 'Failed to create shipping service type' }, { status: 500 });
  }
} 