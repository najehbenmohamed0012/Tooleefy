import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Heart, 
  Power, 
  CheckCircle2, 
  X, 
  Save, 
  FileEdit, 
  Sparkles,
  Search,
  Globe,
  Maximize2,
  Heading,
  Bold,
  Italic,
  List,
  Quote,
  Link,
  Image as ImageIcon,
  Check,
  Flame,
  ThumbsUp,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BlogPost, defaultArticles } from "@/app/Articles";

// Standard cover presets for quick, premium choosing
const COVER_PRESETS = [
  { name: "Nebula Abstract", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
  { name: "Analytics Finance", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" },
  { name: "Crypto Binary", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80" },
  { name: "Workspace Minimal", url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80" },
  { name: "Code Studio", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80" }
];

export function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editorMode, setEditorMode] = useState<"list" | "edit" | "new">("list");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"write" | "preview">("write");
  const [seoPreviewType, setSeoPreviewType] = useState<"desktop" | "mobile">("desktop");

  // Rich form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Insights");
  const [date, setDate] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [coverImageCaption, setCoverImageCaption] = useState("");
  const [coverImageTitle, setCoverImageTitle] = useState("");
  const [published, setPublished] = useState(true);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Interactive editing modals
  const [modalType, setModalType] = useState<"none" | "link" | "image" | "h2" | "h3" | "quote">("none");
  const [modalLinkLabel, setModalLinkLabel] = useState("");
  const [modalLinkUrl, setModalLinkUrl] = useState("");
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageAlt, setModalImageAlt] = useState("");
  const [modalImageCaption, setModalImageCaption] = useState("");
  const [modalHeadText, setModalHeadText] = useState("");
  const [modalQuoteText, setModalQuoteText] = useState("");
  const [modalQuoteSource, setModalQuoteSource] = useState("");

  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Load posts
  useEffect(() => {
    const raw = localStorage.getItem("blog_posts");
    if (raw) {
      try {
        setPosts(JSON.parse(raw));
      } catch {
        setPosts(defaultArticles);
      }
    } else {
      localStorage.setItem("blog_posts", JSON.stringify(defaultArticles));
      setPosts(defaultArticles);
    }

    // Prefill author from logged-in user if available
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setAuthor(parsed.name || "Administrator");
      } else {
        setAuthor("Administrator");
      }
    } catch {
      setAuthor("Administrator");
    }
  }, []);

  // Sync to database / localstorage helper
  const syncPosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    localStorage.setItem("blog_posts", JSON.stringify(newPosts));
    window.dispatchEvent(new Event("storage"));
  };

  // Generate automated URL slug from Title
  useEffect(() => {
    if (editorMode === "new" || editorMode === "edit") {
      const formattedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove punctuation
        .replace(/\s+/g, "-")        // spaces to dashes
        .replace(/-+/g, "-")         // remove consecutive dashes
        .trim();
      setSlug(formattedSlug);

      // Auto set SEO Title if empty to support lazy admins
      if (!seoTitle || seoTitle === title.substring(0, title.length - 1)) {
        setSeoTitle(title);
      }
    }
  }, [title]);

  // Handle open editor for new post
  const handleLaunchNew = () => {
    setTitle("");
    setSlug("");
    // Re-load author name safely
    try {
      const savedUser = localStorage.getItem("user");
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      setAuthor(parsed?.name || "Administrator");
    } catch {
      setAuthor("Administrator");
    }
    setCategory("Insights");
    setDate(new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }));
    setExcerpt("");
    setContent("");
    setCoverImage(COVER_PRESETS[0].url);
    setCoverImageAlt("Corporate analytics workflow dashboard mockup");
    setCoverImageCaption("Dynamic dashboard metrics representation");
    setCoverImageTitle("Tooleefy workspace preview");
    setPublished(true);
    setSeoTitle("");
    setSeoDesc("");
    setSeoKeywords("");
    setSelectedPostId(null);
    setEditorMode("new");
    setPreviewTab("write");
  };

  // Handle open editor for existing post
  const handleLaunchEdit = (post: BlogPost) => {
    setTitle(post.title);
    setSlug(post.id);
    setAuthor(post.author || "Administrator");
    setCategory(post.category || "Insights");
    setDate(post.date || new Date().toLocaleDateString());
    setExcerpt(post.excerpt || "");
    setContent(post.content || "");
    setCoverImage(post.coverImage || COVER_PRESETS[0].url);
    setCoverImageAlt(post.coverImageAlt || "");
    setCoverImageCaption(post.coverImageCaption || "");
    setCoverImageTitle(post.coverImageTitle || "");
    setPublished(post.published);
    setSeoTitle(post.seoTitle || post.title);
    setSeoDesc(post.seoDesc || post.excerpt);
    setSeoKeywords(post.seoKeywords || "");
    setSelectedPostId(post.id);
    setEditorMode("edit");
    setPreviewTab("write");
  };

  // Toggle publish state directly from list
  const handleTogglePublish = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const nextState = !p.published;
        toast.success(nextState ? `Published "${p.title}" successfully!` : `Unpublished "${p.title}" to Draft state.`);
        return { ...p, published: nextState };
      }
      return p;
    });
    syncPosts(updated);
  };

  // Delete article with verification
  const handleDeletePost = (postId: string) => {
    const target = posts.find(p => p.id === postId);
    if (!target) return;

    if (window.confirm(`Are you sure you want to permanently delete "${target.title}"? This action cannot be undone.`)) {
      const filtered = posts.filter(p => p.id !== postId);
      syncPosts(filtered);
      toast.success("Blog article deleted successfully.");
    }
  };

  // Execute final markdown markup injection at selection location
  const executeMarkupInsertion = (insertedText: string) => {
    if (!contentRef.current) return;
    const txtArea = contentRef.current;
    const selectStart = txtArea.selectionStart || 0;
    const selectEnd = txtArea.selectionEnd || 0;
    const text = txtArea.value;

    const replacement = text.substring(0, selectStart) + insertedText + text.substring(selectEnd);
    setContent(replacement);
    setModalType("none");

    setTimeout(() => {
      txtArea.focus();
      const caretOffset = selectStart + insertedText.length;
      txtArea.setSelectionRange(caretOffset, caretOffset);
    }, 50);
  };

  // Rich markdown toolbar injector - now refined with interactive modal dialogue setups
  const handleInsertMarkup = (syntaxType: "h2" | "h3" | "bold" | "italic" | "list" | "quote" | "link" | "image") => {
    if (!contentRef.current) return;
    const txtArea = contentRef.current;
    const selectStart = txtArea.selectionStart;
    const selectEnd = txtArea.selectionEnd;
    const text = txtArea.value;
    const selectedText = text.substring(selectStart, selectEnd) || "";

    if (syntaxType === "bold" || syntaxType === "italic" || syntaxType === "list") {
      let insertedText = "";
      if (syntaxType === "bold") insertedText = `**${selectedText || "bold text"}**`;
      else if (syntaxType === "italic") insertedText = `*${selectedText || "italic text"}*`;
      else if (syntaxType === "list") insertedText = `\n- ${selectedText || "List item"}\n`;

      const replacement = text.substring(0, selectStart) + insertedText + text.substring(selectEnd);
      setContent(replacement);
      setTimeout(() => {
        txtArea.focus();
        const caretOffset = selectStart + insertedText.length;
        txtArea.setSelectionRange(caretOffset, caretOffset);
      }, 50);
      return;
    }

    if (syntaxType === "link") {
      setModalLinkLabel(selectedText || "Link Title");
      setModalLinkUrl("");
      setModalType("link");
    } else if (syntaxType === "image") {
      setModalImageUrl("");
      setModalImageAlt(selectedText || "Descriptive Image Alt Text (SEO)");
      setModalImageCaption("");
      setModalType("image");
    } else if (syntaxType === "h2") {
      setModalHeadText(selectedText || "Heading Level 2 Title");
      setModalType("h2");
    } else if (syntaxType === "h3") {
      setModalHeadText(selectedText || "Heading Level 3 Title");
      setModalType("h3");
    } else if (syntaxType === "quote") {
      setModalQuoteText(selectedText || "A wise adage or proverb text that drives insight.");
      setModalQuoteSource("");
      setModalType("quote");
    }
  };

  // Convert local cover images instantly to base64 Data URLs
  const handleCoverUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large! Please choose an image smaller than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCoverImage(event.target.result as string);
        toast.success("Header cover image uploaded and compiled as high-fidelity Base64 vector asset!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Save changes handler (Create or Update)
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and Article Content fields are required.");
      return;
    }

    const compiledPost: BlogPost = {
      id: selectedPostId || `art-${slug || "post"}-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim().substring(0, 120) + "...",
      content: content,
      date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      author: author.trim() || "Administrator",
      category: category,
      views: selectedPostId ? (posts.find(p => p.id === selectedPostId)?.views || 0) : 0,
      reactions: selectedPostId ? (posts.find(p => p.id === selectedPostId)?.reactions || { heart: 0, fire: 0, thumbsUp: 0 }) : { heart: 0, fire: 0, thumbsUp: 0 },
      published: published,
      coverImage: coverImage.trim() || COVER_PRESETS[0].url,
      coverImageAlt: coverImageAlt.trim() || title.trim(),
      coverImageCaption: coverImageCaption.trim(),
      coverImageTitle: coverImageTitle.trim() || title.trim(),
      seoTitle: seoTitle.trim() || title.trim(),
      seoDesc: seoDesc.trim() || excerpt.trim(),
      seoKeywords: seoKeywords.trim()
    };

    let updatedList: BlogPost[] = [];
    if (editorMode === "new") {
      updatedList = [compiledPost, ...posts];
      toast.success(`Successfully published new article: "${compiledPost.title}"!`);
    } else {
      updatedList = posts.map(p => p.id === selectedPostId ? compiledPost : p);
      toast.success(`Updated article alterations for "${compiledPost.title}" successfully.`);
    }

    syncPosts(updatedList);
    setEditorMode("list");
  };

  // Compute stats metrics dynamically
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content ? content.length : 0;
  const readTimeEst = Math.max(1, Math.ceil(wordCount / 225));

  // Count SEO statuses
  const seoTitleColor = seoTitle.length >= 40 && seoTitle.length <= 60 ? "text-emerald-500" : "text-amber-500";
  const seoDescColor = seoDesc.length >= 120 && seoDesc.length <= 160 ? "text-emerald-500" : "text-amber-500";

  return (
    <div className="space-y-8">
      {/* Title & Stats indicators */}
      <Card className="p-8 border-none shadow-premium bg-card rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase text-foreground flex items-center gap-2.5">
              <FileEdit className="w-6 h-6 text-primary" /> Multi-Featured Blog Workspace
            </h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Create, review, edit, and coordinate search-optimized publications for your B2B tool suite.
            </p>
          </div>
          {editorMode === "list" ? (
            <Button 
              onClick={handleLaunchNew}
              className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-secondary transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Create New Post
            </Button>
          ) : (
            <Button 
              onClick={() => setEditorMode("list")}
              variant="outline"
              className="h-13 px-6 rounded-xl font-bold uppercase tracking-wider text-xs gap-1 hover:bg-muted"
            >
              <X className="w-4 h-4" /> Exit Editor Workspace
            </Button>
          )}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {editorMode === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {posts.length === 0 ? (
              <Card className="p-12 text-center border-none shadow-premium bg-card rounded-[2.5rem]">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-pulse" />
                <h4 className="text-lg font-black uppercase italic text-foreground">Zero Catalogued Posts</h4>
                <p className="text-xs text-muted-foreground font-medium mt-1 mb-6">You currently have no custom articles initialized.</p>
                <Button onClick={handleLaunchNew} className="h-12 px-6 rounded-xl text-xs font-black uppercase bg-primary text-white">Create First Post</Button>
              </Card>
            ) : (
              <Card className="p-8 border-none shadow-premium bg-card rounded-[2.5rem] overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-black uppercase italic text-foreground">Active Catalog ({posts.length} articles)</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">Real-time DB Active</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-[10px] uppercase tracking-widest text-slate-400 font-extrabold pb-4">
                        <th className="py-4">Title & Context</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4 text-center">Metrics</th>
                        <th className="py-4 text-right">Admin Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-sm font-semibold">
                      {posts.map((post) => {
                        const totalReactions = (post.reactions?.heart || 0) + (post.reactions?.fire || 0) + (post.reactions?.thumbsUp || 0);
                        return (
                          <tr key={post.id} className="hover:bg-muted/10 transition-colors group">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-4 min-w-[280px]">
                                <div className="w-14 h-10 bg-muted/60 rounded-lg overflow-hidden shrink-0 border border-border/40">
                                  {post.coverImage ? (
                                    <img src={post.coverImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-transparent" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <p className="font-extrabold text-foreground group-hover:text-primary transition-colors truncate max-w-[240px] md:max-w-[340px]" title={post.title}>
                                    {post.title}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 font-bold flex items-center gap-2">
                                    <span>By {post.author}</span>
                                    <span>•</span>
                                    <span>{post.date}</span>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary rounded-full border border-primary/5">
                                {post.category || "Insights"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button 
                                onClick={() => handleTogglePublish(post.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                                  post.published 
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                    : "bg-slate-100 dark:bg-white/5 text-slate-400 border border-border/20"
                                }`}
                              >
                                {post.published ? <Power className="w-3 h-3 text-emerald-500" /> : <Power className="w-3 h-3 text-slate-400" />}
                                <span>{post.published ? "Published" : "Draft"}</span>
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
                                <span className="flex items-center gap-1" title="Unique views"><Eye className="w-4 h-4 text-slate-400" /> {post.views}</span>
                                <span className="flex items-center gap-1" title="Interactive feedback"><Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" /> {totalReactions}</span>
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  onClick={() => handleLaunchEdit(post)}
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 text-slate-500 hover:text-primary hover:bg-muted font-bold rounded-lg"
                                  title="Edit full workspace"
                                >
                                  <Edit3 className="w-4.5 h-4.5" />
                                </Button>
                                <Button 
                                  onClick={() => handleDeletePost(post.id)}
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                                  title="Erase post permanently"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Form Fields Container (Left 2 columns) */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-8 md:p-11 border-none shadow-premium bg-card rounded-[2.5rem]">
                <div className="flex items-center justify-between border-b border-border/40 pb-6 mb-8">
                  <div className="flex gap-4">
                    <Button 
                      variant={previewTab === "write" ? "default" : "ghost"}
                      onClick={() => setPreviewTab("write")}
                      className="rounded-xl h-11 font-black text-xs px-6 uppercase tracking-wider"
                    >
                      <FileEdit className="w-4 h-4 mr-1.5" /> Editor Studio
                    </Button>
                    <Button 
                      variant={previewTab === "preview" ? "default" : "ghost"}
                      onClick={() => setPreviewTab("preview")}
                      className="rounded-xl h-11 font-black text-xs px-6 uppercase tracking-wider bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" /> Dynamic Live Preview
                    </Button>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest hidden sm:block">
                    {editorMode === "new" ? "Interactive Formulation State" : "Content Alteration Mode"}
                  </span>
                </div>

                {previewTab === "write" ? (
                  <form onSubmit={handleSavePost} className="space-y-6">
                    <div className="p-5 bg-muted/20 border border-border/30 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div>
                          <p className="text-xs font-black uppercase text-foreground tracking-wider">Cover Banner Dynamic Resource</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Paste an external URL or upload a local image file below to convert offline.</p>
                        </div>
                        
                        <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-4 h-9 bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all">
                          <Plus className="w-3.5 h-3.5" /> Upload Cover Image
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleCoverUploadFile} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-500">Image Source URL (Presets or Custom)</Label>
                          <Input 
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://images.unsplash.com/... or data:..."
                            className="h-10 bg-card rounded-lg text-xs"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-500">Header Image Alt Description (SEO Target)</Label>
                          <Input 
                            value={coverImageAlt}
                            onChange={(e) => setCoverImageAlt(e.target.value)}
                            placeholder="e.g. Analytics dashboard mockup showing team conversions metrics"
                            className="h-10 bg-card rounded-lg text-xs font-semibold text-foreground"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-500">Header Image Title attribute (Tooltip Tool)</Label>
                          <Input 
                            value={coverImageTitle}
                            onChange={(e) => setCoverImageTitle(e.target.value)}
                            placeholder="e.g. Tooleefy system telemetry output charts"
                            className="h-10 bg-card rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase text-slate-500">Visible Caption / Photographer Credits text</Label>
                          <Input 
                            value={coverImageCaption}
                            onChange={(e) => setCoverImageCaption(e.target.value)}
                            placeholder="e.g. Figure 1.2 - Client offline telemetry pipeline matrix elements"
                            className="h-10 bg-card rounded-lg text-xs italic"
                          />
                        </div>
                      </div>

                      {/* Premium presets select shortcuts */}
                      <div className="space-y-1.5 pt-1 border-t border-border/20">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fast high-fidelity preset textures:</p>
                        <div className="flex flex-wrap gap-2">
                          {COVER_PRESETS.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => {
                                setCoverImage(p.url);
                                setCoverImageAlt(`Preset abstract design representing ${p.name}`);
                                setCoverImageTitle(`Tooleefy B2B template - ${p.name}`);
                              }}
                              className={`px-3 py-1 rounded text-[10px] font-black transition-all ${
                                coverImage === p.url 
                                  ? "bg-primary text-white scale-95" 
                                  : "bg-muted text-slate-500 border border-border/40 hover:bg-muted/80"
                              }`}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="postTitle" className="text-xs font-black uppercase tracking-wider text-slate-500">Article Visual Title</Label>
                        <Input 
                          id="postTitle"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Why Client-Side Computing Revolutionizes Privacy"
                          className="h-12 rounded-xl font-bold"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postCategory" className="text-xs font-black uppercase tracking-wider text-slate-500">Vertical Category</Label>
                          <select
                            id="postCategory"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-12 bg-muted/50 rounded-xl border border-border/40 px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="Insights">Insights Zone</option>
                            <option value="Business">Business Focus</option>
                            <option value="Dev">Developer / Code</option>
                            <option value="Design">Visual Design</option>
                            <option value="Productivity">Productivity</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="postAuthor" className="text-xs font-black uppercase tracking-wider text-slate-500">Author Name</Label>
                          <Input 
                            id="postAuthor"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Najeh Ben Mohamed"
                            className="h-12 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="postExcerpt" className="text-xs font-black uppercase tracking-wider text-slate-500">Article Snippet Summary (Excerpt)</Label>
                        <span className={`text-[10px] font-black ${excerpt.length > 160 ? "text-amber-500" : "text-emerald-500"}`}>
                          {excerpt.length} / 160 characters
                        </span>
                      </div>
                      <Input 
                        id="postExcerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="A rapid summary explaining the central key takeaway for cards listing grids..."
                        className="h-12 rounded-xl"
                        maxLength={220}
                      />
                    </div>

                    {/* Rich text custom content toolbar & textarea */}
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center justify-between border-t border-border/30 pt-4">
                        <Label htmlFor="postContent" className="text-xs font-black uppercase tracking-wider text-slate-500">Structured Text Markdown Content</Label>
                        <span className="text-[10px] text-muted-foreground font-mono">JetBrains Mono syntax indicators active</span>
                      </div>

                      {/* Tool shortcuts wrapper panel */}
                      <div className="flex flex-wrap gap-1.5 bg-muted p-2 rounded-xl border border-border/30 mb-1">
                        <button 
                          type="button" 
                          onClick={() => handleInsertMarkup("h2")} 
                          className="p-2 bg-card hover:bg-muted text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-border/30 flex items-center justify-center font-extrabold text-xs shrink-0"
                          title="Insert H2 syntax block"
                        >
                          <Heading className="w-4 h-4 mr-1 text-primary" /> H2
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleInsertMarkup("h3")} 
                          className="p-2 bg-card hover:bg-muted text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-border/30 flex items-center justify-center font-extrabold text-xs shrink-0"
                          title="Insert H3 syntax block"
                        >
                          <Heading className="w-3.5 h-3.5 mr-1 text-primary" /> H3
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleInsertMarkup("bold")} 
                          className="p-2 bg-card hover:bg-muted text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-border/30 flex items-center justify-center shrink-0"
                          title="Inject Bold"
                        >
                          <Bold className="w-4 h-4 text-slate-500" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleInsertMarkup("italic")} 
                          className="p-2 bg-card hover:bg-muted text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-border/30 flex items-center justify-center shrink-0"
                          title="Inject Italic"
                        >
                          <Italic className="w-4 h-4 text-slate-500" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleInsertMarkup("list")} 
                          className="p-2 bg-card hover:bg-muted text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-border/30 flex items-center justify-center shrink-0"
                          title="Inject Unordered List"
                        >
                          <List className="w-4 h-4 text-slate-500" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleInsertMarkup("quote")} 
                          className="p-2 bg-card hover:bg-muted text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-border/30 flex items-center justify-center shrink-0"
                          title="Inject Blockquote text block"
                        >
                          <Quote className="w-4 h-4 text-slate-500" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleInsertMarkup("link")} 
                          className="p-2 bg-card hover:bg-muted text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-border/30 flex items-center justify-center shrink-0"
                          title="Inject Markdown URL link"
                        >
                          <Link className="w-4 h-4 text-slate-500" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleInsertMarkup("image")} 
                          className="p-2 bg-card hover:bg-muted text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-border/30 flex items-center justify-center shrink-0"
                          title="Inject Markdown dynamic Image source reference"
                        >
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>

                      <textarea
                        id="postContent"
                        ref={contentRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`## Write your blog article structure here using Markdown...

Use H2 elements (## Heading Name) for separating large blocks, or standard bold markers (**text**) to provide premium emphasis.

Tooleefy clients read this prose dynamically inside real browser isolated environments.`}
                        className="w-full h-80 bg-muted/20 border border-border/40 rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed text-foreground font-mono"
                        required
                      />

                      {/* Display Character indicators */}
                      <div className="flex flex-wrap justify-between items-center text-[10px] font-black text-slate-400 font-mono pt-1">
                        <div className="flex gap-4">
                          <span>{wordCount} words</span>
                          <span>{charCount} characters</span>
                          <span className="text-[#0ea5e9]">~{readTimeEst} minute read duration</span>
                        </div>
                        <span className="uppercase tracking-wide text-primary">Markdown compatible</span>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-2xl border border-border/40 flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox"
                          id="postPublished"
                          checked={published}
                          onChange={(e) => setPublished(e.target.checked)}
                          className="w-5 h-5 accent-primary text-primary cursor-pointer rounded"
                        />
                        <Label htmlFor="postPublished" className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer">
                          Publish resource live upon submitting compilation
                        </Label>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest ${published ? "bg-emerald-500/15 text-emerald-500" : "bg-slate-200 dark:bg-white/10 text-slate-400"}`}>
                        {published ? "Active Live" : "Private Draft"}
                      </span>
                    </div>

                    {/* Submit layout buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                      <Button 
                        type="button" 
                        onClick={() => setEditorMode("list")}
                        variant="outline"
                        className="h-14 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider"
                      >
                        Cancel change
                      </Button>
                      <Button 
                        type="submit" 
                        className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-secondary transition-colors"
                      >
                        <Save className="w-4 h-4" /> Save Post Output
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Dynamically rendered live preview page preview inside container */
                  <div className="space-y-8 animate-fade-in py-4">
                    <div className="space-y-2">
                      <div className="aspect-[16/8] rounded-2xl overflow-hidden shadow-sm relative shrink-0 border border-border/20 bg-muted">
                        {coverImage ? (
                          <img 
                            src={coverImage} 
                            alt={coverImageAlt || "Article cover image"} 
                            title={coverImageTitle || "Article cover image"}
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                        )}
                        <div className="absolute top-4 left-4 px-3 py-1 bg-background text-primary text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm border border-border/25">
                          {category}
                        </div>
                      </div>
                      {coverImageCaption && (
                        <p className="text-[11px] text-muted-foreground font-mono italic text-center mt-1.5">
                          {coverImageCaption}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {readTimeEst} min read</span>
                        <span>•</span>
                        <span>Published {date || "Just now"}</span>
                        <span>•</span>
                        <span>By {author || "Administrator"}</span>
                      </div>

                      <h1 className="text-2xl md:text-4xl font-black text-foreground italic uppercase tracking-tight leading-tight mb-4">
                        {title || "Untitled Masterpiece"}
                      </h1>

                      {excerpt && (
                        <blockquote className="border-l-4 border-primary pl-4 py-1.5 italic font-medium text-muted-foreground mb-8 text-sm">
                          {excerpt}
                        </blockquote>
                      )}

                      <div className="h-px bg-border/40 my-6" />

                      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-semibold space-y-4">
                        {content ? (
                          content.split("\n\n").map((block, idx) => {
                            if (block.startsWith("## ")) {
                              return (
                                <h2 key={idx} className="text-xl md:text-2xl font-black text-foreground italic uppercase tracking-tight pt-4 pb-1 border-b border-border/30">
                                  {block.replace("## ", "")}
                                </h2>
                              );
                            }
                            if (block.startsWith("### ")) {
                              return (
                                <h3 key={idx} className="text-lg font-black text-foreground uppercase tracking-wider pt-3">
                                  {block.replace("### ", "")}
                                </h3>
                              );
                            }
                            if (block.startsWith("- ")) {
                              return (
                                <ul key={idx} className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                                  {block.split("\n").map((li, i) => (
                                    <li key={i}>{li.replace("- ", "").replace(/\*\*/g, "")}</li>
                                  ))}
                                </ul>
                              );
                            }
                            return (
                              <p key={idx} className="text-sm text-muted-foreground font-semibold leading-relaxed">
                                {block}
                              </p>
                            );
                          })
                        ) : (
                          <p className="italic text-muted-foreground text-sm">Fill content to see rendered structure preview.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar Column: Top-Ranked SEO Settings Dashboard & Live Search Simulator (Right Column) */}
            <div className="lg:col-span-1 space-y-8">
              {/* Cover Live Card Preview Widget */}
              <Card className="p-6 border-none shadow-premium bg-card rounded-[2rem] overflow-hidden">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Sandbox Mini Card Preview
                </p>
                <div className="border border-border/30 rounded-2xl overflow-hidden shadow-sm bg-muted/20">
                  <div className="aspect-[16/10] bg-muted relative">
                    {coverImage ? (
                      <img 
                        src={coverImage} 
                        alt={coverImageAlt || "Mini card preview"} 
                        title={coverImageTitle || "Mini card preview"}
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                    )}
                    <span className="absolute top-3 left-3 bg-background text-primary font-black uppercase text-[8px] tracking-wider px-2 py-0.5 rounded-full shadow border border-border/20">
                      {category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{date || "Today"}</p>
                    <h5 className="text-sm font-black text-foreground line-clamp-1 truncate uppercase italic">
                      {title || "Insert Visual Title Name"}
                    </h5>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {excerpt || "Insert short excerpt outline parameters..."}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Advanced SEO Dashboard Box */}
              <Card className="p-8 border-none shadow-premium bg-card rounded-[2rem] space-y-6">
                <div>
                  <h4 className="text-sm font-black uppercase italic text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0ea5e9]" /> Google SEO Engine Settings
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Deploy custom ranking metadata index parameters.</p>
                </div>

                <div className="space-y-4 pt-2 border-t border-border/30">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <Label htmlFor="seoTitleInput" className="uppercase tracking-wider text-slate-400 font-bold">SEO Page Title Tag</Label>
                      <span className={`font-black ${seoTitleColor}`}>{seoTitle.length} characters</span>
                    </div>
                    <Input 
                      id="seoTitleInput"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Custom browser tab header title"
                      className="h-10 rounded-xl text-xs font-semibold"
                    />
                    <p className="text-[9px] text-slate-400 leading-normal">Recommending **40-60 characters** for search snippet display cuts.</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <Label htmlFor="seoDescInput" className="uppercase tracking-wider text-slate-400 font-bold">Meta Description</Label>
                      <span className={`font-black ${seoDescColor}`}>{seoDesc.length} characters</span>
                    </div>
                    <textarea 
                      id="seoDescInput"
                      value={seoDesc}
                      onChange={(e) => setSeoDesc(e.target.value)}
                      placeholder="Insert targeted search summarization data"
                      className="w-full h-20 bg-muted/30 border border-border/40 rounded-xl p-3 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                    <p className="text-[9px] text-slate-400 leading-normal">Optimizing at **120-160 characters** for Google text snippets outlines.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="seoKeywordsInput" className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Focus keywords (comma outline)</Label>
                    <Input 
                      id="seoKeywordsInput"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="saas, b2b, client-side, encryption"
                      className="h-10 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Live Google Search Snippet Simulator! */}
                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Google Snippet Simulator</p>
                    <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/30 text-[9px] font-bold">
                      <button 
                        type="button" 
                        onClick={() => setSeoPreviewType("desktop")}
                        className={`px-1.5 py-0.5 rounded transition-all ${seoPreviewType === "desktop" ? "bg-primary text-white font-black" : "text-slate-400"}`}
                      >
                        Desktop
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setSeoPreviewType("mobile")}
                        className={`px-1.5 py-0.5 rounded transition-all ${seoPreviewType === "mobile" ? "bg-primary text-white font-black" : "text-slate-400"}`}
                      >
                        Mobile
                      </button>
                    </div>
                  </div>

                  {/* Rendering Google result container */}
                  <div className={`p-4 bg-muted/20 border border-border/25 rounded-2xl ${seoPreviewType === "mobile" ? "max-w-[280px] mx-auto text-xs" : "w-full text-xs"}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-5 h-5 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center shrink-0">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="leading-none select-none truncate">
                        <p className="text-[10px] text-[#202124] dark:text-[#bdc1c6] font-bold truncate">Tooleefy Insights</p>
                        <p className="text-[9px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate">
                          https://tooleefy.com/blog/{slug || "why-client-side-computing"}
                        </p>
                      </div>
                    </div>
                    
                    <h5 className="text-[13px] md:text-[14px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight mb-1 font-semibold">
                      {seoTitle ? seoTitle.substring(0, 60) + (seoTitle.length > 60 ? "..." : "") : (title || "Custom SEO Title Banner")}
                    </h5>
                    
                    <p className="text-[11px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                      <span className="text-[#70757a] mr-1">{date || "Today"} —</span>
                      {seoDesc ? seoDesc.substring(0, 155) + (seoDesc.length > 155 ? "..." : "") : (excerpt || "A clean search indexing snippet explanation outline...")}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Toolbar Inserter Modals */}
      <AnimatePresence>
        {modalType !== "none" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType("none")}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border/60 rounded-[2.5rem] shadow-premium p-8 max-w-md w-full relative z-[101] space-y-6 animate-fade-in"
            >
              {modalType === "link" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Link className="w-5 h-5 text-primary" /> Insert Custom Hyperlink
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Highlight text first or write the anchor details here.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Link Label (Anchor Text)</Label>
                      <Input 
                        value={modalLinkLabel}
                        onChange={(e) => setModalLinkLabel(e.target.value)}
                        placeholder="e.g. read our documentation"
                        className="h-11 rounded-xl text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Destination URL (Address Link)</Label>
                      <Input 
                        value={modalLinkUrl}
                        onChange={(e) => setModalLinkUrl(e.target.value)}
                        placeholder="https://example.com/docs"
                        className="h-11 rounded-xl text-sm"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setModalType("none")}
                      className="rounded-xl h-11 text-xs uppercase font-extrabold"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        if (!modalLinkUrl.trim()) {
                          toast.error("Please insert a valid destination link URL!");
                          return;
                        }
                        const finalUrl = modalLinkUrl.trim().startsWith("http") ? modalLinkUrl.trim() : `https://${modalLinkUrl.trim()}`;
                        executeMarkupInsertion(`[${modalLinkLabel.trim() || 'Link URL'}](${finalUrl})`);
                        toast.success("Successfully injected custom link!");
                      }}
                      className="rounded-xl h-11 px-5 text-xs uppercase font-black tracking-wider bg-primary text-white"
                    >
                      Insert Link
                    </Button>
                  </div>
                </div>
              )}

              {modalType === "image" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" /> Inject Dynamic Article Illustration
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Upload a local picture instantly or paste an image URL.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-muted/40 p-3 rounded-xl border border-border/20">
                      <span className="text-[10px] font-black uppercase text-slate-500">Local Image File:</span>
                      <label className="cursor-pointer inline-flex items-center gap-1 bg-primary text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-secondary transition-all">
                        Select File
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error("File is too large! Max file size limit is 2MB.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setModalImageUrl(event.target.result as string);
                                  toast.success("Image converted to Base64 offline asset!");
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Image Source (URL or Base64 Data)</Label>
                      <Input 
                        value={modalImageUrl}
                        onChange={(e) => setModalImageUrl(e.target.value)}
                        placeholder="Paste image address URL or data:..."
                        className="h-10 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">SEO Alternative Alt text attribute (Mandatory)</Label>
                      <Input 
                        value={modalImageAlt}
                        onChange={(e) => setModalImageAlt(e.target.value)}
                        placeholder="e.g. Figure 2 - Interactive Unit converter layout"
                        className="h-10 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Optional Illustration Label Caption Text</Label>
                      <Input 
                        value={modalImageCaption}
                        onChange={(e) => setModalImageCaption(e.target.value)}
                        placeholder="e.g. Graphic illustrating relative size scales"
                        className="h-10 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setModalType("none")}
                      className="rounded-xl h-11 text-xs uppercase font-extrabold"
                    >
                      Keep writing
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        const src = modalImageUrl.trim();
                        if (!src) {
                          toast.error("Please provide an image URL source or upload a file!");
                          return;
                        }
                        const alt = modalImageAlt.trim() || "Illustration infographic";
                        
                        let markdownToInsert = `![${alt}](${src})`;
                        if (modalImageCaption.trim()) {
                          markdownToInsert += `\n*${modalImageCaption.trim()}*\n`;
                        }
                        
                        executeMarkupInsertion(`\n${markdownToInsert}\n`);
                        toast.success("Successfully illustrated article draft!");
                      }}
                      className="rounded-xl h-11 px-5 text-xs uppercase font-black tracking-wider bg-primary text-white"
                    >
                      Embed Image
                    </Button>
                  </div>
                </div>
              )}

              {modalType === "h2" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Heading className="w-5 h-5 text-primary" /> Insert Section Heading 2
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Dividing principal chapters with highly visible subtitles.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Heading 2 Text</Label>
                    <Input 
                      value={modalHeadText}
                      onChange={(e) => setModalHeadText(e.target.value)}
                      placeholder="e.g. Decentralized Architectures Core"
                      className="h-11 rounded-xl text-sm"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setModalType("none")}
                      className="rounded-xl h-11 text-xs uppercase font-extrabold"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        executeMarkupInsertion(`\n## ${modalHeadText.trim() || 'Heading Level 2'}\n`);
                        toast.success("Inserted Chapter Divider header.");
                      }}
                      className="rounded-xl h-11 px-5 text-xs uppercase font-black tracking-wider bg-primary text-white"
                    >
                      Insert H2
                    </Button>
                  </div>
                </div>
              )}

              {modalType === "h3" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Heading className="w-4 h-4 text-primary" /> Insert Subsection Heading 3
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Creating logical subdivisions inside your main chapters.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Heading 3 Text</Label>
                    <Input 
                      value={modalHeadText}
                      onChange={(e) => setModalHeadText(e.target.value)}
                      placeholder="e.g. Local parsing latency analysis"
                      className="h-11 rounded-xl text-sm"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setModalType("none")}
                      className="rounded-xl h-11 text-xs uppercase font-extrabold"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        executeMarkupInsertion(`\n### ${modalHeadText.trim() || 'Heading Level 3'}\n`);
                        toast.success("Inserted Subsection divider header.");
                      }}
                      className="rounded-xl h-11 px-5 text-xs uppercase font-black tracking-wider bg-primary text-white"
                    >
                      Insert H3
                    </Button>
                  </div>
                </div>
              )}

              {modalType === "quote" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Quote className="w-5 h-5 text-primary" /> Insert Quote or Adage Proverb
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">A highlight prose block to capture quotes, proverbs, or important takeaways.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Proverb Or Quote Text</Label>
                      <textarea 
                        value={modalQuoteText}
                        onChange={(e) => setModalQuoteText(e.target.value)}
                        placeholder="A quote that drives SaaS motivation..."
                        className="w-full h-24 bg-muted/40 border border-border/40 rounded-xl p-3 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Author Source / Citation Title (Optional)</Label>
                      <Input 
                        value={modalQuoteSource}
                        onChange={(e) => setModalQuoteSource(e.target.value)}
                        placeholder="e.g. Richard Feynman, 1965"
                        className="h-11 rounded-xl text-sm"
                      />
                    </div>

                    {/* Pre-written proverbs shortcuts */}
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Quick inspire proverbs:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { text: "Simplicity is the soul of modern software efficiency.", author: "Software adage" },
                          { text: "What runs client-side stays private, secured, and localized.", author: "Security principles" },
                          { text: "Great tools aren't built on cloud servers, they are proven in browsers.", author: "Modern UX" }
                        ].map((rec, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setModalQuoteText(rec.text);
                              setModalQuoteSource(rec.author);
                            }}
                            className="bg-muted hover:bg-muted/80 text-[10px] font-bold text-slate-500 px-2 py-1 rounded cursor-pointer"
                          >
                            Inspire {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setModalType("none")}
                      className="rounded-xl h-11 text-xs uppercase font-extrabold"
                    >
                      Dismiss
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        const srcCtn = modalQuoteSource.trim() ? ` — *${modalQuoteSource.trim()}*` : "";
                        executeMarkupInsertion(`\n> "${modalQuoteText.trim()}"${srcCtn}\n`);
                        toast.success("Successfully embedded adage proverb block!");
                      }}
                      className="rounded-xl h-11 px-5 text-xs uppercase font-black tracking-wider bg-primary text-white"
                    >
                      Insert Quote
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
