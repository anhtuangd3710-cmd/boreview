export default function BlogLoading() {
  return (
    <article className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Skeleton */}
      <div className="relative h-[50vh] md:h-[55vh] lg:h-[65vh] bg-gray-200 dark:bg-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex gap-2 mb-4">
              <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="h-12 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content Skeleton */}
          <div className="lg:w-2/3">
            {/* Author Card Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 -mt-20 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
              <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mt-8" />
              {[...Array(6)].map((_, i) => (
                <div
                  key={i + 10}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

