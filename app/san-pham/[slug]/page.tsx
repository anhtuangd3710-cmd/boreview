import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo';
import ProductOrderForm from '@/components/ProductOrderForm';
import ProductGallery from '@/components/ProductGallery';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  });

  if (product) {
    // Increment views (non-blocking)
    prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});
  }

  return product;
}

async function getRelatedProducts(productId: string, categoryId: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      categoryId,
      id: { not: productId },
    },
    select: {
      id: true, name: true, slug: true, price: true, salePrice: true,
      thumbnail: true, stock: true, soldCount: true, isFeatured: true, shortDesc: true,
      category: { select: { name: true, slug: true } },
    },
    take: 4,
    orderBy: { soldCount: 'desc' },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, isActive: true },
  });

  if (!product) return { title: 'Sản phẩm không tồn tại' };

  return generateSeoMetadata({
    title: product.seoTitle || product.name,
    description: product.metaDescription || product.shortDesc || product.description.slice(0, 160),
    path: `/san-pham/${product.slug}`,
    image: product.thumbnail || undefined,
  });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId);
  const images = JSON.parse(product.images || '[]') as string[];
  const allImages = product.thumbnail ? [product.thumbnail, ...images] : images;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discount = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary-500">Trang chủ</Link>
          <span>/</span>
          <Link href="/san-pham" className="hover:text-primary-500">Sản phẩm</Link>
          <span>/</span>
          <Link href={`/san-pham?category=${product.category.slug}`} className="hover:text-primary-500">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <ProductGallery images={allImages} productName={product.name} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Name */}
            <div>
              <Link href={`/san-pham?category=${product.category.slug}`}
                className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
                {product.category.name}
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(product.salePrice || product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">-{discount}%</span>
                </>
              )}
            </div>

            {/* Stock & Sold */}
            <div className="flex items-center gap-6 text-sm">
              <span className={`flex items-center gap-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng'}
                {product.stock > 0 && product.stock <= 10 && ` (còn ${product.stock})`}
              </span>
              {product.soldCount > 0 && (
                <span className="text-gray-500">📦 Đã bán {product.soldCount}</span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDesc && (
              <p className="text-gray-600 dark:text-gray-300">{product.shortDesc}</p>
            )}

            {/* External Links */}
            {(product.shopeeLink || product.lazadaLink || product.tiktokShopLink) && (
              <div className="flex flex-wrap gap-3">
                {product.shopeeLink && (
                  <a href={product.shopeeLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">
                    🛒 Mua trên Shopee
                  </a>
                )}
                {product.lazadaLink && (
                  <a href={product.lazadaLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                    🛒 Mua trên Lazada
                  </a>
                )}
                {product.tiktokShopLink && (
                  <a href={product.tiktokShopLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl transition-colors">
                    🎵 TikTok Shop
                  </a>
                )}
              </div>
            )}

            {/* COD Order Form */}
            <ProductOrderForm
              productId={product.id}
              productName={product.name}
              productImage={product.thumbnail}
              price={product.salePrice || product.price}
              stock={product.stock}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📝 Mô tả sản phẩm</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">🛍️ Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/san-pham/${p.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
                >
                  <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
                    {p.thumbnail ? (
                      <Image src={p.thumbnail} alt={p.name} fill className="object-cover" sizes="200px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">{p.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">
                      {formatPrice(p.salePrice || p.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

