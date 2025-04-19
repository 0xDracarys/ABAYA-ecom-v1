export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" aria-label="Loading">
          <span className="sr-only">Loading...</span>
        </div>
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="aspect-[3/4] w-full bg-gray-200 animate-pulse mb-4" />
            <div className="h-4 w-3/4 bg-gray-200 animate-pulse mb-2" />
            <div className="h-4 w-1/4 bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
