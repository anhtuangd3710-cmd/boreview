import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Helper to hash IP
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'salt').digest('hex').slice(0, 16);
}

// Generate order number: BO-YYYYMMDD-XXX
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `BO-${dateStr}-${random}`;
}

// POST /api/orders - Create new order (COD)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      shippingWard,
      shippingDistrict,
      shippingCity,
      customerNote,
      items, // Array of { productId, quantity }
    } = body;

    // Validation
    if (!customerName || !customerPhone || !shippingAddress || !items?.length) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Validate phone number (Vietnam)
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(customerPhone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Số điện thoại không hợp lệ' },
        { status: 400 }
      );
    }

    // Get products and calculate totals
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: 'Một số sản phẩm không còn khả dụng' },
        { status: 400 }
      );
    }

    // Check stock and calculate subtotal
    let subtotal = 0;
    const orderItems: Array<{
      productId: string;
      productName: string;
      productImage: string | null;
      quantity: number;
      price: number;
    }> = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho` },
          { status: 400 }
        );
      }

      const price = product.salePrice || product.price;
      subtotal += price * item.quantity;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.thumbnail,
        quantity: item.quantity,
        price,
      });
    }

    // Calculate shipping fee (simplified - can be expanded)
    const shippingFee = subtotal >= 500000 ? 0 : 30000; // Free shipping over 500k
    const total = subtotal + shippingFee;

    // Get IP hash
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const ipHash = hashIP(ip);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName,
        customerPhone: customerPhone.replace(/\s/g, ''),
        customerEmail,
        shippingAddress,
        shippingWard,
        shippingDistrict,
        shippingCity,
        subtotal,
        shippingFee,
        total,
        customerNote,
        ipHash,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // Update product stock and sold count
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        total: order.total,
        shippingFee: order.shippingFee,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đặt hàng' },
      { status: 500 }
    );
  }
}

