import { useState, useRef, ChangeEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import QRCodeStyling from "qr-code-styling";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Download, Plus, Trash2, FileUp, 
  Settings, CheckCircle2, AlertCircle,
  FileJson, FileSpreadsheet, Archive,
  Settings2, Star, Trophy, Sparkles,
  Search, Edit, Copy, Check, Printer, Info, Palette, Eye, Trash
} from "lucide-react";
import { QRStyleSettings } from "./QRStyleSettings";
import { AdvancedQRPreview } from "./AdvancedQRPreview";
import { toast } from "sonner";
import Papa from "papaparse";
import JSZip from "jszip";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/Logo";
import { logActivity } from "@/supabase/db";

export interface QRItem {
  content: string;
  name: string;
  price?: string;
  brand?: string;
  size?: string;
  category?: string;
}

export function BulkQRGenerator() {
  const navigate = useNavigate();
  const [showCongrats, setShowCongrats] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [items, setItems] = useState<QRItem[]>([]);
  const [namingTemplate, setNamingTemplate] = useState("qr-{n}");
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Styling States (Propagating to QRStyleSettings)
  const [dotsStyle, setDotsStyle] = useState<any>("square");
  const [cornersSquareStyle, setCornersSquareStyle] = useState<any>("square");
  const [cornersDotStyle, setCornersDotStyle] = useState<any>("square");
  const [fgColor, setFgColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [useGradient, setUseGradient] = useState(false);
  const [gradientType, setGradientType] = useState<any>("linear");
  const [gradientRotation, setGradientRotation] = useState(0);
  const [fgColor2, setFgColor2] = useState("#3b82f6");
  const [level, setLevel] = useState<any>("H");
  const [includeMargin, setIncludeMargin] = useState(true);
  const [marginSize, setMarginSize] = useState(2);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSize, setLogoSize] = useState(20);

  // Elite Styling States
  const [drawType, setDrawType] = useState<"canvas" | "svg">("canvas");
  const [shape, setShape] = useState<"square" | "circle">("square");
  const [backgroundRound, setBackgroundRound] = useState(0);
  const [dotsRoundSize, setDotsRoundSize] = useState(true);

  const [bgUseGradient, setBgUseGradient] = useState(false);
  const [bgColor2, setBgColor2] = useState("#f8fafc");
  const [bgGradientType, setBgGradientType] = useState<"linear" | "radial">("linear");
  const [bgGradientRotation, setBgGradientRotation] = useState(0);

  const [cornersSquareColor, setCornersSquareColor] = useState("");
  const [cornersSquareUseGradient, setCornersSquareUseGradient] = useState(false);
  const [cornersSquareColor2, setCornersSquareColor2] = useState("");
  const [cornersSquareGradientRotation, setCornersSquareGradientRotation] = useState(0);

  const [cornersDotColor, setCornersDotColor] = useState("");
  const [cornersDotUseGradient, setCornersDotUseGradient] = useState(false);
  const [cornersDotColor2, setCornersDotColor2] = useState("");
  const [cornersDotGradientRotation, setCornersDotGradientRotation] = useState(0);

  const [logoMargin, setLogoMargin] = useState(5);
  const [hideBackgroundDots, setHideBackgroundDots] = useState(true);

  // Creative Framings hooks
  const [frameStyle, setFrameStyle] = useState("none");
  const [frameText, setFrameText] = useState("SCAN ME");
  const [frameColor, setFrameColor] = useState("");

  // Advanced label design configurations (to match barcode generator options)
  const [useLabelHeader, setUseLabelHeader] = useState(false);
  const [labelTextHeader, setLabelTextHeader] = useState("PRODUCT LABEL");
  const [headerFontSize, setHeaderFontSize] = useState(14);
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderWidth, setBorderWidth] = useState(3);
  const [borderRadius, setBorderRadius] = useState("soft");
  const [exportScale, setExportScale] = useState(2);

  // Sequential parameters
  const [seqPrefix, setSeqPrefix] = useState("QR-URL-");
  const [seqStart, setSeqStart] = useState(1001);
  const [seqCount, setSeqCount] = useState(25);
  const [seqSuffix, setSeqSuffix] = useState("");
  const [seqPad, setSeqPad] = useState(5);
  const [seqStep, setSeqStep] = useState(1);
  const [showSeqGenerator, setShowSeqGenerator] = useState(false);

  // CSV Mapping columns states
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvDataRows, setCsvDataRows] = useState<any[]>([]);
  const [qrMappingCol, setQrMappingCol] = useState("");
  const [nameMappingCol, setNameMappingCol] = useState("");
  const [priceMappingCol, setPriceMappingCol] = useState("");
  const [brandMappingCol, setBrandMappingCol] = useState("");
  const [sizeMappingCol, setSizeMappingCol] = useState("");
  const [categoryMappingCol, setCategoryMappingCol] = useState("");

  // Grid preview inline items states & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editCategory, setEditCategory] = useState("");

  // Print Dialog States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printCols, setPrintCols] = useState(3);
  const [printGap, setPrintGap] = useState(12);
  const [printColorOn, setPrintColorOn] = useState(false);
  const [printIncludePrice, setPrintIncludePrice] = useState(true);
  const [printIncludeName, setPrintIncludeName] = useState(true);
  const [printIncludeBrand, setPrintIncludeBrand] = useState(true);
  const [printIncludeDetails, setPrintIncludeDetails] = useState(true);
  const [priceCurrencyPrefix, setPriceCurrencyPrefix] = useState("$");

  // Sync / Mass Modifiers states
  const [syncBulkPrice, setSyncBulkPrice] = useState("");
  const [syncBulkSize, setSyncBulkSize] = useState("");
  const [syncBulkCategory, setSyncBulkCategory] = useState("");
  const [syncBulkBrand, setSyncBulkBrand] = useState("");

  // Pagination bounds
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const handleSyncBulkMetadata = (field: "price" | "size" | "category" | "brand", value: string) => {
    if (items.length === 0) {
      toast.error("Active queue is empty. Generate or upload QR codes first!");
      return;
    }
    if (!value.trim()) {
      toast.error(`Please enter a valid value to apply for universal ${field}`);
      return;
    }
    const updated = items.map((item) => ({
      ...item,
      [field]: value.trim()
    }));
    setItems(updated);
    toast.success(`Broadcasting universal ${field} "${value.trim()}" across all ${items.length} items!`);
  };

  const handleSyncAllNamingTemplate = () => {
    if (items.length === 0) {
      toast.error("Active queue is empty.");
      return;
    }
    const updated = items.map((item, idx) => ({
      ...item,
      name: namingTemplate
        .replace("{n}", (idx + 1).toString())
        .replace("{content}", item.content.substring(0, 10))
    }));
    setItems(updated);
    toast.success(`Broadcasting naming template: identifiers refreshed across all ${items.length} items.`);
  };

  const handleApplyBrandingHeaderToBrands = () => {
    if (items.length === 0) {
      toast.error("Active queue is empty.");
      return;
    }
    if (!useLabelHeader) {
      toast.error("Label Header title printing is currently disabled. Toggle it under Advanced Label & Export first.");
      return;
    }
    const updated = items.map(item => ({
      ...item,
      brand: labelTextHeader
    }));
    setItems(updated);
    toast.success(`Synchronized global brand title "${labelTextHeader}" to all ${items.length} items.`);
  };

  const formatPriceWithPrefix = (price: string) => {
    if (!price) return "";
    const trimmed = price.trim();
    if (!priceCurrencyPrefix) return trimmed;
    
    // If the price already starts with the select/custom prefix, don't double prepend.
    if (trimmed.startsWith(priceCurrencyPrefix)) {
      return trimmed;
    }
    
    // Clean up existing common currency prefixes
    const commonPrefixes = ["$", "€", "£", "¥", "₹", "₪", "AED", "USD", "EUR", "GBP"];
    let cleanPrice = trimmed;
    for (const prefix of commonPrefixes) {
      if (cleanPrice.startsWith(prefix)) {
        cleanPrice = cleanPrice.slice(prefix.length).trim();
        break;
      }
    }
    
    return `${priceCurrencyPrefix}${cleanPrice}`;
  };

  const filteredItems = items.filter(
    x =>
      x.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      x.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (x.brand && x.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (x.category && x.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const processText = () => {
    const lines = bulkInput.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      toast.error("Enter some text or URL contents first");
      return;
    }

    const newItems = lines.map((line, idx) => {
      const existing = items[idx];
      let name = namingTemplate
        .replace("{n}", (idx + 1).toString())
        .replace("{content}", line.substring(0, 10));
      
      if (existing) {
        return {
          content: line,
          name: existing.content === line ? existing.name : name,
          price: existing.price,
          brand: existing.brand,
          size: existing.size,
          category: existing.category
        };
      }
      return { content: line, name };
    });

    setItems(newItems);
    toast.success(`Queue updated: ${newItems.length} items compiled! Attributes preserved.`);
  };

  const handleSequenceGenerate = () => {
    const generated: string[] = [];
    for (let i = 0; i < seqCount; i++) {
      const val = seqStart + i * seqStep;
      const paddedVal = val.toString().padStart(seqPad, "0");
      generated.push(`${seqPrefix}${paddedVal}${seqSuffix}`);
    }
    const resultText = generated.join("\n");
    setBulkInput(prev => prev ? `${prev}\n${resultText}` : resultText);
    toast.success(`${seqCount} sequence codes appended to bulk input feed! Click 'Sync Queue' to compile.`);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const firstRowObj = results.data[0] as Record<string, any>;
            const columns = Object.keys(firstRowObj);
            setCsvColumns(columns);
            setCsvDataRows(results.data);
            
            // Smart column detection
            const matchCol = (names: string[]) => {
              return columns.find(col => {
                const lower = col.toLowerCase();
                return names.some(n => lower.includes(n));
              }) || "";
            };

            const qrCol = matchCol(["qr", "code", "link", "url", "sku", "id", "serial"]) || columns[0] || "";
            const nameCol = matchCol(["product", "title", "name", "label", "item", "description"]);
            const priceCol = matchCol(["price", "cost", "msrp", "usd", "amount"]);
            const brandCol = matchCol(["brand", "company", "mfg", "vendor", "manufacturer"]);
            const sizeCol = matchCol(["size", "dimension", "weight", "pkg"]);
            const catCol = matchCol(["category", "dept", "department", "type", "class"]);

            setQrMappingCol(qrCol);
            setNameMappingCol(nameCol);
            setPriceMappingCol(priceCol);
            setBrandMappingCol(brandCol);
            setSizeMappingCol(sizeCol);
            setCategoryMappingCol(catCol);
            toast.info("CSV data structure parsed! Smart auto-mapped columns selected below.");
          } else {
            toast.error("Selected CSV file contains no parsed rows.");
          }
        },
        error: (err) => {
          toast.error(`Error parsing state CSV file: ${err.message}`);
        }
      });
    } else if (file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const data = Array.isArray(json) ? json : json.data || [];
          const newItems = data.map((content: any, idx: number) => {
            const isObj = typeof content === 'object' && content !== null;
            const val = isObj ? (content.value || content.url || content.content || JSON.stringify(content)) : String(content);
            return {
              content: val,
              name: isObj && content.name ? content.name : namingTemplate.replace("{n}", (idx + 1).toString()).replace("{content}", val.substring(0, 10)),
              brand: isObj && content.brand ? content.brand : undefined,
              price: isObj && content.price ? content.price : undefined,
              size: isObj && content.size ? content.size : undefined,
              category: isObj && content.category ? content.category : undefined,
            };
          });
          setItems(newItems);
          toast.success(`Successfully loaded ${newItems.length} items with properties from JSON!`);
        } catch {
          toast.error("Failed to parse file. JSON structure invalid.");
        }
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBulkInput(e.target?.result as string);
        toast.success("Text contents imported! Make sure to click 'Sync Queue' to compile.");
      };
      reader.readAsText(file);
    }
  };

  const applyCsvMapping = () => {
    if (!qrMappingCol) {
      toast.error("Please select a QR code link/value column.");
      return;
    }
    const inputLinesObj = csvDataRows.map((row, idx) => {
      const codeValue = row[qrMappingCol]?.toString().trim() || "";
      const customName = nameMappingCol && row[nameMappingCol] 
        ? row[nameMappingCol]?.toString().trim() 
        : namingTemplate.replace("{n}", (idx + 1).toString()).replace("{content}", codeValue.substring(0, 10));
      
      const price = priceMappingCol && row[priceMappingCol] ? row[priceMappingCol]?.toString().trim() : "";
      const brand = brandMappingCol && row[brandMappingCol] ? row[brandMappingCol]?.toString().trim() : "";
      const size = sizeMappingCol && row[sizeMappingCol] ? row[sizeMappingCol]?.toString().trim() : "";
      const category = categoryMappingCol && row[categoryMappingCol] ? row[categoryMappingCol]?.toString().trim() : "";

      return { codeValue, customName, price, brand, size, category };
    }).filter(x => x.codeValue.length > 0);

    const inputsText = inputLinesObj.map(x => x.codeValue).join("\n");
    setBulkInput(inputsText);

    const newItems = inputLinesObj.map(x => ({
      content: x.codeValue,
      name: x.customName,
      price: x.price,
      brand: x.brand,
      size: x.size,
      category: x.category
    }));

    setItems(newItems);
    toast.success(`Mapped & Sync'd queue with ${newItems.length} custom-structured QR items!`);
    
    // Clear CSV parameters
    setCsvColumns([]);
    setCsvDataRows([]);
  };

  /**
   * Complex Compound Label Assembler
   * Serializes the DOM-rendered raw QR code and dynamically wraps it with brand logos, headers, barcodes metadata, styling & custom stickers frame.
   */
  const buildPerfectCompoundSVG = (
     item: QRItem, 
     index: number, 
     svgElement: SVGSVGElement | null,
     overrideBg?: string,
     overrideLine?: string
   ) => {
     if (!svgElement) return "";
 
     const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
     
     // Clean up background rects from the QR canvas so they don't cover the label card background
     const rects = clonedSvg.querySelectorAll("rect");
     rects.forEach(rect => {
       const w = rect.getAttribute("width");
       const h = rect.getAttribute("height");
       const hasClip = rect.hasAttribute("clip-path") || rect.getAttribute("style")?.includes("clip-path");
       
       if (!hasClip && (w === "100%" || h === "100%" || w === "300" || h === "300" || w === "160" || h === "160" || Number(w) > 150)) {
         rect.remove();
       }
     });

     let svgData = new XMLSerializer().serializeToString(clonedSvg);
     // Remove declarations and namespaces
     svgData = svgData.replace(/<\?xml.*?\?>/g, "").replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "");
 
     const fontFam = "sans-serif";
     const rx = borderRadius === "none" ? 0 : borderRadius === "soft" ? 12 : 20;
 
     const currentBg = overrideBg || bgGradientType === "linear" ? bgColor : bgUseGradient ? bgColor : bgColor;
     const currentLine = overrideLine || fgColor;
 
     // Outer label layout dimensions (proportionate 320px width x 360px height square asset tag)
     const width = 320;
     const height = 360;
 
     const brandText = (item.brand || (useLabelHeader ? labelTextHeader : "") || "").trim().toUpperCase();
     const rawPrice = (item.price || "").trim();
     const priceText = rawPrice ? formatPriceWithPrefix(rawPrice) : "";
     const nameText = (item.name || `QR-ITEM #${index + 1}`).trim();
 
     const truncate = (st: string, max: number) => st.length > max ? st.slice(0, max - 3) + "..." : st;
 
     // Available tag bounds for centering the QR code
     const maxAvailableWidth = 220;
     const maxAvailableHeight = 220;
 
     // QR layout mapping coords
     const scaledWidth = maxAvailableWidth;
     const scaledHeight = maxAvailableHeight;
     const offsetX = (320 - scaledWidth) / 2;
     const offsetY = 75; // aligned perfectly in tag core
 
     // Safely extract paths
     const openTagIndex = svgData.indexOf(">");
     const closeTagIndex = svgData.lastIndexOf("</svg>");
     const svgContent = (openTagIndex !== -1 && closeTagIndex !== -1)
       ? svgData.substring(openTagIndex + 1, closeTagIndex)
       : svgData;
 
     const cleanSvgContent = svgContent;
 
     return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
   <style>
     .lbl-title { font-family: ${fontFam}, sans-serif; font-size: 13px; font-weight: 900; fill: ${currentLine}; }
     .lbl-brand { font-family: ${fontFam}, sans-serif; font-size: ${headerFontSize}px; font-weight: 900; fill: ${currentLine}; opacity: 0.85; letter-spacing: 0.05em; }
     .lbl-meta { font-family: ${fontFam}, monospace; font-size: 9px; font-weight: 700; fill: ${currentLine}; opacity: 0.7; }
     .lbl-price-badge { font-family: ${fontFam}, monospace; font-size: 10px; font-weight: 900; fill: ${overrideBg ? currentBg : "#ffffff"}; }
     
     /* Make sure scanning modules color complies with our line settings, while ignoring center brand logos & large background rects */
     .qr-nested path:not([fill="transparent"]):not([fill="none"]):not([class*="logo"]),
     .qr-nested rect:not([fill="transparent"]):not([fill="none"]):not([class*="logo"]) { fill: ${currentLine} !important; }
   </style>
   
   <!-- Sticker Card Background / Outline frame with perfect inset to prevent border clipping -->
   <rect x="${borderEnabled ? borderWidth / 2 : 0.5}" y="${borderEnabled ? borderWidth / 2 : 0.5}" width="${width - (borderEnabled ? borderWidth : 1)}" height="${height - (borderEnabled ? borderWidth : 1)}" rx="${rx}" fill="${currentBg}" stroke="${currentLine}" stroke-width="${borderEnabled ? borderWidth : 1}" stroke-opacity="${borderEnabled ? 1 : 0.15}" />
   
   <!-- Header Row (Brand logo title / Price) -->
   ${(useLabelHeader || item.brand || priceText) ? `<text x="20" y="32" class="lbl-brand">${truncate(brandText || "PRODUCT LABEL", 26)}</text>` : ""}
   
   ${priceText ? `
     <rect x="${300 - (priceText.length * 6 + 14)}" y="18" width="${priceText.length * 6 + 14}" height="20" rx="5" fill="${currentLine}" />
     <text x="${300 - (priceText.length * 6 + 14) / 2}" y="32" text-anchor="middle" class="lbl-price-badge">${priceText}</text>
   ` : ""}
   
   <!-- Header Separator line -->
   ${((useLabelHeader || item.brand) || priceText) ? `
     <line x1="20" y1="44" x2="300" y2="44" stroke="${currentLine}" stroke-width="1" stroke-dasharray="1 3" stroke-opacity="0.3" />
   ` : ""}
   
   <!-- Item Display Title -->
   <text x="20" y="62" class="lbl-title">${truncate(nameText.toUpperCase(), 25)}</text>
   
   <!-- Scaled QR Nested Vector paths -->
   <g class="qr-nested">
     <svg x="${offsetX}" y="${offsetY}" width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 300 300">
       ${cleanSvgContent}
     </svg>
   </g>
   
   <!-- Bottom details container (Size / Sizing parameter & department category) -->
   ${(item.size || item.category) ? `
     <line x1="20" y1="316" x2="300" y2="316" stroke="${currentLine}" stroke-width="1" stroke-dasharray="1 3" stroke-opacity="0.3" />
     <text x="20" y="335" class="lbl-meta">${item.size ? `SIZE: ${truncate(item.size.toUpperCase(), 16)}` : ""}</text>
     <text x="300" y="335" text-anchor="end" class="lbl-meta">${item.category ? `CAT: ${truncate(item.category.toUpperCase(), 16)}` : ""}</text>
   ` : ""}
 </svg>`;
  };

  const executeBulkSVGExport = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const zip = new JSZip();
    const folder = zip.folder("qr_codes_vector_labels");
    const toastId = toast.loading(`Generating vector label packages with ${items.length} items...`);

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const wrapper = document.querySelector(`#bulk-qr-raw-${i}`);
        const svgElement = wrapper?.querySelector("svg") as SVGSVGElement | null;
        if (svgElement) {
          const svgData = buildPerfectCompoundSVG(item, i, svgElement);
          if (svgData) {
            folder?.file(`${item.name}.svg`, svgData);
          }
        }
        if (i % 20 === 0) {
          await new Promise(r => setTimeout(r, 0));
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `industrial-qr-stickers-svg-${Date.now()}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success(`Successfully packaged & exported ${items.length} SVG stickers!`, { id: toastId });
      setShowCongrats(true);
      logActivity({
        tool_type: 'qr',
        name: `Bulk QR Pack (${items.length} codes)`,
        status: 'Bulk Export (SVG)'
      });
    } catch {
      toast.error("Error packaging vector SVG structures.", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  const executeBulkPNGExport = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const zip = new JSZip();
    const folder = zip.folder("qr_codes_raster_labels");
    const toastId = toast.loading(`Rasterizing and scaling ${items.length} stickers at ${exportScale}x multiplier...`);

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const wrapper = document.querySelector(`#bulk-qr-raw-${i}`);
        const svgElement = wrapper?.querySelector("svg") as SVGSVGElement | null;
        if (svgElement) {
          const svgData = buildPerfectCompoundSVG(item, i, svgElement);
          if (svgData) {
            const canvas = document.createElement("canvas");
            const img = new Image();
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);

            await new Promise<void>((resolve) => {
              img.onload = () => {
                const scale = exportScale;
                canvas.width = 320 * scale;
                canvas.height = 360 * scale;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.fillStyle = bgColor;
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const pngBase64 = canvas.toDataURL("image/png").split(',')[1];
                  folder?.file(`${item.name}.png`, pngBase64, { base64: true });
                }
                URL.revokeObjectURL(url);
                resolve();
              };
              img.src = url;
            });
          }
        }
        if (i % 20 === 0) {
          await new Promise(r => setTimeout(r, 0));
          toast.loading(`Rasterizing: ${Math.round((i / items.length) * 100)}%`, { id: toastId });
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `industrial-qr-stickers-png-${exportScale}x-${Date.now()}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success(`Successfully packaged & downloaded ${items.length} PNG images!`, { id: toastId });
      setShowCongrats(true);
      logActivity({
        tool_type: 'qr',
        name: `Bulk QR Pack (${items.length} codes)`,
        status: 'Bulk Export (PNG)'
      });
    } catch {
      toast.error("Error packaging high-res PNG images.", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSingleItem = (index: number) => {
    const wrapper = document.querySelector(`#bulk-qr-raw-${index}`);
    const svgElement = wrapper?.querySelector("svg") as SVGSVGElement | null;
    if (!svgElement) {
      toast.error("Target QR code visual is compiling/rendering. Wait a brief second.");
      return;
    }

    const svgData = buildPerfectCompoundSVG(items[index], index, svgElement);
    if (!svgData) return;

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `${items[index].name}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success(`Exported vector label ${items[index].name}.svg`);
  };

  const handleCopySingleItemCode = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied item value to clipboard!");
  };

  const handleResetAll = () => {
    setBulkInput("");
    setItems([]);
    setCsvColumns([]);
    setCsvDataRows([]);
    setQrMappingCol("");
    setNameMappingCol("");
    setPriceMappingCol("");
    setBrandMappingCol("");
    setSizeMappingCol("");
    setCategoryMappingCol("");
    setSearchQuery("");
    
    // Reset configs back to standard Classic default profile
    setDotsStyle("square");
    setCornersSquareStyle("square");
    setCornersDotStyle("square");
    setFgColor("#0f172a");
    setBgColor("#ffffff");
    setUseGradient(false);
    setBgUseGradient(false);
    setLevel("H");
    setLogoUrl("");
    setUseLabelHeader(false);
    setBorderEnabled(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Queue reset. Restoration complete.");
  };

  const handlePrintInNewTab = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup was blocked! Please enable popups to allow print spooling.");
      return;
    }

    const itemsHtml = items.map((item, idx) => {
      const wrapper = document.querySelector(`#bulk-qr-raw-${idx}`);
      const svgElement = wrapper?.querySelector("svg") as SVGSVGElement | null;
      if (!svgElement) return "";

      const prBg = printColorOn ? bgColor : "#ffffff";
      const prLine = printColorOn ? fgColor : "#000000";

      const svgData = buildPerfectCompoundSVG(item, idx, svgElement, prBg, prLine);
      return `
        <div class="print-sticker-container" style="
          page-break-inside: avoid;
          break-inside: avoid;
          margin: ${printGap / 2}px;
          display: inline-block;
        ">
          ${svgData}
        </div>
      `;
    }).join("");

    const pageHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Print QR Stickers Layout (${items.length} items)</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: #f3f4f6;
            display: flex;
            justify-content: center;
          }
          #print-grid {
            display: grid;
            grid-template-columns: repeat(${printCols}, minmax(0, 1fr));
            gap: ${printGap}px;
            max-width: fit-content;
          }
          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }
            #print-grid {
              grid-template-columns: repeat(${printCols}, minmax(0, 1fr));
              gap: ${printGap}px;
            }
            .toolbar {
              display: none !important;
            }
          }
          .toolbar {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            padding: 10px 18px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            gap: 12px;
            align-items: center;
            border: 1px solid rgba(0,0,0,0.06);
          }
          .btn {
            cursor: pointer;
            border: none;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 8px;
            transition: all 0.2s;
          }
          .btn-primary {
            background: #eab308;
            color: white;
          }
          .btn-primary:hover {
            background: #ca8a04;
          }
          .btn-secondary {
            background: #e2e8f0;
            color: #334155;
          }
          .btn-secondary:hover {
            background: #cbd5e1;
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <span style="font-size:11px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.05em;">Print Hub (QR Labels)</span>
          <button class="btn btn-primary" onclick="window.print()">Print Labels</button>
          <button class="btn btn-secondary" onclick="window.close()">Close Hub</button>
        </div>

        <div id="print-grid">
          ${itemsHtml}
        </div>

        <script>
          window.addEventListener("DOMContentLoaded", () => {
            setTimeout(() => {
              window.print();
            }, 500);
          });
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(pageHtml);
    printWindow.document.close();
  };

  const handleEditItemSave = (index: number) => {
    const next = [...items];
    next[index] = {
      content: editContent,
      name: editName,
      price: editPrice,
      brand: editBrand,
      size: editSize,
      category: editCategory
    };
    setItems(next);
    setEditingIdx(null);
    toast.success("Label properties customized and saved!");
  };

  const handleCloneItemAndPush = (item: QRItem) => {
    const nextVal = `${item.content}-copy`;
    const nextName = `${item.name}-copy`;
    const clonedObj: QRItem = {
      ...item,
      content: nextVal,
      name: nextName
    };
    const updated = [...items, clonedObj];
    setItems(updated);
    toast.success("Successfully duplicated item in active queue!");
  };

  return (
    <div className="space-y-10">
      {/* Upper Grid Workspace / Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Layout Span: Input feed, File uploaders & mapper mapping panel */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <Card className="p-5 sm:p-8 border-none shadow-premium rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight uppercase">Content Feed</h2>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Feed raw scanner sequences or product dataset spreadsheets</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowSeqGenerator(!showSeqGenerator);
                    }} 
                    className={`h-9 rounded-xl text-[10px] uppercase font-black transition-all flex-1 sm:flex-none ${
                      showSeqGenerator ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-primary/10"
                    }`}
                  >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Sequence Generator
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-9 rounded-xl text-[10px] uppercase font-black hover:bg-primary/10 border border-border/40 bg-zinc-50 dark:bg-zinc-900/10 flex-1 sm:flex-none">
                      <FileUp className="w-3.5 h-3.5 mr-1.5" /> Import CSV/TXT
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.txt,.json" className="hidden" />
              </div>
            </div>

            {/* Expanded Sequence generator drawers */}
            <AnimatePresence>
              {showSeqGenerator && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/15 space-y-4 text-slate-800 dark:text-zinc-150">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-amber-950 dark:text-amber-300">Sequential Range Builder</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold leading-normal">Generate serial parameters to seed barcode grids automatically.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-400">Prefix Code</Label>
                        <Input value={seqPrefix} onChange={(e) => setSeqPrefix(e.target.value)} size={1} className="h-9 px-2.5 text-xs font-bold font-mono rounded-lg bg-white dark:bg-zinc-950" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-400">Start Offset</Label>
                        <Input type="number" value={seqStart} onChange={(e) => setSeqStart(Number(e.target.value))} className="h-9 px-2.5 text-xs font-bold font-mono rounded-lg bg-white dark:bg-zinc-950" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-400">Yield Count</Label>
                        <Input type="number" value={seqCount} onChange={(e) => setSeqCount(Number(e.target.value))} className="h-9 px-2.5 text-xs font-bold font-mono rounded-lg bg-white dark:bg-zinc-950" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-400">Suffix Code</Label>
                        <Input value={seqSuffix} onChange={(e) => setSeqSuffix(e.target.value)} className="h-9 px-2.5 text-xs font-bold font-mono rounded-lg bg-white dark:bg-zinc-950" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-400">Padding Size</Label>
                        <Input type="number" value={seqPad} onChange={(e) => setSeqPad(Number(e.target.value))} className="h-9 px-2.5 text-xs font-bold font-mono rounded-lg bg-white dark:bg-zinc-950" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-400">Range Step</Label>
                        <Input type="number" value={seqStep} onChange={(e) => setSeqStep(Number(e.target.value))} className="h-9 px-2.5 text-xs font-bold font-mono rounded-lg bg-white dark:bg-zinc-950" />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button size="sm" onClick={handleSequenceGenerate} className="h-9 font-extrabold uppercase rounded-lg text-[10px] bg-amber-500 hover:bg-amber-600 text-white leading-none border-b-2 border-amber-800 shrink-0">
                        Compile Sequential Range
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CSV mapping interface pane */}
            {csvColumns.length > 0 && (
              <div className="p-6 bg-[#daf3e4] rounded-[2rem] border border-emerald-300/40 space-y-4 mb-6 animate-fade-in text-emerald-950">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#06241b]">CSV Product Data Detection & Mapper</h3>
                </div>
                <p className="text-[10px] text-emerald-900 leading-snug">The engine automatically analyzed headers and detected attributes. Tweak mapping fields to customize dynamic stickers:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">QR Link/Value *</Label>
                    <select 
                      value={qrMappingCol} 
                      onChange={(e) => setQrMappingCol(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-emerald-300/30 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                    >
                      <option value="">-- Choose Key/URL Column --</option>
                      {csvColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">Product Name / Title</Label>
                    <select 
                      value={nameMappingCol} 
                      onChange={(e) => setNameMappingCol(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-emerald-300/30 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                    >
                      <option value="">-- Content Value (Fallback) --</option>
                      {csvColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">Price Tag (Badge)</Label>
                    <select 
                      value={priceMappingCol} 
                      onChange={(e) => setPriceMappingCol(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-emerald-300/30 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                    >
                      <option value="">-- None --</option>
                      {csvColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">Brand / Company</Label>
                    <select 
                      value={brandMappingCol} 
                      onChange={(e) => setBrandMappingCol(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-emerald-300/30 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                    >
                      <option value="">-- None --</option>
                      {csvColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">Size / Attribute</Label>
                    <select 
                      value={sizeMappingCol} 
                      onChange={(e) => setSizeMappingCol(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-emerald-300/30 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                    >
                      <option value="">-- None --</option>
                      {csvColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">Category / Type</Label>
                    <select 
                      value={categoryMappingCol} 
                      onChange={(e) => setCategoryMappingCol(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-emerald-300/30 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                    >
                      <option value="">-- None --</option>
                      {csvColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="ghost" onClick={() => { setCsvColumns([]); setCsvDataRows([]); }} className="rounded-xl text-[10px] uppercase font-black hover:bg-emerald-100 text-[#06241b]">Discard Dataset</Button>
                  <Button size="sm" onClick={applyCsvMapping} className="rounded-xl text-[10px] uppercase font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-b-2 border-emerald-850">Map CSV Dataset</Button>
                </div>
              </div>
            )}

            {/* Input field */}
            <Textarea 
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Enter contents or web urls (one content value per line)..."
              className="min-h-[250px] overflow-y-auto rounded-3xl border-none bg-muted/30 p-8 text-lg font-medium focus-visible:ring-primary/20 font-mono scrollbar-thin"
              style={{ fieldSizing: "fixed" } as any}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Filename Template</Label>
                <div className="relative">
                    <Input 
                      value={namingTemplate}
                      onChange={(e) => setNamingTemplate(e.target.value)}
                      className="h-12 rounded-xl bg-muted/30 border-none px-4 font-mono text-xs text-foreground font-bold"
                    />
                    <div className="flex gap-4 mt-2 ml-2">
                      <span className="text-[9px] font-bold text-muted-foreground opacity-60 italic">Use &#123;n&#125; for page index</span>
                    </div>
                </div>
              </div>
              <Button onClick={processText} className="self-end h-12 rounded-xl font-black uppercase tracking-widest gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-500 border-b-[5px] border-b-emerald-950 hover:border-b-4 active:border-b-0 active:translate-y-1 transition-all">
                Sync Active Queue
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Layout Span: Engine system status card & direct exports settings */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <Card className="p-5 sm:p-8 border-none shadow-premium bg-card flex flex-col justify-between rounded-[2rem] sm:rounded-[2.5rem]">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Archive className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                      <h3 className="font-black uppercase tracking-tight italic">Engine Status</h3>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">High-volume vector processing ready</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-muted/20 rounded-2xl border border-border/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Queue Size</p>
                      <p className="text-xl sm:text-2xl font-black">{items.length}</p>
                   </div>
                   <div className="p-4 bg-muted/20 rounded-2xl border border-border/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Export Mode</p>
                      <p className="text-xs min-[340px]:text-sm sm:text-lg md:text-xl font-black italic uppercase text-primary whitespace-nowrap">ZIP Vectors</p>
                   </div>
                </div>

                {/* Dynamic label scale control to prevent duplication of options cards */}
                <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-border flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Export PNG Scale</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-black font-mono">{exportScale}x (DPI)</span>
                  </div>
                  <input 
                    type="range" min="1" max="4" step="1" value={exportScale} 
                    onChange={e => setExportScale(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 cursor-pointer bg-muted" 
                  />
                  <span className="text-[8px] opacity-70 font-semibold text-muted-foreground">Increases high resolution output boundary for raster printing.</span>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/40">
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dynamic Vector Overlays</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Centering excavations</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">High Correction Scan Rates</span>
                   </div>
                </div>
             </div>

             <div className="space-y-3 pt-8">
                {/* Advanced Multi-mode Export controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Button 
                    onClick={executeBulkSVGExport} 
                    disabled={items.length === 0 || processing}
                    className="h-14 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-[9.5px] bg-[#0c4a6e] hover:bg-[#075985] text-white border-b-[5px] border-b-[#0369a1] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 shrink-0" /> SVG Labels Pack
                  </Button>
                  <Button 
                    onClick={executeBulkPNGExport} 
                    disabled={items.length === 0 || processing}
                    className="h-14 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-[9.5px] bg-[#1e1b4b] hover:bg-[#312e81] text-white border-b-[5px] border-b-[#3730a3] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 shrink-0" /> PNG Labels Pack
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Button 
                    onClick={() => setIsPrintModalOpen(true)}
                    disabled={items.length === 0 || processing}
                    className="h-12 rounded-xl text-[10.5px] font-black uppercase tracking-wider text-amber-950 bg-amber-400 hover:bg-amber-500 border-b-[4px] border-b-amber-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1 w-full shrink-0"
                  >
                    <Printer className="w-4 h-4 shrink-0" /> Print Setup
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleResetAll} 
                    disabled={items.length === 0} 
                    className="h-12 rounded-xl text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-extrabold bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border-2 border-red-200 dark:border-red-900/50 border-b-[4px] border-b-red-300 dark:border-b-red-800 hover:border-b-[3px] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center select-none shadow-sm disabled:opacity-40 disabled:pointer-events-none gap-1 shrink-0"
                  >
                     <Trash2 className="w-4 h-4 mr-1.5 shrink-0" /> Reset Panel
                  </Button>
                </div>
             </div>
          </Card>
        </div>
      </div>

      {/* Advanced Design Parameters config block (reusing standard variables) */}
      <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card">
         <div className="flex items-center gap-3 border-b pb-4 mb-6 border-border/40">
           <div className="w-10 h-10 bg-[#daf3e4] rounded-xl flex items-center justify-center">
             <Settings className="w-5 h-5 text-emerald-700" />
           </div>
           <div>
             <h3 className="font-black text-sm uppercase tracking-wider text-foreground">Advanced Label Design & Stickers Framing</h3>
             <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Configure optional stamp properties to print tags seamlessly</p>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-border/40">
             <div className="flex items-center justify-between pb-1">
               <span className="text-[10.5px] font-black uppercase tracking-wider">Header Branding Print</span>
               <Switch checked={useLabelHeader} onCheckedChange={setUseLabelHeader} className="scale-75" />
             </div>
             {useLabelHeader && (
               <div className="space-y-3.5 animate-fade-in">
                 <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase text-muted-foreground">Header Text Override</Label>
                   <Input value={labelTextHeader} onChange={(e) => setLabelTextHeader(e.target.value)} className="h-9 px-3 text-xs font-bold rounded-lg" />
                 </div>
                 <div className="space-y-1.5">
                   <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground">
                     <span>Header Font Size</span>
                     <span>{headerFontSize}px</span>
                   </div>
                   <input type="range" min="10" max="18" value={headerFontSize} onChange={e => setHeaderFontSize(Number(e.target.value))} className="w-full accent-primary h-1.5" />
                 </div>
               </div>
             )}
           </div>

           <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-border/40">
             <div className="flex items-center justify-between pb-1">
               <span className="text-[10.5px] font-black uppercase tracking-wider">Card Outer Border</span>
               <Switch checked={borderEnabled} onCheckedChange={setBorderEnabled} className="scale-75" />
             </div>
             {borderEnabled && (
               <div className="space-y-3.5 animate-fade-in">
                 <div className="space-y-1.5">
                   <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground">
                     <span>Border Width</span>
                     <span>{borderWidth}px</span>
                   </div>
                   <input type="range" min="1" max="6" value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} className="w-full h-1.5" />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase text-muted-foreground">Border Curve</Label>
                   <select value={borderRadius} onChange={e => setBorderRadius(e.target.value)} className="w-full h-9 px-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                     <option value="none">Flat Square Corner</option>
                     <option value="soft">Soft/Round Corner (12px)</option>
                     <option value="large">Industrial Rounded Capsule</option>
                   </select>
                 </div>
               </div>
             )}
           </div>

           <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-border/40 flex flex-col justify-end">
             <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-[9px] font-semibold leading-relaxed text-[#006241] dark:text-emerald-400">
               These properties are automatically built-in and packed cleanly inside compound SVG vectors/PNG sticker exports and spoolers!
             </div>
           </div>
         </div>
      </Card>

      {/* Synchronizer dashboard / Mass settings modifiers */}
      <Card className="p-10 border-none shadow-premium rounded-[3rem] bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/45 pb-6 mb-8">
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase italic flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" /> Active Queue Synchronizer
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Broadly modify pricing metadata, brands and attributes across active nodes</p>
          </div>
          {items.length > 0 && (
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006241] dark:text-[#a0ffd9] px-4 py-1.5 bg-emerald-500/10 rounded-full shrink-0">
              Active Targets: {items.length} Items in Queue
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/10">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Active queue is empty</p>
            <p className="text-[10px] text-muted-foreground/85 mt-1">Please type or paste elements, generate sequences, or import spreadsheets above to begin universal sync tools</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Branding & Identifier template broadcast */}
            <div className="lg:col-span-5 p-5 bg-[#eaf8f0] dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/10 flex flex-col justify-between gap-5 text-emerald-950 dark:text-emerald-50">
              <div className="space-y-3">
                <span className="text-[10.5px] font-black uppercase tracking-widest text-[#006241] dark:text-emerald-400 block pb-1">Branding & Identifier Sync</span>
                <p className="text-[10px] text-emerald-900/80 dark:text-emerald-300 leading-relaxed font-semibold">Utilize the universal template configuration or stamp header parameter of the app to overwrite queue identifiers:</p>
                
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/65 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10">
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest block text-[#06241b] dark:text-emerald-400">Universal Brand Title</span>
                      <span className="text-[8.5px] text-muted-foreground block font-bold mt-0.5">{useLabelHeader ? `Apply "${labelTextHeader}" as Brand` : 'Header Design is currently disabled'}</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!useLabelHeader}
                      onClick={handleApplyBrandingHeaderToBrands}
                      className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 cursor-pointer shrink-0 border-none"
                    >
                      Apply Brand
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/65 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10">
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest block text-[#06241b] dark:text-emerald-400">Re-apply Naming Pattern</span>
                      <span className="text-[8.5px] text-muted-foreground block font-bold mt-0.5">Use template "${namingTemplate}" for file labels</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSyncAllNamingTemplate}
                      className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer shrink-0 border-none"
                    >
                      Apply Names
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Mass metadata overrides */}
            <div className="lg:col-span-7 p-5 bg-[#eaf8f0] dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/10 text-emerald-950 dark:text-emerald-50 text-left">
              <span className="text-[10.5px] font-black uppercase tracking-widest text-[#006241] dark:text-emerald-400 block mb-1">Mass Metadata Overwrites</span>
              <p className="text-[10px] text-emerald-900/80 dark:text-emerald-300 leading-relaxed font-semibold mb-4">Enter secondary tag attributes to broadly override the values across all sequence targets:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand */}
                <div className="p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10 space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-[#06241b] dark:text-emerald-400">Universal Brand name</Label>
                  <div className="flex gap-1.5">
                    <Input
                      value={syncBulkBrand}
                      onChange={(e) => setSyncBulkBrand(e.target.value)}
                      placeholder="e.g. CORE COLLECTION"
                      className="h-8 text-[10px] font-bold rounded-lg px-2 text-slate-900 dark:text-white border-emerald-500/20 bg-white dark:bg-slate-950"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSyncBulkMetadata("brand", syncBulkBrand)}
                      className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 px-3 cursor-pointer shrink-0 border-none animate-fade-in"
                    >
                      Set All
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10 space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-[#06241b] dark:text-emerald-400">Universal Price badge</Label>
                  <div className="flex gap-1.5">
                    <Input
                      value={syncBulkPrice}
                      onChange={(e) => setSyncBulkPrice(e.target.value)}
                      placeholder="e.g. 19.99"
                      className="h-8 text-[10px] font-bold rounded-lg px-2 text-slate-900 dark:text-white border-emerald-500/20 bg-white dark:bg-slate-950"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSyncBulkMetadata("price", syncBulkPrice)}
                      className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 px-3 cursor-pointer shrink-0 border-none"
                    >
                      Set All
                    </Button>
                  </div>
                </div>

                {/* Size */}
                <div className="p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10 space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-[#06241b] dark:text-emerald-400">Universal Size Label</Label>
                  <div className="flex gap-1.5">
                    <Input
                      value={syncBulkSize}
                      onChange={(e) => setSyncBulkSize(e.target.value)}
                      placeholder="e.g. XL/Standard"
                      className="h-8 text-[10px] font-bold rounded-lg px-2 text-slate-900 dark:text-white border-emerald-500/20 bg-white dark:bg-slate-950"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSyncBulkMetadata("size", syncBulkSize)}
                      className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 px-3 cursor-pointer shrink-0 border-none"
                    >
                      Set All
                    </Button>
                  </div>
                </div>

                {/* Category */}
                <div className="p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10 space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-[#06241b] dark:text-emerald-400">Universal Category</Label>
                  <div className="flex gap-1.5">
                    <Input
                      value={syncBulkCategory}
                      onChange={(e) => setSyncBulkCategory(e.target.value)}
                      placeholder="e.g. ELECTRONICS"
                      className="h-8 text-[10px] font-bold rounded-lg px-2 text-slate-900 dark:text-white border-emerald-500/20 bg-white dark:bg-slate-950"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSyncBulkMetadata("category", syncBulkCategory)}
                      className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 px-3 cursor-pointer shrink-0 border-none"
                    >
                      Set All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Global Design Workspace Component */}
      <Card className="p-10 border-none shadow-premium rounded-[3rem] bg-card overflow-hidden relative">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase italic">Global Design Workspace</h2>
        </div>
        
        <QRStyleSettings 
          dotsStyle={dotsStyle} setDotsStyle={setDotsStyle}
          cornersSquareStyle={cornersSquareStyle} setCornersSquareStyle={setCornersSquareStyle}
          cornersDotStyle={cornersDotStyle} setCornersDotStyle={setCornersDotStyle}
          fgColor={fgColor} setFgColor={setFgColor}
          bgColor={bgColor} setBgColor={setBgColor}
          useGradient={useGradient} setUseGradient={setUseGradient}
          fgColor2={fgColor2} setFgColor2={setFgColor2}
          gradientRotation={gradientRotation} setGradientRotation={setGradientRotation}
          level={level} setLevel={setLevel}
          includeMargin={includeMargin} setIncludeMargin={setIncludeMargin}
          marginSize={marginSize} setMarginSize={setMarginSize}
          logoSize={logoSize} setLogoSize={setLogoSize}
          logoUrl={logoUrl} setLogoUrl={setLogoUrl}

          // Elite Bindings fallback
          drawType={drawType} setDrawType={setDrawType}
          shape={shape} setShape={setShape}
          backgroundRound={backgroundRound} setBackgroundRound={setBackgroundRound}
          dotsRoundSize={dotsRoundSize} setDotsRoundSize={setDotsRoundSize}
          bgUseGradient={bgUseGradient} setBgUseGradient={setBgUseGradient}
          bgColor2={bgColor2} setBgColor2={setBgColor2}
          bgGradientType={bgGradientType} setBgGradientType={setBgGradientType}
          bgGradientRotation={bgGradientRotation} setBgGradientRotation={setBgGradientRotation}
          cornersSquareColor={cornersSquareColor} setCornersSquareColor={setCornersSquareColor}
          cornersSquareUseGradient={cornersSquareUseGradient} setCornersSquareUseGradient={setCornersSquareUseGradient}
          cornersSquareColor2={cornersSquareColor2} setCornersSquareColor2={setCornersSquareColor2}
          cornersSquareGradientRotation={cornersSquareGradientRotation} setCornersSquareGradientRotation={setCornersSquareGradientRotation}
          cornersDotColor={cornersDotColor} setCornersDotColor={setCornersDotColor}
          cornersDotUseGradient={cornersDotUseGradient} setCornersDotUseGradient={setCornersDotUseGradient}
          cornersDotColor2={cornersDotColor2} setCornersDotColor2={setCornersDotColor2}
          cornersDotGradientRotation={cornersDotGradientRotation} setCornersDotGradientRotation={setCornersDotGradientRotation}
          logoMargin={logoMargin} setLogoMargin={setLogoMargin}
          hideBackgroundDots={hideBackgroundDots} setHideBackgroundDots={setHideBackgroundDots}

          // Premium Customizable Frame
          frameStyle={frameStyle} setFrameStyle={setFrameStyle}
          frameText={frameText} setFrameText={setFrameText}
          frameColor={frameColor} setFrameColor={setFrameColor}
        />
      </Card>

      {/* Queue Preview, Search filter, pagination and Individual Actions */}
      {items.length > 0 && (
        <div className="pt-10 border-t border-border/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="space-y-1 text-left">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Queue Preview & Explorer ({filteredItems.length} active)</h3>
                <p className="text-[10px] text-muted-foreground">Tweak individual items properties, clone layout, preview compound stickers or copy content values.</p>
             </div>
             
             <div className="flex items-center gap-3 w-full sm:w-auto max-w-sm">
               <div className="relative w-full">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
                 <Input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => { 
                     setSearchQuery(e.target.value);
                     setCurrentPage(1); 
                   }}
                   placeholder="Filter active queue..." 
                   className="h-9 pl-9 rounded-xl border border-border/50 text-xs w-full text-foreground"
                 />
               </div>
               <span className="text-[10px] whitespace-nowrap font-bold text-primary px-3 py-1 bg-primary/10 rounded-full uppercase shrink-0">
                 Found {filteredItems.length} items
               </span>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedItems.map((item, idx) => {
                  // Track precise logical index inside core item array
                  const originalIdx = items.findIndex(orItem => orItem.content === item.content && orItem.name === item.name);
                  const isEditing = editingIdx === originalIdx;

                  return (
                     <div 
                       key={idx} 
                       className="group relative p-5 bg-white border-2 hover:border-emerald-500/50 hover:shadow-md transition-all rounded-3xl overflow-hidden flex flex-col justify-between gap-4 bg-card border-none shadow-[rgba(0,0,0,0.05)_0px_4px_12px_1px]"
                       style={{ 
                         backgroundColor: bgGradientType === "linear" ? bgColor : bgUseGradient ? bgColor : bgColor,
                         borderColor: borderEnabled ? fgColor : "rgba(226, 232, 240, 0.4)",
                         borderWidth: borderEnabled ? `${borderWidth}px` : "1px",
                         borderRadius: borderRadius === "none" ? "0px" : borderRadius === "soft" ? "1.25rem" : "2.5rem"
                       }}
                     >
                       {/* Brand label & Price Badge visual render */}
                       {((useLabelHeader && labelTextHeader) || item.brand || item.price) && (
                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider pb-1.5 border-b border-dashed" style={{ borderColor: `${fgColor}33`, color: fgColor }}>
                           <span className="truncate max-w-[70%] text-left" style={{ fontSize: `${headerFontSize * 0.75}px` }}>
                             {item.brand || (useLabelHeader ? labelTextHeader : "PRODUCT LABEL")}
                           </span>
                           {item.price && (
                             <span className="px-1.5 py-0.5 rounded font-mono text-[8px] leading-none shrink-0" style={{ backgroundColor: fgColor, color: bgColor }}>
                               {formatPriceWithPrefix(item.price)}
                             </span>
                           )}
                         </div>
                       )}

                       {/* Sizing Layout */}
                       <div className="w-full flex flex-col gap-1 items-left text-left">
                          <p className="text-[12px] font-black tracking-tight text-foreground truncate">{item.name.toUpperCase()}</p>
                          <p className="text-[9px] text-muted-foreground font-mono truncate">{item.content}</p>
                       </div>

                       {/* QR Visualizing Element Box */}
                       <div className={`flex items-center justify-center relative select-none w-full transition-all duration-300 ${
                         frameStyle && frameStyle !== "none" 
                           ? "aspect-[340/420] p-0 bg-transparent border-none shadow-none" 
                           : "aspect-square p-3 bg-white dark:bg-zinc-900/50 rounded-2xl shadow-inner border border-border/10"
                       }`}>
                          <AdvancedQRPreview 
                            value={item.content}
                            size={160}
                            fgColor={fgColor}
                            bgColor="transparent"
                            fgColor2={fgColor2}
                            useGradient={useGradient}
                            gradientType={gradientType}
                            gradientRotation={gradientRotation}
                            dotsStyle={dotsStyle}
                            cornersSquareStyle={cornersSquareStyle}
                            cornersDotStyle={cornersDotStyle}
                            logo={logoUrl}
                            logoSize={logoSize}
                            margin={0}
                            level={level}
                            className="w-full h-full object-contain"

                            // Elite Custom parameters
                            drawType={drawType}
                            shape={shape}
                            backgroundRound={backgroundRound}
                            dotsRoundSize={dotsRoundSize}
                            bgUseGradient={bgUseGradient}
                            bgColor2={bgColor2}
                            bgGradientType={bgGradientType}
                            bgGradientRotation={bgGradientRotation}
                            cornersSquareColor={cornersSquareColor}
                            cornersSquareUseGradient={cornersSquareUseGradient}
                            cornersSquareColor2={cornersSquareColor2}
                            cornersSquareGradientRotation={cornersSquareGradientRotation}
                            cornersDotColor={cornersDotColor}
                            cornersDotUseGradient={cornersDotUseGradient}
                            cornersDotColor2={cornersDotColor2}
                            cornersDotGradientRotation={cornersDotGradientRotation}
                            logoMargin={logoMargin}
                            hideBackgroundDots={hideBackgroundDots}

                            // Premium Custom Frames
                            frameStyle={frameStyle}
                            frameText={frameText}
                            frameColor={frameColor}
                          />
                       </div>

                       {/* Size and Categories row */}
                       {(item.size || item.category) && (
                          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-tight font-mono opacity-85 py-1 border-t border-dashed" style={{ borderColor: `${fgColor}22`, color: fgColor }}>
                            <span className="truncate max-w-[48%]">{item.size ? `SIZE: ${item.size}` : ""}</span>
                            <span className="truncate max-w-[48%] text-right">{item.category ? `CAT: ${item.category}` : ""}</span>
                          </div>
                       )}

                       {/* Individual action bar menu details */}
                       <div className="flex items-center gap-1 mt-1 justify-end">
                         <Button 
                           variant="outline" size="icon" 
                           onClick={() => {
                             setEditingIdx(originalIdx);
                             setEditContent(item.content);
                             setEditName(item.name);
                             setEditPrice(item.price || "");
                             setEditBrand(item.brand || "");
                             setEditSize(item.size || "");
                             setEditCategory(item.category || "");
                           }}
                           className="w-8 h-8 rounded-lg border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                         >
                           <Edit className="w-3.5 h-3.5" />
                         </Button>
                         <Button 
                           variant="outline" size="icon"
                           onClick={() => handleCopySingleItemCode(item.content)}
                           className="w-8 h-8 rounded-lg border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                         >
                           <Copy className="w-3.5 h-3.5" />
                         </Button>
                         <Button 
                           variant="outline" size="icon"
                           onClick={() => handleCloneItemAndPush(item)}
                           className="w-8 h-8 rounded-lg border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                         >
                           <Plus className="w-3.5 h-3.5" />
                         </Button>
                         <Button 
                           variant="outline" size="icon"
                           onClick={() => handleDownloadSingleItem(originalIdx)}
                           className="w-8 h-8 rounded-lg border-border/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                         >
                           <Download className="w-3.5 h-3.5" />
                         </Button>
                         <Button 
                           variant="outline" size="icon"
                           onClick={() => {
                              setItems(items.filter((_, i) => i !== originalIdx));
                              toast.info("Removed target item.");
                           }}
                           className="w-8 h-8 rounded-lg border-red-200 dark:border-red-950/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
                         >
                           <Trash className="w-3.5 h-3.5" />
                         </Button>
                       </div>
                     </div>
                  );
              })}
          </div>

          {/* Simple Pagination Control layout matching look */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-muted/25 rounded-2xl border border-border/40 font-mono text-xs">
              <Button 
                variant="outline" size="sm" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="rounded-xl h-8 px-3 text-[10px] uppercase font-black"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
                <span>Page</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-black">{currentPage}</span>
                <span>of</span>
                <span className="font-extrabold text-foreground">{totalPages}</span>
              </div>
              <Button 
                variant="outline" size="sm" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="rounded-xl h-8 px-3 text-[10px] uppercase font-black"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Hidden DOM Compilation frame container to fetch full resolution raw SVGs for ZIP packaging loops */}
      <div className="sr-only opacity-0 pointer-events-none fixed -top-[9999px] -left-[9999px]">
         {items.map((item, idx) => (
           <div key={`hidden-qr-${idx}`} id={`bulk-qr-raw-${idx}`}>
              <AdvancedQRPreview 
                value={item.content}
                size={300}
                fgColor={fgColor}
                bgColor="#ffffff"
                fgColor2={fgColor2}
                useGradient={useGradient}
                gradientType={gradientType}
                gradientRotation={gradientRotation}
                dotsStyle={dotsStyle}
                cornersSquareStyle={cornersSquareStyle}
                cornersDotStyle={cornersDotStyle}
                logo={logoUrl}
                logoSize={logoSize}
                margin={includeMargin ? marginSize : 0}
                level={level}
                drawType="svg"
                shape={shape}
                backgroundRound={backgroundRound}
                dotsRoundSize={dotsRoundSize}
                bgUseGradient={bgUseGradient}
                bgColor2={bgColor2}
                bgGradientType={bgGradientType}
                bgGradientRotation={bgGradientRotation}
                cornersSquareColor={cornersSquareColor}
                cornersSquareUseGradient={cornersSquareUseGradient}
                cornersSquareColor2={cornersSquareColor2}
                cornersSquareGradientRotation={cornersSquareGradientRotation}
                cornersDotColor={cornersDotColor}
                cornersDotUseGradient={cornersDotUseGradient}
                cornersDotColor2={cornersDotColor2}
                cornersDotGradientRotation={cornersDotGradientRotation}
                logoMargin={logoMargin}
                hideBackgroundDots={hideBackgroundDots}

                // Premium Custom Frames
                frameStyle={frameStyle}
                frameText={frameText}
                frameColor={frameColor}
              />
           </div>
         ))}
      </div>

      {/* Inline item editing dynamic dialog overlay */}
      <AnimatePresence>
        {editingIdx !== null && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <Card className="p-8 w-full max-w-md rounded-3xl bg-card shadow-2xl space-y-5 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <span className="text-xs font-black uppercase tracking-widest text-[#006241]">Edit Queue Item Properties</span>
                <button onClick={() => setEditingIdx(null)} className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold uppercase transition-all">✕</button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Sticker Filename Label</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10 text-xs font-semibold rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">QR Value / Redirect Link</Label>
                  <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} className="h-10 text-xs font-mono font-bold rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Price Tag</Label>
                    <Input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="e.g. 19.99" className="h-10 text-xs font-semibold rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Brand Name</Label>
                    <Input value={editBrand} onChange={(e) => setEditBrand(e.target.value)} placeholder="e.g. Acme corp" className="h-10 text-xs font-semibold rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Size Attribute</Label>
                    <Input value={editSize} onChange={(e) => setEditSize(e.target.value)} placeholder="e.g. Medium" className="h-10 text-xs font-semibold rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Category Typology</Label>
                    <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="e.g. APPAREL" className="h-10 text-xs font-semibold rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 justify-end border-t border-border/40">
                <Button variant="ghost" onClick={() => setEditingIdx(null)} className="rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Cancel</Button>
                <Button onClick={() => handleEditItemSave(editingIdx)} className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white leading-none border-b-2 border-b-emerald-950">Save Changes</Button>
              </div>
            </Card>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Print Spooler Setup Modal Dialog drawer */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/45 dark:bg-slate-950/70 backdrop-blur-sm animate-fade-in cursor-default">
          <Card className="p-8 w-full max-w-xl rounded-[2.5rem] bg-card border-none shadow-premium space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-border/45 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                  <Printer className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Industrial print labeller</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold text-left">Configure sheet boundaries and columns properties</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-black uppercase cursor-pointer flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Grid Columns</Label>
                <select
                  value={printCols}
                  onChange={(e) => setPrintCols(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-muted/45 border-slate-200 dark:border-slate-800 border rounded-xl text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value={1}>1 Label (Single Column)</option>
                  <option value={2}>2 Labels (Double Columns)</option>
                  <option value={3}>3 Labels (Compact Sheet)</option>
                  <option value={4}>4 Labels (High Density Layout)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Gap spacing</Label>
                <select
                  value={printGap}
                  onChange={(e) => setPrintGap(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-muted/45 border-slate-200 dark:border-slate-800 border rounded-xl text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value={8}>8px - Condensed rows</option>
                  <option value={12}>12px - Balanced sticker spacing</option>
                  <option value={16}>16px - Wide page margin gaps</option>
                  <option value={24}>24px - Double margin separations</option>
                </select>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Select Tag elements to render</Label>
              <div className="grid grid-cols-2 gap-3.5">
                <button 
                  onClick={() => setPrintIncludeBrand(!printIncludeBrand)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold select-none cursor-pointer transition-all ${
                    printIncludeBrand ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-400" : "border-border bg-transparent opacity-60"
                  }`}
                >
                  <span>Include Brand name</span>
                  <span className="text-lg leading-none">{printIncludeBrand ? "●" : "○"}</span>
                </button>

                <button 
                  onClick={() => setPrintIncludePrice(!printIncludePrice)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold select-none cursor-pointer transition-all ${
                    printIncludePrice ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-400" : "border-border bg-transparent opacity-60"
                  }`}
                >
                  <span>Include Price labels</span>
                  <span className="text-lg leading-none">{printIncludePrice ? "●" : "○"}</span>
                </button>

                {printIncludePrice && (
                  <div className="col-span-2 p-3 bg-muted/40 rounded-xl space-y-2 border border-border/60">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block text-left">
                      Price Format Prefix / Currency Label
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={["$", "€", "£", "¥", "₹", "AED", "₪", ""].includes(priceCurrencyPrefix) ? priceCurrencyPrefix : "custom"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setPriceCurrencyPrefix("Custom ");
                          } else {
                            setPriceCurrencyPrefix(val);
                          }
                        }}
                        className="flex-1 text-xs font-bold px-2.5 py-2 rounded-xl border bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">No Prefix (Plain numbers)</option>
                        <option value="$">US Dollar ($)</option>
                        <option value="€">Euro (€)</option>
                        <option value="£">British Pound (£)</option>
                        <option value="¥">Yen / Yuan (¥)</option>
                        <option value="₹">Indian Rupee (₹)</option>
                        <option value="₪">Israeli Shekel (₪)</option>
                        <option value="AED">UAE Dirham (AED)</option>
                        <option value="custom">Custom text prefix...</option>
                      </select>
                      
                      {!["$", "€", "£", "¥", "₹", "AED", "₪", ""].includes(priceCurrencyPrefix) && (
                        <input
                          type="text"
                          value={priceCurrencyPrefix}
                          onChange={(e) => setPriceCurrencyPrefix(e.target.value)}
                          placeholder="e.g. CAD$ "
                          className="w-1/2 text-xs font-semibold px-2.5 py-2 rounded-xl border bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      )}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setPrintIncludeName(!printIncludeName)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold select-none cursor-pointer transition-all ${
                    printIncludeName ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-400" : "border-border bg-transparent opacity-60"
                  }`}
                >
                  <span>Include Product title labels</span>
                  <span className="text-lg leading-none">{printIncludeName ? "●" : "○"}</span>
                </button>

                <button 
                  onClick={() => setPrintIncludeDetails(!printIncludeDetails)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold select-none cursor-pointer transition-all ${
                    printIncludeDetails ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-400" : "border-border bg-transparent opacity-60"
                  }`}
                >
                  <span>Include Sizing & Dept details</span>
                  <span className="text-lg leading-none">{printIncludeDetails ? "●" : "○"}</span>
                </button>

                <button 
                  onClick={() => setPrintColorOn(!printColorOn)}
                  className={`col-span-2 p-3 rounded-xl border flex items-center justify-between text-xs font-bold select-none cursor-pointer transition-all text-left ${
                    printColorOn ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-400 font-extrabold" : "border-border bg-transparent opacity-60"
                  }`}
                >
                  <div>
                    <span className="block">Enable Theme Skins & background colors in prints</span>
                    <span className="block text-[8.5px] font-normal text-muted-foreground mt-0.5">Disabling saves printing cartridge inks by enforcing clean black/white cards style</span>
                  </div>
                  <span className="text-lg leading-none">{printColorOn ? "●" : "○"}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/40 justify-end">
              <Button 
                variant="ghost" 
                onClick={() => setIsPrintModalOpen(false)}
                className="rounded-xl font-bold uppercase tracking-wider text-xs"
              >
                Discard Setup
              </Button>
              <Button 
                onClick={handlePrintInNewTab}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 font-black uppercase tracking-wider text-xs px-6 py-2.5 shadow-sm text-white hover:text-white cursor-pointer"
              >
                Launch Printer spooler
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Congratulations celebration modal */}
      <AnimatePresence>
        {showCongrats && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-md w-full bg-card rounded-[3rem] p-10 shadow-2xl border border-border/50 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-primary" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-center flex-col items-center gap-4">
                  <motion.div
                    initial={{ rotate: -20, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <Logo className="w-20 h-20 drop-shadow-xl" />
                  </motion.div>
                  
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase text-foreground">Success!</h2>
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </motion.div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">Your QR code labels were successfully exported</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 rounded-3xl border border-dashed border-border/60">
                   <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                     Your high-fidelity compound QR stickers has been compiled and packaged into a premium ZIP archive, integrated with your customized design elements, and compiled successfully.
                   </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={() => navigate("/value-our-tools")}
                    className="h-14 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border-b-[6px] border-primary/40 hover:border-b-[4px] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2 group shadow-lg"
                  >
                    <Star className="w-4 h-4 fill-current group-hover:animate-spin-slow" />
                    Value our Tools
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowCongrats(false)}
                    className="h-12 rounded-xl font-extrabold uppercase tracking-widest text-xs opacity-70 hover:opacity-100 transition-opacity"
                  >
                    Return back to tool
                  </Button>
                </div>
              </div>

              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary/20 pointer-events-none"
                  animate={{
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * -100 - 50],
                    opacity: [0, 0.5, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    bottom: '20%'
                  }}
                />
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
