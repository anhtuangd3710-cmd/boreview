import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, excerpt, youtubeUrl, thumbnail, published, featured, categories, tags, seoTitle, metaDescription, customSlug } = body;

    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Generate new slug if customSlug provided or title changed
    let slug = existingPost.slug;
    if (customSlug && customSlug !== existingPost.slug) {
      // Use custom slug if provided
      slug = slugify(customSlug, { lower: true, strict: true });
      const duplicateSlug = await prisma.post.findFirst({
        where: { slug, id: { not: params.id } },
      });
      if (duplicateSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    } else if (title && title !== existingPost.title && !customSlug) {
      // Auto-generate from title only if no custom slug
      slug = slugify(title, { lower: true, strict: true });
      const duplicateSlug = await prisma.post.findFirst({
        where: { slug, id: { not: params.id } },
      });
      if (duplicateSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Handle publishedAt
    let publishedAt = existingPost.publishedAt;
    if (published && !existingPost.published) {
      publishedAt = new Date();
    } else if (!published) {
      publishedAt = null;
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: title || existingPost.title,
        slug,
        content: content || existingPost.content,
        excerpt: excerpt || existingPost.excerpt,
        youtubeUrl,
        thumbnail,
        published: published ?? existingPost.published,
        featured: featured ?? existingPost.featured,
        publishedAt,
        seoTitle: seoTitle !== undefined ? (seoTitle || null) : existingPost.seoTitle,
        metaDescription: metaDescription !== undefined ? (metaDescription || null) : existingPost.metaDescription,
        categories: categories
          ? { set: categories.map((id: string) => ({ id })) }
          : undefined,
        tags: tags
          ? { set: tags.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

