"use client"

import { useEffect, useState } from "react"
import { Star, MessageSquare } from "lucide-react"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  comment: string
  created_at: string
  user: {
    first_name: string
    last_name: string
  }
}

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useSupabaseAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    fetchReviews()
  }, [productId])
  
  const fetchReviews = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setSubmitting(true)
      
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment
        })
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Review Submitted",
        description: "Thank you for sharing your thoughts!",
      })
      
      setComment("")
      setRating(5)
      setShowReviewForm(false)
      fetchReviews()
    } catch (error: any) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  const renderStars = (value: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < value 
            ? 'fill-[#8a7158] text-[#8a7158]' 
            : 'fill-transparent text-gray-300'
        }`}
      />
    ))
  }
  
  const averageRating = reviews.length > 0
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0"
  
  return (
    <div>
      <h2 className="text-2xl font-serif font-light text-[#333] mb-6">
        Customer Reviews
      </h2>
      
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-8" />
          </div>
          
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border-t border-[#e5e2dd] pt-4 pb-6">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {renderStars(Number(averageRating))}
            </div>
            <p className="text-lg font-medium">
              {averageRating}
              <span className="text-[#666] text-sm ml-1">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </p>
          </div>
          
          {user && !showReviewForm && (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="mb-6 bg-transparent border border-[#8a7158] text-[#8a7158] hover:bg-[#8a7158]/10"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Write a Review
            </Button>
          )}
          
          {showReviewForm && (
            <div className="bg-white p-6 border border-[#e5e2dd] mb-8">
              <h3 className="text-lg font-medium text-[#333] mb-4">Share Your Experience</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#666] mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            value <= rating 
                              ? 'fill-[#8a7158] text-[#8a7158]' 
                              : 'fill-transparent text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-medium text-[#666] mb-2">
                    Your Review
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    rows={4}
                    className="w-full border border-[#e5e2dd] focus:border-[#8a7158] focus:ring-[#8a7158]"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#8a7158] hover:bg-[#6d5944] text-white"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="border-[#e5e2dd] text-[#666]"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          {reviews.length === 0 ? (
            <div className="text-center py-8 border-t border-[#e5e2dd]">
              <p className="text-[#666] mb-4">
                This product doesn't have any reviews yet. Be the first to share your thoughts!
              </p>
              {!user && (
                <p className="text-[#666] text-sm">
                  <a href="/auth/login" className="text-[#8a7158] hover:underline">
                    Sign in
                  </a> to leave a review.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-t border-[#e5e2dd] pt-4">
                  <div className="flex justify-between mb-2">
                    <p className="font-medium text-[#333]">
                      {review.user.first_name} {review.user.last_name}
                    </p>
                    <p className="text-sm text-[#666]">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center mb-3">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-[#666]">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 