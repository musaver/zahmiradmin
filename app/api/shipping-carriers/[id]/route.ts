import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shippingCarriers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const carrier = await db
      .select()
      .from(shippingCarriers)
      .where(eq(shippingCarriers.id, id))
      .limit(1);
      
    if (carrier.length === 0) {
      return NextResponse.json({ error: 'Shipping carrier not found' }, { status: 404 });
    }
    
    return NextResponse.json(carrier[0]);
  } catch (error) {
    console.error('Error fetching shipping carrier:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping carrier' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      name,
      code,
      description,
      website,
      trackingUrl,
      apiEndpoint,
      apiKey,
      isActive,
      sortOrder
    } = await req.json();
    
    // Validate required fields
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }
    
    // Check if carrier exists
    const existing = await db
      .select()
      .from(shippingCarriers)
      .where(eq(shippingCarriers.id, id))
      .limit(1);
      
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Shipping carrier not found' }, { status: 404 });
    }
    
    // Check if code is unique (excluding current record)
    const codeExists = await db
      .select({ id: shippingCarriers.id })
      .from(shippingCarriers)
      .where(eq(shippingCarriers.code, code))
      .limit(1);
      
    if (codeExists.length > 0 && codeExists[0].id !== id) {
      return NextResponse.json({ error: 'Carrier code already exists' }, { status: 400 });
    }
    
    const updateData = {
      name,
      code,
      description: description || null,
      website: website || null,
      trackingUrl: trackingUrl || null,
      apiEndpoint: apiEndpoint || null,
      apiKey: apiKey || null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
      updatedAt: new Date(),
    };
    
    await db
      .update(shippingCarriers)
      .set(updateData)
      .where(eq(shippingCarriers.id, id));
    
    return NextResponse.json({ ...updateData, id });
  } catch (error) {
    console.error('Error updating shipping carrier:', error);
    return NextResponse.json({ error: 'Failed to update shipping carrier' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if carrier exists
    const existing = await db
      .select()
      .from(shippingCarriers)
      .where(eq(shippingCarriers.id, id))
      .limit(1);
      
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Shipping carrier not found' }, { status: 404 });
    }
    
    await db
      .delete(shippingCarriers)
      .where(eq(shippingCarriers.id, id));
    
    return NextResponse.json({ message: 'Shipping carrier deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipping carrier:', error);
    return NextResponse.json({ error: 'Failed to delete shipping carrier' }, { status: 500 });
  }
} 