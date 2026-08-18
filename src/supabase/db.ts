import { supabase } from "./client";
import { trackToolAction } from "@/utils/analytics";
import type { BlogPost } from "@/app/Articles";
import { safeStorage } from "@/utils/safeStorage";

export interface Activity {
  id?: string;
  user_id?: string;
  tool_type: 'invoice' | 'qr' | 'barcode' | 'converter';
  name: string;
  status: string;
  metadata?: any;
  created_at?: string;
}

// Log a user activity dynamically with robust fallback mechanisms
export async function logActivity(activity: Activity) {
  try {
    // Record real-time action in our custom zero-based live analytics
    try {
      trackToolAction(
        activity.tool_type, 
        `${activity.status.toLowerCase()} - ${activity.name}`
      );
    } catch (err) {
      console.warn("Telemetry call failed", err);
    }

    // 1. Optimization: If no user session is cached in local storage, skip any network requests entirely
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      const localActivities = JSON.parse(localStorage.getItem("local_activities") || "[]");
      const localAct = {
        id: Math.random().toString(),
        tool_type: activity.tool_type,
        name: activity.name,
        status: activity.status,
        metadata: activity.metadata,
        created_at: new Date().toISOString()
      };
      safeStorage.setItem("local_activities", JSON.stringify([localAct, ...localActivities].slice(0, 50)));
      window.dispatchEvent(new CustomEvent("activity-logged", { detail: localAct }));
      return;
    }

    // 2. Otherwise try checking Supabase with a 1.2s maximum timeout race
    let session = null;
    try {
      const res = await Promise.race([
        supabase.auth.getSession(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1200))
      ]);
      session = res?.data?.session;
    } catch {
      // Timeout or connection error
    }

    if (!session || !session.user) {
      // Fallback: Save locally
      const localActivities = JSON.parse(localStorage.getItem("local_activities") || "[]");
      const localAct = {
        id: Math.random().toString(),
        tool_type: activity.tool_type,
        name: activity.name,
        status: activity.status,
        metadata: activity.metadata,
        created_at: new Date().toISOString()
      };
      safeStorage.setItem("local_activities", JSON.stringify([localAct, ...localActivities].slice(0, 50)));
      window.dispatchEvent(new CustomEvent("activity-logged", { detail: localAct }));
      return;
    }

    // Insert to user_activities table
    const { error } = await supabase.from("user_activities").insert({
      user_id: session.user.id,
      tool_type: activity.tool_type,
      name: activity.name,
      status: activity.status,
      metadata: activity.metadata || {}
    });

    if (error) {
      // Secondary check: maybe table is named 'activities'
      const { error: error2 } = await supabase.from("activities").insert({
        user_id: session.user.id,
        tool_type: activity.tool_type,
        name: activity.name,
        status: activity.status,
        metadata: activity.metadata || {}
      });

      if (error2) {
        console.warn("Table sync failed. Storing locally. Errors: ", error.message, error2.message);
        const localActivities = JSON.parse(localStorage.getItem("local_activities") || "[]");
        const fallbackAct = { ...activity, created_at: new Date().toISOString() };
        safeStorage.setItem(
          "local_activities", 
          JSON.stringify([fallbackAct, ...localActivities].slice(0, 50))
        );
        window.dispatchEvent(new CustomEvent("activity-logged", { detail: fallbackAct }));
        return;
      }
    }

    // Successfully written to Supabase - let's notify
    window.dispatchEvent(new CustomEvent("activity-logged", { detail: activity }));
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

// Fetch activities for user from Supabase or Local Fallback
export async function fetchActivities() {
  try {
    const localActs = JSON.parse(localStorage.getItem("local_activities") || "[]");
    
    // 1. Optimization: If no user session is cached in local storage, skip network requests entirely
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return { data: localActs, type: 'local' };
    }

    // 2. Otherwise try checking Supabase with a 1.2s timeout race
    let session = null;
    try {
      const res = await Promise.race([
        supabase.auth.getSession(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1200))
      ]);
      session = res?.data?.session;
    } catch {
      // Timeout or connection error
    }

    if (!session || !session.user) {
      return { data: localActs, type: 'local' };
    }

    // Fetch from user_activities with a 1.5s timeout race
    const fetchPromise = supabase
      .from("user_activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    let resData: any = null;
    let fetchError: any = null;

    try {
      const resVal = await Promise.race([
        fetchPromise,
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Fetch timeout")), 1500))
      ]);
      resData = resVal?.data;
      fetchError = resVal?.error;
    } catch (err: any) {
      fetchError = err;
    }

    if (fetchError) {
       // Fetch from legacy activities table
       const fetchLegacyPromise = supabase
         .from("activities")
         .select("*")
         .order("created_at", { ascending: false })
         .limit(50);

       let resData2: any = null;
       let fetchError2: any = null;

       try {
         const resVal2 = await Promise.race([
           fetchLegacyPromise,
           new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Fetch timeout")), 1500))
         ]);
         resData2 = resVal2?.data;
         fetchError2 = resVal2?.error;
       } catch (err2: any) {
         fetchError2 = err2;
       }
       
       if (fetchError2) {
         console.warn("Supabase fetch failed or timed out. Loading local offline data.");
         return { data: localActs, type: 'local' };
       }
       return { data: resData2 || [], type: 'supabase' };
    }

    return { data: resData || [], type: 'supabase' };
  } catch (err) {
    console.error("Failed to fetch activities:", err);
    const localActs = JSON.parse(localStorage.getItem("local_activities") || "[]");
    return { data: localActs, type: 'local' };
  }
}

// Fetch blog posts from Supabase table 'blog_posts' with graceful fallbacks (excluding heavy content and coverImage)
export async function fetchBlogPosts(): Promise<BlogPost[] | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, date, author, category, views, reactions, published, coverImageAlt, coverImageCaption, coverImageTitle, seoTitle, seoDesc, seoKeywords")
      .order("date", { ascending: false });

    if (error) {
      console.warn("Supabase fetchBlogPosts failed (table may not exist or RLS active):", error.message);
      return null;
    }
    
    // Filter out system configuration rows so they never leak as real articles
    const filteredData = data ? data.filter((p: any) => p.id !== "tooleefy_system_settings_v1") : [];
    return filteredData as BlogPost[];
  } catch (err) {
    console.error("Error in fetchBlogPosts:", err);
    return null;
  }
}

// Fetch a single complete blog post from Supabase including content
export async function fetchSingleBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.warn(`Supabase fetchSingleBlogPost failed for id ${id}:`, error.message);
      return null;
    }
    return data as BlogPost;
  } catch (err) {
    console.error("Error in fetchSingleBlogPost:", err);
    return null;
  }
}

// Upsert a blog post to Supabase 'blog_posts' table
export async function upsertBlogPost(post: BlogPost): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("blog_posts")
      .upsert({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: post.date,
        author: post.author,
        category: post.category,
        views: post.views,
        reactions: post.reactions,
        published: post.published,
        coverImage: post.coverImage,
        coverImageAlt: post.coverImageAlt,
        coverImageCaption: post.coverImageCaption,
        coverImageTitle: post.coverImageTitle,
        seoTitle: post.seoTitle,
        seoDesc: post.seoDesc,
        seoKeywords: post.seoKeywords
      });

    if (error) {
      console.error("Supabase upsertBlogPost failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in upsertBlogPost:", err);
    return false;
  }
}

// Delete a blog post from Supabase 'blog_posts' table
export async function deleteBlogPost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("Supabase deleteBlogPost failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in deleteBlogPost:", err);
    return false;
  }
}

// Fetch global site configuration with recursive fallback to hidden blog post config row
export async function fetchSiteSettings(): Promise<Record<string, string>> {
  const defaults: Record<string, string> = {
    tooleefy_maintenance: "false",
    tooleefy_hide_banners: "false",
    tooleefy_hide_value_page: "false"
  };

  try {
    // 1. Try fetching from site_settings table first (primary modern path)
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (!error && data && data.length > 0) {
      const settings = { ...defaults };
      data.forEach((row: any) => {
        settings[row.key] = row.value;
      });
      return settings;
    }
  } catch (err) {
    // site_settings table doesn't exist yet, proceed to robust fallback
  }

  // 2. Fallback: Query hidden system settings record in the existing 'blog_posts' table
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", "tooleefy_system_settings_v1")
      .maybeSingle();

    if (!error && data) {
      try {
        const parsed = JSON.parse(data.content);
        return {
          ...defaults,
          ...parsed
        };
      } catch (e) {
        console.warn("Failed to parse system configuration content payload:", e);
      }
    }
  } catch (err) {
    console.error("Critical: Failed to read site settings from fallback database configuration layer.", err);
  }

  return defaults;
}

// Upsert site-wide global configuration safely
export async function upsertSiteSetting(key: string, value: string): Promise<boolean> {
  // Always write to local storage first for high-performance offline lookup speed and storage triggers
  safeStorage.setItem(key, value);
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event("tooleefy_preferences_changed"));

  // 1. Try writing to site_settings table first
  try {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (!error) return true;
  } catch (err) {
    // site_settings table doesn't exist yet, fallback
  }

  // 2. Fallback: Save to the hidden system settings row in the 'blog_posts' table
  try {
    // Load current configuration first
    const currentSettings = await fetchSiteSettings();
    const updatedSettings = {
      ...currentSettings,
      [key]: value
    };

    const { error } = await supabase
      .from("blog_posts")
      .upsert({
        id: "tooleefy_system_settings_v1",
        title: "System Configuration Override Record",
        excerpt: "Global system configuration keys for Tooleefy core.",
        content: JSON.stringify(updatedSettings),
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        author: "Tooleefy Engine",
        category: "System",
        views: 0,
        reactions: { heart: 0, fire: 0 },
        published: false,
        coverImage: "",
        coverImageAlt: "",
        coverImageCaption: "",
        coverImageTitle: "",
        seoTitle: "System Configuration Override Record",
        seoDesc: "System Settings",
        seoKeywords: ""
      });

    if (error) {
      console.error("Fallback settings write failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Critical: Fallback settings upsert failed:", err);
    return false;
  }
}

