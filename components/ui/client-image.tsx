'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface ClientImageProps extends Omit<ImageProps, 'onError'> {
  fallbackColor?: string;
}

export function ClientImage({ 
  src, 
  alt, 
  fallbackColor = '#f1f1f1',
  ...props 
}: ClientImageProps) {
  const [error, setError] = useState(false)

  const handleError = () => {
    setError(true)
  }

  // If there's an error, apply the fallback background color
  const imageStyle = error 
    ? { backgroundColor: fallbackColor, ...props.style }
    : props.style

  return (
    <Image 
      src={src} 
      alt={alt || 'Image'} 
      onError={handleError}
      {...props}
      style={imageStyle}
    />
  )
}