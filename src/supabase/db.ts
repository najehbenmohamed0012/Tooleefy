import { supabase } from "./client";
import { trackToolAction } from "@/utils/analytics";

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
      localStorage.setItem("local_activities", JSON.stringify([localAct, ...localActivities].slice(0, 50)));
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
      localStorage.setItem("local_activities", JSON.stringify([localAct, ...localActivities].slice(0, 50)));
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
        localStorage.setItem(
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
