import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";

// Client-side cache to retain downloaded base64 cover images during session navigation
const coverImageCache = new Map<string, string>();

interface BlogImageProps {
  id: string;
  className?: string;
  alt?: string;
  fallbackImage?: string;
}

export function BlogImage({ id, className = "w-full h-full object-cover", alt = "Blog Cover Image", fallbackImage }: BlogImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(() => {
    return coverImageCache.get(id) || null;
  });
  const [loading, setLoading] = useState(!imageSrc);

  useEffect(() => {
    // If image is already cached in memory, do not trigger a database read
    if (imageSrc) return;

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
            coverImageCache.set(id, data.coverImage);
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
