import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shippingMethods, shippingCarriers, shippingServiceTypes } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const shippingMethodData = await db
      .select({
        method: shippingMethods,
        carrier: {
          id: shippingCarriers.id,
          name: shippingCarriers.name,
          code: shippingCarriers.code,
          trackingUrl: shippingCarriers.trackingUrl,
        },
        serviceType: {
          id: shippingServiceTypes.id,
          name: shippingServiceTypes.name,
          code: shippingServiceTypes.code,
          category: shippingServiceTypes.category,
        },
      })
      .from(shippingMethods)
      .leftJoin(shippingCarriers, eq(shippingMethods.carrierId, shippingCarriers.id))
      .leftJoin(shippingServiceTypes, eq(shippingMethods.serviceTypeId, shippingServiceTypes.id))
      .where(eq(shippingMethods.id, id))
      .limit(1);
      
    if (shippingMethodData.length === 0) {
      return NextResponse.json({ error: 'Shipping method not found' }, { status: 404 });
    }
    
    // Flatten the response
    const result = {
      ...shippingMethodData[0].method,
      carrier: shippingMethodData[0].carrier,
      serviceType: shippingMethodData[0].serviceType,
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching shipping method:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping method' }, { status: 500 });
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
      price,
      estimatedDays,
      isActive,
      sortOrder,
      carrierId,
      serviceTypeId,
      // Keep legacy fields for backward compatibility
      carrierCode,
      serviceCode
    } = await req.json();
    
    // Validate required fields
    if (!name || !code || !price) {
      return NextResponse.json({ error: 'Name, code, and price are required' }, { status: 400 });
    }
    
    // Check if shipping method exists
    const existing = await db
      .select()
      .from(shippingMethods)
      .where(eq(shippingMethods.id, id))
      .limit(1);
      
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Shipping method not found' }, { status: 404 });
    }
    
    // Check if code is unique (excluding current record)
    const codeExists = await db
      .select({ id: shippingMethods.id })
      .from(shippingMethods)
      .where(eq(shippingMethods.code, code))
      .limit(1);
      
    if (codeExists.length > 0 && codeExists[0].id !== id) {
      return NextResponse.json({ error: 'Shipping method code already exists' }, { status: 400 });
    }
    
    const updateData = {
      name,
      code,
      description: description || null,
      price: price.toString(),
      estimatedDays: estimatedDays || null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
      carrierId: carrierId || null,
      serviceTypeId: serviceTypeId || null,
      // Keep legacy fields for backward compatibility
      carrierCode: carrierCode || null,
      serviceCode: serviceCode || null,
      updatedAt: new Date(),
    };
    
    await db
      .update(shippingMethods)
      .set(updateData)
      .where(eq(shippingMethods.id, id));
    
    return NextResponse.json({ ...updateData, id });
  } catch (error) {
    console.error('Error updating shipping method:', error);
    return NextResponse.json({ error: 'Failed to update shipping method' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if shipping method exists
    const existing = await db
      .select()
      .from(shippingMethods)
      .where(eq(shippingMethods.id, id))
      .limit(1);
      
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Shipping method not found' }, { status: 404 });
    }
    
    await db
      .delete(shippingMethods)
      .where(eq(shippingMethods.id, id));
    
    return NextResponse.json({ message: 'Shipping method deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipping method:', error);
    return NextResponse.json({ error: 'Failed to delete shipping method' }, { status: 500 });
  }
} 