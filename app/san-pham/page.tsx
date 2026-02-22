import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import ProductList from '@/components/ProductList';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Sản phẩm',
    description: 'Khám phá các sản phẩm chất lượng được Bơ Review đề xuất. Thanh toán khi nhận hàng, giao hàng toàn quốc.',
    path: '/san-pham',
  });
}

async function getProducts(searchParams: { [key: string]: string | undefined }) {
  const page = parseInt(searchParams.page || '1');
  const category = searchParams.category;
  const search = searchParams.search;
  const sort = searchParams.sort || 'newest';
  const limit = 12;

  const where: Record<string, unknown> = { isActive: true };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { shortDesc: { contains: search, mode: 'insensitive' } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' };
  switch (sort) {
    case 'price-asc': orderBy = { price: 'asc' }; break;
    case 'price-desc': orderBy = { price: 'desc' }; break;
    case 'popular': orderBy = { soldCount: 'desc' }; break;
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true, name: true, slug: true, shortDesc: true,
        price: true, salePrice: true, thumbnail: true,
        stock: true, isFeatured: true, soldCount: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({
      where: { isActive: true },
      select: { name: true, slug: true, _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    categories: categories.map(c => ({ name: c.name, slug: c.slug, count: c._count.products })),
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const data = await getProducts(searchParams);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🛍️ Sản phẩm
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Các sản phẩm chất lượng được Bơ Review lựa chọn và đề xuất
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm">
              <span className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                ✅ Thanh toán khi nhận hàng
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                🚚 Giao hàng toàn quốc
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-12">
        <ProductList
          initialProducts={data.products}
          totalPages={data.totalPages}
          currentPage={data.currentPage}
          categories={data.categories}
          currentCategory={searchParams.category}
          currentSort={searchParams.sort}
          currentSearch={searchParams.search}
        />
      </section>
    </main>
  );
}

