import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shippingServiceTypes } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const serviceType = await db
      .select()
      .from(shippingServiceTypes)
      .where(eq(shippingServiceTypes.id, id))
      .limit(1);
      
    if (serviceType.length === 0) {
      return NextResponse.json({ error: 'Service type not found' }, { status: 404 });
    }
    
    return NextResponse.json(serviceType[0]);
  } catch (error) {
    console.error('Error fetching service type:', error);
    return NextResponse.json({ error: 'Failed to fetch service type' }, { status: 500 });
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
      category,
      isActive,
      sortOrder
    } = await req.json();
    
    // Validate required fields
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }
    
    // Check if service type exists
    const existing = await db
      .select()
      .from(shippingServiceTypes)
      .where(eq(shippingServiceTypes.id, id))
      .limit(1);
      
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Service type not found' }, { status: 404 });
    }
    
    // Check if code is unique (excluding current record)
    const codeExists = await db
      .select({ id: shippingServiceTypes.id })
      .from(shippingServiceTypes)
      .where(eq(shippingServiceTypes.code, code))
      .limit(1);
      
    if (codeExists.length > 0 && codeExists[0].id !== id) {
      return NextResponse.json({ error: 'Service type code already exists' }, { status: 400 });
    }
    
    const updateData = {
      name,
      code,
      description: description || null,
      category: category || null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
      updatedAt: new Date(),
    };
    
    await db
      .update(shippingServiceTypes)
      .set(updateData)
      .where(eq(shippingServiceTypes.id, id));
    
    return NextResponse.json({ ...updateData, id });
  } catch (error) {
    console.error('Error updating service type:', error);
    return NextResponse.json({ error: 'Failed to update service type' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if service type exists
    const existing = await db
      .select()
      .from(shippingServiceTypes)
      .where(eq(shippingServiceTypes.id, id))
      .limit(1);
      
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Service type not found' }, { status: 404 });
    }
    
    await db
      .delete(shippingServiceTypes)
      .where(eq(shippingServiceTypes.id, id));
    
    return NextResponse.json({ message: 'Service type deleted successfully' });
  } catch (error) {
    console.error('Error deleting service type:', error);
    return NextResponse.json({ error: 'Failed to delete service type' }, { status: 500 });
  }
} 