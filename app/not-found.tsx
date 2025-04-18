import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[70vh] flex flex-col items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  )
} 