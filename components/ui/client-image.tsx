'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface ClientImageProps extends Omit<ImageProps, 'onError'> {
  fallbackColor?: string;
  fallbackImage?: string;
}

export function ClientImage({ 
  src, 
  alt, 
  fallbackColor = '#f1f1f1',
  fallbackImage = '/placeholder-logo.jpg',
  ...props 
}: ClientImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleError = () => {
    console.error(`Image failed to load: ${src}`)
    setError(true)
    setLoading(false)
  }

  const handleLoad = () => {
    setLoading(false)
  }

  // If there's an error, apply the fallback background color
  const imageStyle = {
    ...(error ? { backgroundColor: fallbackColor } : {}),
    ...(loading ? { opacity: 0.5 } : { opacity: 1, transition: 'opacity 0.3s ease-in-out' }),
    ...props.style
  }

  if (typeof src === 'string' && !src.startsWith('http') && !src.startsWith('/')) {
    console.warn(`Image source may be invalid: ${src}. Consider using an absolute URL.`)
  }

  return (
    <div className={`relative ${props.className || ''}`} style={props.fill ? { width: '100%', height: '100%' } : {}}>
      <Image 
        src={error ? fallbackImage : src} 
        alt={alt || 'Image'} 
        onError={handleError}
        onLoad={handleLoad}
        {...props}
        className={`transition-opacity duration-300 ${props.className || ''}`}
        style={imageStyle}
        unoptimized={process.env.NODE_ENV === 'development'}
      />
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-transparent"></div>
        </div>
      )}
    </div>
  )
} 