import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/admin/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { product: { select: { slug: true } } },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

// PUT /api/admin/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, adminNote, paymentStatus } = body;

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      
      // Set timestamps based on status
      switch (status) {
        case 'CONFIRMED':
          updateData.confirmedAt = new Date();
          break;
        case 'SHIPPING':
          updateData.shippedAt = new Date();
          break;
        case 'DELIVERED':
          updateData.deliveredAt = new Date();
          updateData.paymentStatus = 'PAID';
          break;
        case 'CANCELLED':
          updateData.cancelledAt = new Date();
          // Restore stock
          const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: { items: true },
          });
          if (order) {
            for (const item of order.items) {
              if (item.productId) {
                await prisma.product.update({
                  where: { id: item.productId },
                  data: {
                    stock: { increment: item.quantity },
                    soldCount: { decrement: item.quantity },
                  },
                });
              }
            }
          }
          break;
      }
    }

    if (adminNote !== undefined) {
      updateData.adminNote = adminNote;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

