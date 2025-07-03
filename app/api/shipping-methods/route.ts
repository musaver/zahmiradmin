import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shippingMethods, shippingCarriers, shippingServiceTypes } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allShippingMethods = await db
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
      .orderBy(desc(shippingMethods.sortOrder), shippingMethods.name);
      
    // Flatten the response for easier consumption
    const flattenedMethods = allShippingMethods.map(item => ({
      ...item.method,
      carrier: item.carrier,
      serviceType: item.serviceType,
    }));
      
    return NextResponse.json(flattenedMethods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping methods' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      code,
      description,
      price,
      estimatedDays,
      isActive = true,
      sortOrder = 0,
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
    
    // Check if code already exists
    const existing = await db
      .select({ id: shippingMethods.id })
      .from(shippingMethods)
      .where(eq(shippingMethods.code, code))
      .limit(1);
      
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Shipping method code already exists' }, { status: 400 });
    }
    
    const newShippingMethod = {
      id: uuidv4(),
      name,
      code,
      description: description || null,
      price: price.toString(),
      estimatedDays: estimatedDays || null,
      isActive,
      sortOrder,
      carrierId: carrierId || null,
      serviceTypeId: serviceTypeId || null,
      // Keep legacy fields for backward compatibility
      carrierCode: carrierCode || null,
      serviceCode: serviceCode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(shippingMethods).values(newShippingMethod);
    
    return NextResponse.json(newShippingMethod, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping method:', error);
    return NextResponse.json({ error: 'Failed to create shipping method' }, { status: 500 });
  }
} 