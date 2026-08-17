const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Supabase credentials missing.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("--- TEST 1: Fetching ALL columns except content (including coverImage) ---");
  let start = Date.now();
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, excerpt, date, author, category, views, reactions, published, coverImage, coverImageAlt, coverImageCaption, coverImageTitle, seoTitle, seoDesc, seoKeywords')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Test 1 failed:", error);
    } else {
      const sizeBytes = JSON.stringify(data).length;
      console.log(`Test 1 SUCCESS! Time taken: ${Date.now() - start}ms. Record count: ${data.length}. Size: ${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    }
  } catch (err) {
    console.error("Test 1 error:", err);
  }

  console.log("\n--- TEST 2: Fetching columns EXCLUDING BOTH content and coverImage ---");
  start = Date.now();
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, excerpt, date, author, category, views, reactions, published, coverImageAlt, coverImageCaption, coverImageTitle, seoTitle, seoDesc, seoKeywords')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Test 2 failed:", error);
    } else {
      const sizeBytes = JSON.stringify(data).length;
      console.log(`Test 2 SUCCESS! Time taken: ${Date.now() - start}ms. Record count: ${data.length}. Size: ${(sizeBytes / 1024).toFixed(2)} KB`);
    }
  } catch (err) {
    console.error("Test 2 error:", err);
  }
}

run();
