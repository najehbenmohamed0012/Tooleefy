import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { safeStorage } from "@/utils/safeStorage";

// Memory cache as a fast-lookup tier
const memoryCoverImageCache = new Map<string, string>();

interface BlogImageProps {
  id: string;
  className?: string;
  alt?: string;
  fallbackImage?: string;
}

export function BlogImage({ id, className = "w-full h-full object-cover", alt = "Blog Cover Image", fallbackImage }: BlogImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(() => {
    // 1. Check memory cache tier
    if (memoryCoverImageCache.has(id)) {
      return memoryCoverImageCache.get(id) || null;
    }
    // 2. Check localStorage cache tier for instant startup rendering
    try {
      const cached = safeStorage.getItem(`cover_image_${id}`);
      if (cached) {
        memoryCoverImageCache.set(id, cached);
        return cached;
      }
    } catch (e) {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState(!imageSrc);

  useEffect(() => {
    // If image is already cached in memory, do not trigger a database read
    if (imageSrc) {
      setLoading(false);
      return;
    }

    let active = true;
    const fetchImage = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("coverImage")
          .eq("id", id)
          .maybeSingle();

        if (active) {
          if (!error && data?.coverImage) {
            memoryCoverImageCache.set(id, data.coverImage);
            try {
              safeStorage.setItem(`cover_image_${id}`, data.coverImage);
            } catch (e) {
              // ignore storage limits
            }
            setImageSrc(data.coverImage);
          } else if (fallbackImage) {
            setImageSrc(fallbackImage);
          }
        }
      } catch (err) {
        console.warn(`Failed to lazy load cover image for post ${id}:`, err);
        if (active && fallbackImage) {
          setImageSrc(fallbackImage);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      active = false;
    };
  }, [id, fallbackImage, imageSrc]);

  if (loading) {
    return (
      <div className="absolute inset-0 bg-muted/60 flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!imageSrc) {
    return <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} animate-fade-in`}
      referrerPolicy="no-referrer"
    />
  );
}
