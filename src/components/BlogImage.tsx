import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { safeStorage, dbCache } from "@/utils/safeStorage";

// Memory cache as a fast-lookup tier
const memoryCoverImageCache = new Map<string, string>();

interface BlogImageProps {
  id: string;
  className?: string;
  alt?: string;
  fallbackImage?: string;
  coverImage?: string;
}

export function BlogImage({ id, className = "w-full h-full object-cover", alt = "Blog Cover Image", fallbackImage, coverImage }: BlogImageProps) {
  const isExternalUrl = (src: string | null | undefined) => {
    if (!src) return false;
    const trimmed = src.trim().toLowerCase();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.includes("unsplash.com");
  };

  const [imageSrc, setImageSrc] = useState<string | null>(() => {
    // 0. Use pre-loaded cover image if passed and valid
    if (coverImage && !isExternalUrl(coverImage)) {
      memoryCoverImageCache.set(id, coverImage);
      dbCache.setItem(`cover_image_${id}`, coverImage).catch(() => {});
      return coverImage;
    }
    // 1. Check memory cache tier
    if (memoryCoverImageCache.has(id)) {
      const mem = memoryCoverImageCache.get(id) || null;
      if (mem && !isExternalUrl(mem)) return mem;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(() => {
    if (imageSrc) return false;
    if (coverImage && isExternalUrl(coverImage)) return false;
    return true;
  });

  useEffect(() => {
    let active = true;

    const fetchImage = async () => {
      // 1. If we already have imageSrc, stop loading
      if (imageSrc) {
        if (active) setLoading(false);
        return;
      }

      // 2. Check if we have preloaded coverImage that is external
      if (coverImage && isExternalUrl(coverImage)) {
        if (active) setLoading(false);
        return;
      }

      try {
        // 3. Try to load from high-speed IndexedDB cache
        const cached = await dbCache.getItem(`cover_image_${id}`);
        if (active && cached && !isExternalUrl(cached)) {
          memoryCoverImageCache.set(id, cached);
          setImageSrc(cached);
          setLoading(false);
          return;
        }

        // 4. Query Supabase
        const { data, error } = await supabase
          .from("blog_posts")
          .select("coverImage")
          .eq("id", id)
          .maybeSingle();

        if (active) {
          if (!error && data?.coverImage && !isExternalUrl(data.coverImage)) {
            memoryCoverImageCache.set(id, data.coverImage);
            await dbCache.setItem(`cover_image_${id}`, data.coverImage);
            setImageSrc(data.coverImage);
          } else if (fallbackImage && !isExternalUrl(fallbackImage)) {
            setImageSrc(fallbackImage);
          } else {
            // Force fallback gradient
            setImageSrc(null);
          }
        }
      } catch (err) {
        console.warn(`Failed to lazy load cover image for post ${id}:`, err);
        if (active && fallbackImage && !isExternalUrl(fallbackImage)) {
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
  }, [id, fallbackImage, imageSrc, coverImage]);


  if (loading) {
    return (
      <div className="absolute inset-0 bg-muted/60 flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!imageSrc || isExternalUrl(imageSrc)) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-primary/30 flex items-center justify-center p-6 select-none overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -inset-10 bg-gradient-to-tr from-primary/10 via-transparent to-white/5 blur-2xl pointer-events-none" />
        <span className="relative text-[10px] font-black uppercase tracking-widest text-primary-foreground/50 text-center leading-normal border border-white/10 bg-white/5 rounded-2xl px-4 py-2 backdrop-blur-md">
          {alt || "Tooleefy Masterclass"}
        </span>
      </div>
    );
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
