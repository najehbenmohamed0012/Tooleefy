import React, { useState, useRef } from "react";
import Barcode from "react-barcode";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, Plus, Trash2, FileUp, 
  Settings2, CheckCircle2, Archive, 
  Hash, Layers, Sparkles, Copy, Check, FileSpreadsheet, Search, Edit3, Eye,
  ChevronLeft, ChevronRight, Palette, Printer, RefreshCw, Star, Trophy
} from "lucide-react";
import { BarcodeStyleSettings } from "./BarcodeStyleSettings";
import { toast } from "sonner";
import Papa from "papaparse";
import JSZip from "jszip";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { logActivity } from "@/supabase/db";
import { motion, AnimatePresence } from "motion/react";

const barcodeFormats = [
  { value: "CODE128", label: "CODE 128" },
  { value: "CODE128A", label: "CODE 128 A" },
  { value: "CODE128B", label: "CODE 128 B" },
  { value: "CODE128C", label: "CODE 128 C" },
  { value: "EAN13", label: "EAN-13" },
  { value: "EAN8", label: "EAN-8" },
  { value: "UPC", label: "UPC" },
  { value: "CODE39", label: "CODE 39" },
  { value: "ITF14", label: "ITF-14" },
  { value: "ITF", label: "ITF" },
  { value: "MSI", label: "MSI" },
  { value: "MSI10", label: "MSI 10" },
  { value: "MSI11", label: "MSI 11" },
  { value: "MSI1010", label: "MSI 1010" },
  { value: "MSI1110", label: "MSI 1110" },
  { value: "pharmacode", label: "Pharmacode" },
  { value: "codabar", label: "Codabar" }
];

const BARCODE_THEMES = [
  {
    id: "classic",
    name: "Classic Slate",
    desc: "Clean light corporate label look",
    bg: "#ffffff",
    line: "#0f172a", // slate-900
    font: "monospace",
    borderClass: "border border-slate-200/80 rounded-2xl",
    badgeClass: "bg-slate-900 text-slate-100",
    textMutedClass: "text-slate-500 font-mono",
    accent: "#0f172a",
    shadow: "shadow-sm",
    pillOutline: "border border-slate-300",
    nameFont: "font-sans font-bold text-slate-900",
  },
  {
    id: "vintage",
    name: "Vintage Kraft",
    desc: "Warm artisanal beige and espresso brown",
    bg: "#FAF6E8",
    line: "#4A3B32", // deep espresso warm brown
    font: "serif",
    borderClass: "border-2 border-[#D9CDB8] rounded-xl",
    badgeClass: "bg-[#4A3B32] text-[#FAF6E8]",
    textMutedClass: "text-[#705D51] font-serif",
    accent: "#4A3B32",
    shadow: "shadow-[2px_2px_4px_rgba(74,59,50,0.08)]",
    pillOutline: "border border-[#D1C3AD]",
    nameFont: "font-serif font-black text-[#2B1F17] tracking-tight",
  },
  {
    id: "cyberpunk",
    name: "Cyber Neon",
    desc: "Chroma glow with deep terminal high-tech style",
    bg: "#090D16",
    line: "#00FFC2", // electric neon teal
    font: "monospace",
    borderClass: "border-2 border-[#00FFC2]/30 rounded-xl shadow-[0_0_15px_rgba(0,255,194,0.15)]",
    badgeClass: "bg-[#00FFC2] text-[#090D16] font-extrabold",
    textMutedClass: "text-[#00FFC2]/70 font-mono",
    accent: "#00FFC2",
    shadow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
    pillOutline: "border border-[#00FFC2]/50 bg-[#00FFC2]/5",
    nameFont: "font-mono font-black text-slate-200 uppercase tracking-widest text-[10px]",
  },
  {
    id: "industrial",
    name: "Industrial Metal",
    desc: "Heavy industrial steel plate black-on-dark",
    bg: "#101318",
    line: "#F3F4F6", // bright silver
    font: "monospace",
    borderClass: "border border-slate-700/60 rounded-xl",
    badgeClass: "bg-orange-600 text-white font-black",
    textMutedClass: "text-slate-400 font-mono text-[9px]",
    accent: "#EA580C", // orange-600 focus
    shadow: "shadow-md",
    pillOutline: "border border-slate-700 bg-slate-800",
    nameFont: "font-sans font-black text-slate-100 uppercase tracking-wider",
  },
  {
    id: "emerald",
    name: "Forest Organic",
    desc: "Eco-friendly mint with luxury deep pine green",
    bg: "#F1F5F2",
    line: "#0F4A32", // deep pine forest green
    font: "sans-serif",
    borderClass: "border border-[#C2D6CC] rounded-2xl",
    badgeClass: "bg-[#0F4A32] text-white",
    textMutedClass: "text-[#3D6E57]",
    accent: "#0F4A32",
    shadow: "shadow-sm",
    pillOutline: "border border-[#B2C7BC]",
    nameFont: "font-sans font-extrabold text-[#0D3625] tracking-tight",
  },
  {
    id: "warning",
    name: "Caution Hazard",
    desc: "High visibility yellow & black warning tags",
    bg: "#FACC15", // bright yellow
    line: "#000000", // black
    font: "sans-serif",
    borderClass: "border-3 border-black rounded-lg",
    badgeClass: "bg-black text-[#FACC15] font-black",
    textMutedClass: "text-black/80 font-bold",
    accent: "#000000",
    shadow: "shadow-sm",
    pillOutline: "border-2 border-black bg-white/20",
    nameFont: "font-sans font-black text-black uppercase tracking-normal",
  }
];

export interface BarcodeItem {
  content: string;
  name: string;
  price?: string;
  brand?: string;
  size?: string;
  category?: string;
}

export function BulkBarcodeGenerator() {
  const [bulkInput, setBulkInput] = useState("");
  const [items, setItems] = useState<BarcodeItem[]>([]);
  const [namingTemplate, setNamingTemplate] = useState("barcode-{n}");
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme presets
  const [selectedThemeId, setSelectedThemeId] = useState("classic");

  // Styling States (Sync with settings)
  const [format, setFormat] = useState("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [font, setFont] = useState("monospace");
  const [fontSize, setFontSize] = useState(20);
  const [textAlign, setTextAlign] = useState("center");
  const [textPosition, setTextPosition] = useState("bottom");
  const [textMargin, setTextMargin] = useState(2);
  const [background, setBackground] = useState("#ffffff");
  const [lineColor, setLineColor] = useState("#000000");
  const [margin, setMargin] = useState(10);
  const [fontOptions, setFontOptions] = useState("");
  const [flat, setFlat] = useState(false);
  const [useTextOverride, setUseTextOverride] = useState(false);
  const [textOverride, setTextOverride] = useState("");
  const [useCustomMargins, setUseCustomMargins] = useState(false);
  const [marginTop, setMarginTop] = useState(10);
  const [marginBottom, setMarginBottom] = useState(10);
  const [marginLeft, setMarginLeft] = useState(10);
  const [marginRight, setMarginRight] = useState(10);

  // Advanced styling state variables
  const [useLabelHeader, setUseLabelHeader] = useState(false);
  const [labelTextHeader, setLabelTextHeader] = useState("TOOLEEFY INDUSTRIAL");
  const [headerFontSize, setHeaderFontSize] = useState(14);
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderWidth, setBorderWidth] = useState(3);
  const [borderRadius, setBorderRadius] = useState("soft");
  const [exportScale, setExportScale] = useState(2);

  // Sequential code generator
  const [seqPrefix, setSeqPrefix] = useState("SKU-");
  const [seqStart, setSeqStart] = useState(1001);
  const [seqCount, setSeqCount] = useState(25);
  const [seqSuffix, setSeqSuffix] = useState("");
  const [seqPad, setSeqPad] = useState(5);
  const [seqStep, setSeqStep] = useState(1);
  const [showSeqGenerator, setShowSeqGenerator] = useState(false);

  // Multi-column mapping states & detection
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvDataRows, setCsvDataRows] = useState<any[]>([]);
  const [barcodeMappingCol, setBarcodeMappingCol] = useState("");
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

  // Print Dialog states
  const navigate = useNavigate();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
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

  const handleSyncBulkMetadata = (field: "price" | "size" | "category" | "brand", value: string) => {
    if (items.length === 0) {
      toast.error("Active queue is empty. Generate or upload barcodes first!");
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
    toast.success(`Successfully broadcasted universal ${field} "${value.trim()}" across all ${items.length} items!`);
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
    toast.success(`Broadcasting naming template: identifier naming refreshed across all ${items.length} queue items.`);
  };

  const handleApplyBrandingHeaderToBrands = () => {
    if (items.length === 0) {
      toast.error("Active queue is empty.");
      return;
    }
    if (!useLabelHeader) {
      toast.error("Label Header title printing is currently disabled. Toggle it on under Advanced Label & Export first.");
      return;
    }
    const updated = items.map(item => ({
      ...item,
      brand: labelTextHeader
    }));
    setItems(updated);
    toast.success(`Synchronized global brand title "${labelTextHeader}" to all ${items.length} barcode items.`);
  };

  const formatPriceWithPrefix = (price: string) => {
    if (!price) return "";
    const trimmed = price.trim();
    if (!priceCurrencyPrefix) return trimmed;
    
    // If the price already starts with the select/custom prefix, don't double prepend.
    if (trimmed.startsWith(priceCurrencyPrefix)) {
      return trimmed;
    }
    
    // Clean up existing currency prefixes if they are common and different
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

  const [previewLimit, setPreviewLimit] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

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

  // Helper to select a theme preset and set associated styling parameters automatically
  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    const theme = BARCODE_THEMES.find(t => t.id === themeId);
    if (theme) {
      setBackground(theme.bg);
      setLineColor(theme.line);
      setFont(theme.font);
      if (theme.id !== "classic") {
        setBorderEnabled(true);
        setBorderWidth(theme.id === "warning" ? 3 : 2);
        setBorderRadius(theme.id === "warning" ? "none" : "soft");
      } else {
        setBorderEnabled(false);
      }
      toast.success(`Applied ${theme.name} layout theme!`);
    }
  };

  const processText = () => {
    const lines = bulkInput.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      toast.error("Enter some data first");
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
    toast.success(`Queue updated: ${newItems.length} items. All custom details & attributes preserved.`);
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
    toast.success(`${seqCount} sequence codes appended to feed! Click 'Sync Queue' to compile.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            const codeCol = matchCol(["barcode", "sku", "code", "serial", "upc", "ean", "id"]) || columns[0] || "";
            const nameCol = matchCol(["product", "title", "name", "label", "item", "description"]);
            const priceCol = matchCol(["price", "cost", "msrp", "usd", "amount"]);
            const brandCol = matchCol(["brand", "company", "mfg", "vendor", "manufacturer"]);
            const sizeCol = matchCol(["size", "dimension", "weight", "pkg"]);
            const catCol = matchCol(["category", "dept", "department", "type", "class"]);

            setBarcodeMappingCol(codeCol);
            setNameMappingCol(nameCol);
            setPriceMappingCol(priceCol);
            setBrandMappingCol(brandCol);
            setSizeMappingCol(sizeCol);
            setCategoryMappingCol(catCol);
            toast.info("CSV dataset analyzed! Smart auto-mapped columns are selected below.");
          } else {
            toast.error("CSV file is empty.");
          }
        },
        error: () => {
          toast.error("Error parsing CSV file");
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBulkInput(e.target?.result as string);
        toast.success("Text File Imported");
      };
      reader.readAsText(file);
    }
  };

  const applyCsvMapping = () => {
    if (!barcodeMappingCol) {
      toast.error("Please select barcode code column.");
      return;
    }
    const inputLinesObj = csvDataRows.map((row, idx) => {
      const codeValue = row[barcodeMappingCol]?.toString().trim() || "";
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
    toast.success(`Mapped & Sync'd queue with ${newItems.length} custom-structured barcode items!`);
    
    // reset Mapping
    setCsvColumns([]);
    setCsvDataRows([]);
  };

  const buildPerfectCompoundSVG = (
    item: BarcodeItem, 
    index: number, 
    svgElement: SVGSVGElement | null,
    overrideBg?: string,
    overrideLine?: string
  ) => {
    if (!svgElement) return "";

    let svgData = new XMLSerializer().serializeToString(svgElement);
    // Remove XML declarations and redundant namespaces
    svgData = svgData.replace(/<\?xml.*?\?>/g, "").replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "");

    const fontFam = font === "monospace" ? "monospace" : font === "sans-serif" ? "sans-serif" : "serif";
    const rx = borderRadius === "none" ? 0 : borderRadius === "soft" ? 12 : 20;

    // Use active background and lines, supporting optional overrides for the print engine
    const currentBg = overrideBg || background;
    const currentLine = overrideLine || lineColor;

    // Standard outer high-density tag size (320px width x 220px height)
    const width = 320;
    const height = 220;

    const brandText = (item.brand || (useLabelHeader ? labelTextHeader : "") || "").trim().toUpperCase();
    const rawPrice = (item.price || "").trim();
    const priceText = rawPrice ? formatPriceWithPrefix(rawPrice) : "";
    const nameText = (item.name || `ITEM #${index + 1}`).trim();

    // Text truncation
    const truncate = (st: string, max: number) => st.length > max ? st.slice(0, max - 3) + "..." : st;

    // Measure dimensions and dynamically scale the inner barcode content so that it fits nicely inside the tag boundaries
    const innerWidthAttr = svgElement.getAttribute("width");
    const innerHeightAttr = svgElement.getAttribute("height");
    const barcodeWidth = innerWidthAttr ? parseFloat(innerWidthAttr) : 290;
    const barcodeHeight = innerHeightAttr ? parseFloat(innerHeightAttr) : 100;

    const maxAvailableWidth = 280;
    const maxAvailableHeight = 112;

    const scaleX = maxAvailableWidth / barcodeWidth;
    const scaleY = maxAvailableHeight / barcodeHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    const scaledWidth = barcodeWidth * scale;
    const scaledHeight = barcodeHeight * scale;
    const offsetX = (320 - scaledWidth) / 2;
    const offsetY = 68 + (112 - scaledHeight) / 2;

    // Safely extract the inside primitives of the generated barcode SVG (stripping out outer tag)
    const openTagIndex = svgData.indexOf(">");
    const closeTagIndex = svgData.lastIndexOf("</svg>");
    const svgContent = (openTagIndex !== -1 && closeTagIndex !== -1)
      ? svgData.substring(openTagIndex + 1, closeTagIndex)
      : svgData;

    // A robust regex that matches any background rect tag with fill or style as transparent or none, or covering the canvas with width/height="100%"
    const cleanSvgContent = svgContent.replace(/<rect[^>]*(?:width=["']100%["']|height=["']100%["']|fill=["'](?:transparent|none)["']|style=["'][^"']*fill:\s*(?:transparent|none)[^"']*["'])[^>]*?(?:\/>|><\/rect>)/gi, "");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .lbl-title { font-family: ${fontFam}, sans-serif; font-size: 13px; font-weight: 900; fill: ${currentLine}; }
    .lbl-brand { font-family: ${fontFam}, sans-serif; font-size: ${headerFontSize}px; font-weight: 900; fill: ${currentLine}; opacity: 0.85; letter-spacing: 0.05em; }
    .lbl-meta { font-family: ${fontFam}, monospace; font-size: 9px; font-weight: 700; fill: ${currentLine}; opacity: 0.7; }
    .lbl-price-badge { font-family: ${fontFam}, monospace; font-size: 10px; font-weight: 900; fill: ${currentBg}; }
    .barcode-nested rect:not([fill="transparent"]):not([fill="none"]):not([style*="fill: transparent"]):not([style*="fill: none"]):not([style*="fill:transparent"]):not([style*="fill:none"]),
    .barcode-nested path, 
    .barcode-nested text { fill: ${currentLine} !important; }
    .barcode-nested line { stroke: ${currentLine} !important; }
  </style>
  
  <!-- Sticker Card Background with perfect inset to prevent border clipping -->
  <rect x="${borderEnabled ? borderWidth / 2 : 0.5}" y="${borderEnabled ? borderWidth / 2 : 0.5}" width="${width - (borderEnabled ? borderWidth : 1)}" height="${height - (borderEnabled ? borderWidth : 1)}" rx="${rx}" fill="${currentBg}" stroke="${currentLine}" stroke-width="${borderEnabled ? borderWidth : 1}" stroke-opacity="${borderEnabled ? 1 : 0.15}" />
  
  <!-- Header Row (Brand & Price) -->
  ${(useLabelHeader || item.brand || priceText) ? `<text x="20" y="32" class="lbl-brand">${truncate(brandText || "PRODUCT LABEL", 26)}</text>` : ""}
  
  ${priceText ? `
    <rect x="${300 - (priceText.length * 6 + 14)}" y="18" width="${priceText.length * 6 + 14}" height="20" rx="5" fill="${currentLine}" />
    <text x="${300 - (priceText.length * 6 + 14) / 2}" y="32" text-anchor="middle" class="lbl-price-badge">${priceText}</text>
  ` : ""}
  
  <!-- Divider -->
  ${((useLabelHeader || item.brand) || priceText) ? `
    <line x1="20" y1="44" x2="300" y2="44" stroke="${currentLine}" stroke-width="1" stroke-dasharray="1 3" stroke-opacity="0.3" />
  ` : ""}
  
  <!-- Product Name Title -->
  <text x="20" y="62" class="lbl-title">${truncate(nameText.toUpperCase(), 25)}</text>
  
  <!-- Inside translated barcode -->
  <g class="barcode-nested">
    <svg x="${offsetX}" y="${offsetY}" width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${barcodeWidth} ${barcodeHeight}">
      ${cleanSvgContent}
    </svg>
  </g>
  
  <!-- Dynamic bottom details -->
  ${(item.size || item.category) ? `
    <line x1="20" y1="184" x2="300" y2="184" stroke="${currentLine}" stroke-width="1" stroke-dasharray="1 3" stroke-opacity="0.3" />
    <text x="20" y="200" class="lbl-meta">${item.size ? `SIZE: ${truncate(item.size.toUpperCase(), 16)}` : ""}</text>
    <text x="300" y="200" text-anchor="end" class="lbl-meta">${item.category ? `CAT: ${truncate(item.category.toUpperCase(), 16)}` : ""}</text>
  ` : ""}
</svg>`;
  };

  const executeBulkSVGExport = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const zip = new JSZip();
    const folder = zip.folder("barcodes");

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const svgElement = document.querySelector(`#bulk-barcode-${i}`) as SVGSVGElement;
        if (svgElement) {
            const svgData = buildPerfectCompoundSVG(item, i, svgElement);
            if (!svgData) continue;

            // svg saved to package
            folder?.file(`${item.name}.svg`, svgData);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "industrial-barcodes-svg.zip";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success(`Successfully packaged & downloaded ${items.length} SVG Vector barcodes!`);
      setShowCongrats(true);
      logActivity({
        tool_type: 'barcode',
        name: `Bulk Barcode Pack (${items.length} codes)`,
        status: 'Bulk Export (SVG)'
      });
    } catch {
      toast.error("Error packing bulk SVG packages.");
    } finally {
      setProcessing(false);
    }
  };

  const executeBulkPNGExport = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const zip = new JSZip();
    const folder = zip.folder("barcodes");

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const svgElement = document.querySelector(`#bulk-barcode-${i}`) as SVGSVGElement;
        if (svgElement) {
            const svgData = buildPerfectCompoundSVG(item, i, svgElement);
            if (!svgData) continue;
            
            // PNG Conversion using dynamic quality scaling
            const canvas = document.createElement("canvas");
            const img = new Image();
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);
            
            await new Promise<void>((resolve) => {
               img.onload = () => {
                 const scale = exportScale;
                 canvas.width = 320 * scale;
                 canvas.height = 220 * scale;
                 const ctx = canvas.getContext("2d");
                 if (ctx) {
                    ctx.fillStyle = background;
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

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "industrial-barcodes-png.zip";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success(`Successfully packaged & downloaded ${items.length} PNG Image barcodes!`);
      setShowCongrats(true);
      logActivity({
        tool_type: 'barcode',
        name: `Bulk Barcode Pack (${items.length} codes)`,
        status: 'Bulk Export (PNG)'
      });
    } catch {
      toast.error("Error packing bulk PNG packages.");
    } finally {
      setProcessing(false);
    }
  };

  const handleEditItem = (index: number, newContent: string, newName: string, price?: string, brand?: string, size?: string, category?: string) => {
    const next = [...items];
    next[index] = { content: newContent, name: newName, price, brand, size, category };
    setItems(next);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
    toast.success("Item removed from queue.");
  };

  const handleDownloadSingleItem = (index: number) => {
    const svgElement = document.querySelector(`#bulk-barcode-${index}`) as SVGSVGElement;
    if (!svgElement) return;

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
    toast.success(`Exported vector ${items[index].name}.svg`);
  };

  const handleResetAll = () => {
    setBulkInput("");
    setItems([]);
    setCsvColumns([]);
    setCsvDataRows([]);
    setBarcodeMappingCol("");
    setNameMappingCol("");
    setPriceMappingCol("");
    setBrandMappingCol("");
    setSizeMappingCol("");
    setCategoryMappingCol("");
    setSearchQuery("");
    
    // Style settings defaults reset
    setSelectedThemeId("classic");
    setFormat("CODE128");
    setWidth(2);
    setHeight(100);
    setDisplayValue(true);
    setFont("monospace");
    setFontSize(20);
    setBackground("#ffffff");
    setLineColor("#000000");
    setMargin(10);
    setUseLabelHeader(false);
    setBorderEnabled(false);
    
    // Reset file input reference so the same file can be reselected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Successfully reset uploaded dataset and restored all configuration changes.");
  };

  const handlePrintInNewTab = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup window was blocked by the browser! Please enable popups to allow print viewing.");
      return;
    }

    const itemsHtml = items.map((item, idx) => {
      const svgElement = document.querySelector(`#bulk-barcode-${idx}`) as SVGSVGElement;
      if (!svgElement) return "";

      const prBg = printColorOn ? background : "#ffffff";
      const prLine = printColorOn ? lineColor : "#000000";

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
        <title>Print Barcode Labels (${items.length} items)</title>
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
          <span style="font-size:11px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.05em;">Print Dashboard</span>
          <button class="btn btn-primary" onclick="window.print()">Trigger Print</button>
          <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card overflow-hidden h-full flex flex-col">
            <div className="space-y-6 flex-grow flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border/40 pb-4 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight uppercase">Bulk Feed Base</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSeqGenerator(!showSeqGenerator)} 
                      className={`h-8 rounded-lg text-[10px] uppercase font-black transition-all ${showSeqGenerator ? "bg-primary/20 text-primary border-primary" : "hover:bg-primary/10"}`}
                    >
                        <Sparkles className="w-3 h-3 mr-2" /> Sequence Generator
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 rounded-lg text-[10px] uppercase font-black hover:bg-primary/10">
                        <FileUp className="w-3 h-3 mr-2" /> Upload Data
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleResetAll} 
                      className="h-8 rounded-lg text-[10px] uppercase font-black text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-extrabold"
                      title="Clear uploaded file datasets and configuration changes"
                    >
                        <Trash2 className="w-3 h-3 mr-2" /> Reset Everything
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.txt" className="hidden" />
                </div>
              </div>

              {/* Sequence Generator Dialog/Card */}
              {showSeqGenerator && (
                <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-4 animate-fade-in animate-once">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">Sequence Serial Generator</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Generate automatically-incrementing sequence bar codes (e.g. asset tags, serial sheets) to inject into your feedstock.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Prefix Label</Label>
                      <Input value={seqPrefix} onChange={(e) => setSeqPrefix(e.target.value)} placeholder="e.g. SKU-" className="h-9 text-xs bg-white rounded-xl font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Starting Int</Label>
                      <Input type="number" value={seqStart} onChange={(e) => setSeqStart(Number(e.target.value))} className="h-9 text-xs bg-white rounded-xl font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Increment</Label>
                      <Input type="number" value={seqStep} onChange={(e) => setSeqStep(Number(e.target.value))} className="h-9 text-xs bg-white rounded-xl font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Zero Padding</Label>
                      <Input type="number" min="0" max="10" value={seqPad} onChange={(e) => setSeqPad(Number(e.target.value))} className="h-9 text-xs bg-white rounded-xl font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Suffix Label</Label>
                      <Input value={seqSuffix} onChange={(e) => setSeqSuffix(e.target.value)} placeholder="e.g. -US" className="h-9 text-xs bg-white rounded-xl font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Total Count</Label>
                      <Input type="number" min="1" max="1000" value={seqCount} onChange={(e) => setSeqCount(Number(e.target.value))} className="h-9 text-xs bg-white rounded-xl font-mono" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" variant="ghost" onClick={() => setShowSeqGenerator(false)} className="rounded-xl text-[10px] uppercase font-black">Cancel</Button>
                    <Button size="sm" onClick={handleSequenceGenerate} className="rounded-xl text-[10px] uppercase font-black bg-primary text-primary-foreground">Generate Sequence</Button>
                  </div>
                </div>
              )}

              {/* Advanced CSV Column Mapper System */}
              {csvColumns.length > 0 && (
                <div className="p-6 bg-[#daf3e4] rounded-[2rem] border border-emerald-300/40 space-y-4 animate-fade-in text-emerald-950">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#06241b]">CSV Product Data Detection & Mapper</h3>
                  </div>
                  <p className="text-[10px] text-emerald-900 leading-snug">The engine automatically analyzed headers and detected attributes. Tweak mapping fields to customize dynamic stickers:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">Barcode (SKU/Code) *</Label>
                      <select 
                        value={barcodeMappingCol} 
                        onChange={(e) => setBarcodeMappingCol(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-emerald-300/30 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                      >
                        <option value="">-- Choose Barcode Code Column --</option>
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
                        <option value="">-- Code Value (Fallback) --</option>
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
                      <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">Brand / Owner</Label>
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
                      <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">Size / Package</Label>
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
                      <Label className="text-[9px] font-black uppercase tracking-wider text-[#06241b]">Category / Dept</Label>
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
                    <Button size="sm" variant="ghost" onClick={() => { setCsvColumns([]); setCsvDataRows([]); }} className="rounded-xl text-[10px] uppercase font-black hover:bg-emerald-100 text-[#06241b]">Discard CSV</Button>
                    <Button size="sm" onClick={applyCsvMapping} className="rounded-xl text-[10px] uppercase font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-b-2 border-emerald-850">Map CSV Dataset</Button>
                  </div>
                </div>
              )}

              {/* Format Select Group (Industrial Engine Selectors in Bulk Mode) */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#006241] ml-2">Industrial Engine (Format Selection)</Label>
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-2 scrollbar-hide py-1">
                  {barcodeFormats.map(fmt => (
                    <button
                      key={fmt.value}
                      onClick={() => {
                        setFormat(fmt.value);
                        toast.info(`Engine switched to ${fmt.value}`);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-[2px] cursor-pointer select-none ${
                        format === fmt.value 
                        ? "bg-emerald-50/80 text-emerald-950 border-emerald-600 border-b-[5px] shadow-sm font-black" 
                        : "bg-muted/40 border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground hover:bg-muted/65"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multitheme Selection Group */}
              <div className="space-y-3 pt-4 border-t border-border/20">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#006241] ml-2 flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Sticker Typography & Skin Themes
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {BARCODE_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`p-3 rounded-2xl flex flex-col gap-1 transition-all text-left border-2 active:scale-[0.98] cursor-pointer ${
                        selectedThemeId === theme.id
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/25 shadow-sm"
                          : "border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" 
                          style={{ backgroundColor: theme.line }} 
                        />
                        <span className="text-[10.5px] font-black uppercase tracking-tight text-foreground truncate">{theme.name}</span>
                      </div>
                      <span className="text-[9px] text-[#555] dark:text-[#aaa] leading-snug font-medium line-clamp-1">{theme.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <Textarea 
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Enter contents (one per line)..."
                className="flex-1 min-h-[300px] overflow-y-auto rounded-3xl border-none bg-muted/30 p-8 text-lg font-medium focus-visible:ring-primary/20 font-mono scrollbar-thin [field-sizing:fixed]"
                style={{ fieldSizing: "fixed" } as React.CSSProperties}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Filename Template</Label>
                  <div className="relative">
                      <Input 
                        value={namingTemplate}
                        onChange={(e) => setNamingTemplate(e.target.value)}
                        className="h-12 rounded-xl bg-muted/30 border-none px-4 font-mono text-xs"
                      />
                      <div className="flex gap-4 mt-2 ml-2">
                        <span className="text-[9px] font-bold text-muted-foreground opacity-60 italic">Use &#123;n&#125; for index</span>
                      </div>
                  </div>
                </div>
                <Button onClick={processText} className="self-end h-12 rounded-xl font-black uppercase tracking-widest gap-2">
                  Sync Queue
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          {/* Quick Preview Box card */}
          <Card className="p-6 border-none shadow-premium rounded-[2rem] bg-card space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Eye className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight italic">Live Preview</h3>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Monitor dynamic render output</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg">
                <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground px-1">LIMIT:</span>
                {[4, 8, 12, 16].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setPreviewLimit(num);
                      toast.info(`Preview limit set to ${num} labels`);
                    }}
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      previewLimit === num
                        ? "bg-primary text-primary-foreground shadow-sm font-black"
                        : "text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-border/50 rounded-2xl bg-muted/10 flex-grow flex flex-col justify-center items-center h-full">
                <p className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Queue is empty</p>
                <p className="text-[8px] text-muted-foreground opacity-70 mt-1">Sync feedstock to generate active previews</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                {items.slice(0, previewLimit).map((item, idx) => (
                  <div 
                    key={`preview-${idx}`} 
                    className="p-3 bg-white dark:bg-slate-900 border border-border/30 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        {item.brand && <span className="bg-primary/10 text-primary font-black uppercase text-[7px] px-1 rounded truncate leading-tight shrink-0">{item.brand}</span>}
                        <p className="text-[10px] font-black uppercase text-foreground truncate leading-tight">{item.name}</p>
                      </div>
                      <p className="text-[8px] font-mono text-muted-foreground truncate opacity-70 mt-0.5">VAL: {item.content}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {item.price && <span className="text-[8.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded-sm">{formatPriceWithPrefix(item.price)}</span>}
                        {item.size && <span className="text-[8px] opacity-70 font-mono">SZ: {item.size}</span>}
                        {item.category && <span className="text-[8px] opacity-70 font-mono">CAT: {item.category}</span>}
                      </div>
                    </div>
                    <div 
                      className="flex-shrink-0 p-2 rounded-lg flex items-center justify-center max-w-[100px] overflow-hidden border" 
                      style={{ 
                        backgroundColor: background, 
                        borderColor: borderEnabled ? lineColor : "rgba(0,0,0,0.1)",
                        borderWidth: borderEnabled ? borderWidth : 1 
                      }}
                    >
                      <Barcode 
                        value={item.content}
                        format={format}
                        width={0.7}
                        height={24}
                        displayValue={false}
                        background="transparent"
                        lineColor={lineColor}
                        margin={0}
                      />
                    </div>
                  </div>
                ))}
                {items.length > previewLimit && (
                  <p className="text-[8px] font-bold text-muted-foreground text-center uppercase tracking-wider mt-1 opacity-70">
                    + {items.length - previewLimit} more labels in sequence queue
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Hidden container for full-resolution rendering & ZIP compilation of ALL active barcode items */}
      <div className="sr-only opacity-0 pointer-events-none fixed -top-[9999px] -left-[9999px]">
        {items.map((item, idx) => (
          <div key={`hidden-${idx}`}>
            <Barcode 
              id={`bulk-barcode-${idx}`}
              value={item.content}
              format={format}
              width={width}
              height={height}
              displayValue={displayValue}
              text={useTextOverride ? textOverride : undefined}
              font={font}
              fontOptions={fontOptions || undefined}
              fontSize={fontSize}
              textAlign={textAlign}
              textPosition={textPosition as any}
              textMargin={textMargin}
              background="transparent"
              lineColor={lineColor}
              margin={useCustomMargins ? undefined : margin}
              marginTop={useCustomMargins ? marginTop : undefined}
              marginBottom={useCustomMargins ? marginBottom : undefined}
              marginLeft={useCustomMargins ? marginLeft : undefined}
              marginRight={useCustomMargins ? marginRight : undefined}
              flat={flat}
            />
          </div>
        ))}
      </div>

      <Card className="p-10 border-none shadow-premium rounded-[3rem] bg-card mb-10 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase italic">Global Sync Workspace</h2>
          </div>
          <Button
            size="sm"
            onClick={() => {
              toast.success("Synchronized successfully: margins, layouts, alignments, typography, colors, and dimensions are fully synced across the list queue!");
            }}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-5 py-2 transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Synchronize Workspace Modifications
          </Button>
        </div>
        
        <BarcodeStyleSettings 
          width={width} setWidth={setWidth}
          height={height} setHeight={setHeight}
          displayValue={displayValue} setDisplayValue={setDisplayValue}
          font={font} setFont={setFont}
          fontSize={fontSize} setFontSize={setFontSize}
          textAlign={textAlign} setTextAlign={setTextAlign}
          textPosition={textPosition} setTextPosition={setTextPosition}
          textMargin={textMargin} setTextMargin={setTextMargin}
          background={background} setBackground={setBackground}
          lineColor={lineColor} setLineColor={setLineColor}
          margin={margin} setMargin={setMargin}
          fontOptions={fontOptions} setFontOptions={setFontOptions}
          flat={flat} setFlat={setFlat}
          useTextOverride={useTextOverride} setUseTextOverride={setUseTextOverride}
          textOverride={textOverride} setTextOverride={setTextOverride}
          useCustomMargins={useCustomMargins} setUseCustomMargins={setUseCustomMargins}
          marginTop={marginTop} setMarginTop={setMarginTop}
          marginBottom={marginBottom} setMarginBottom={setMarginBottom}
          marginLeft={marginLeft} setMarginLeft={setMarginLeft}
          marginRight={marginRight} setMarginRight={setMarginRight}
          // Pass down the highly professional features
          useLabelHeader={useLabelHeader} setUseLabelHeader={setUseLabelHeader}
          labelTextHeader={labelTextHeader} setLabelTextHeader={setLabelTextHeader}
          headerFontSize={headerFontSize} setHeaderFontSize={setHeaderFontSize}
          borderEnabled={borderEnabled} setBorderEnabled={setBorderEnabled}
          borderWidth={borderWidth} setBorderWidth={setBorderWidth}
          borderRadius={borderRadius} setBorderRadius={setBorderRadius}
          exportScale={exportScale} setExportScale={setExportScale}
        />

        {/* Global Sync Queue Widget Section */}
        <div className="pt-8 mt-8 border-t border-border/40 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Queue Sync & Mass Modifiers</h3>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Bulk synchronize global settings and metadata to all items in the queue</p>
            </div>
            {items.length > 0 && (
              <span className="text-[10px] font-black uppercase tracking-widest text-[#006241] dark:text-[#a0ffd9] px-4 py-1.5 bg-emerald-500/10 rounded-full">
                Targeting: {items.length} Active Items
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/10">
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Queue is empty</p>
              <p className="text-[10px] text-muted-foreground/85 mt-1">Please generate serialized codes, insert text contents above, or upload a dataset to begin multi-item synchronization</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Group: Global Branding & Naming Sync */}
              <div className="lg:col-span-5 p-5 bg-[#eaf8f0] dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/10 flex flex-col justify-between gap-5 text-emerald-950 dark:text-emerald-50">
                <div className="space-y-3">
                  <span className="text-[10.5px] font-black uppercase tracking-widest text-[#006241] dark:text-emerald-400 block">Branding & Identifier Sync</span>
                  <p className="text-[10px] text-emerald-900/80 dark:text-emerald-300 leading-relaxed font-semibold">Broadly force formatting schemas. Standardize individual values using top level variables.</p>
                  
                  <div className="space-y-3 pt-2">
                    {/* Branding sync action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10">
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest block text-[#06241b] dark:text-emerald-400">Universal Brand Title</span>
                        <span className="text-[8px] text-muted-foreground block font-bold mt-0.5">{useLabelHeader ? `Apply "${labelTextHeader}" as Brand` : 'Please enable Header Branding first'}</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={!useLabelHeader}
                        onClick={handleApplyBrandingHeaderToBrands}
                        className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 cursor-pointer shrink-0"
                      >
                        Apply Brand
                      </Button>
                    </div>

                    {/* Naming template sync action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10">
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest block text-[#06241b] dark:text-emerald-400">Re-apply Naming Pattern</span>
                        <span className="text-[8px] text-muted-foreground block font-bold mt-0.5">Use template "{namingTemplate}" for filenames</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSyncAllNamingTemplate}
                        className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer shrink-0"
                      >
                        Apply Names
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Group: Universal Metadata Overwrites */}
              <div className="lg:col-span-7 p-5 bg-[#eaf8f0] dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/10 text-emerald-950 dark:text-emerald-50">
                <span className="text-[10.5px] font-black uppercase tracking-widest text-[#006241] dark:text-emerald-400 block mb-2">Mass Metadata Overwrites</span>
                <p className="text-[10px] text-emerald-900/80 dark:text-emerald-300 leading-relaxed font-semibold mb-4">Enter an attribute below and overwrite the corresponding field across the entire sequence queue in one click.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10 space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#06241b] dark:text-emerald-400">Mass Category</Label>
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
                        className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 px-3 cursor-pointer shrink-0"
                      >
                        Set All
                      </Button>
                    </div>
                  </div>

                  {/* Brand field override */}
                  <div className="p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10 space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#06241b] dark:text-emerald-400">Mass Brand Override</Label>
                    <div className="flex gap-1.5">
                      <Input
                        value={syncBulkBrand}
                        onChange={(e) => setSyncBulkBrand(e.target.value)}
                        placeholder="e.g. PREMIUM LINE"
                        className="h-8 text-[10px] font-bold rounded-lg px-2 text-slate-900 dark:text-white border-emerald-500/20 bg-white dark:bg-slate-950"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSyncBulkMetadata("brand", syncBulkBrand)}
                        className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 px-3 cursor-pointer shrink-0"
                      >
                        Set All
                      </Button>
                    </div>
                  </div>

                  {/* Size */}
                  <div className="p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10 space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#06241b] dark:text-emerald-400">Mass Sizing / Details</Label>
                    <div className="flex gap-1.5">
                      <Input
                        value={syncBulkSize}
                        onChange={(e) => setSyncBulkSize(e.target.value)}
                        placeholder="e.g. Standard"
                        className="h-8 text-[10px] font-bold rounded-lg px-2 text-slate-900 dark:text-white border-emerald-500/20 bg-white dark:bg-slate-950"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSyncBulkMetadata("size", syncBulkSize)}
                        className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 px-3 cursor-pointer shrink-0"
                      >
                        Set All
                      </Button>
                    </div>
                  </div>

                  {/* Pricing Badge */}
                  <div className="p-3 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10 space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#06241b] dark:text-emerald-400">Mass Price Badge</Label>
                    <div className="flex gap-1.5">
                      <Input
                        value={syncBulkPrice}
                        onChange={(e) => setSyncBulkPrice(e.target.value)}
                        placeholder="e.g. 49.99"
                        className="h-8 text-[10px] font-bold rounded-lg px-2 text-slate-900 dark:text-white border-emerald-500/20 bg-white dark:bg-slate-950"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSyncBulkMetadata("price", syncBulkPrice)}
                        className="h-8 rounded-lg text-[9px] uppercase font-black bg-emerald-700 text-white hover:bg-emerald-800 px-3 cursor-pointer shrink-0"
                      >
                        Set All
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {items.length > 0 && (
        <div className="pt-10 border-t border-border/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Queue Preview & Labeller (Active)</h3>
                <p className="text-[10px] text-muted-foreground">Configure custom barcode codes, remove, edit names, or copy individual results directly.</p>
             </div>
             
             <div className="flex items-center gap-3 w-full sm:w-auto max-w-sm">
               <div className="relative w-full">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
                 <Input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Filter codes..." 
                   className="h-9 pl-9 rounded-xl border border-border/50 text-xs w-full"
                 />
               </div>
               <span className="text-[10px] whitespace-nowrap font-bold text-primary px-3 py-1 bg-primary/10 rounded-full uppercase">
                 Found {items.filter(x => x.content.toLowerCase().includes(searchQuery.toLowerCase()) || x.name.toLowerCase().includes(searchQuery.toLowerCase())).length} items
               </span>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedItems.map((item, idx) => {
                  // original index mapping
                  const originalIdx = items.findIndex(orItem => orItem.content === item.content && orItem.name === item.name);
                  const isEditing = editingIdx === originalIdx;

                  return (
                     <div 
                       key={idx} 
                       className="group relative p-5 bg-white transition-all overflow-hidden flex flex-col justify-between gap-4 hover:border-emerald-500/50 hover:shadow-md"
                       style={{ 
                         backgroundColor: background,
                         borderColor: borderEnabled ? lineColor : "rgba(226, 232, 240, 0.4)",
                         borderWidth: borderEnabled ? `${borderWidth}px` : "1px",
                         borderRadius: borderRadius === "none" ? "0px" : borderRadius === "soft" ? "1.25rem" : "2.5rem"
                       }}
                     >
                       {/* Custom Header Row: Brand & Price */}
                       {((useLabelHeader && labelTextHeader) || item.brand || item.price) && (
                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider pb-1.5 border-b border-dashed" style={{ borderColor: `${lineColor}33`, color: lineColor }}>
                           <span className="truncate max-w-[70%] text-left" style={{ fontSize: `${headerFontSize * 0.75}px` }}>
                             {item.brand || (useLabelHeader ? labelTextHeader : "PRODUCT LABEL")}
                           </span>
                           {item.price && (
                             <span className="px-1.5 py-0.5 rounded font-mono text-[8px] leading-none shrink-0" style={{ backgroundColor: lineColor, color: background }}>
                               {formatPriceWithPrefix(item.price)}
                             </span>
                           )}
                         </div>
                       )}

                       {/* Name/Title info inside the sticker preview */}
                       <div className="space-y-1">
                         <div className="font-sans font-extrabold text-[11px] uppercase tracking-tight truncate text-left" style={{ color: lineColor }}>
                           {item.name || `ITEM #${originalIdx + 1}`}
                         </div>
                       </div>

                       {/* Center Barcode Element */}
                       <div className="w-full flex items-center justify-center p-2 min-h-[90px] rounded-lg" style={{ background: "transparent" }}>
                          <Barcode 
                            value={item.content}
                            format={format}
                            width={Math.max(0.7, width * 0.55)} 
                            height={Math.max(30, height * 0.45)}
                            displayValue={displayValue}
                            text={useTextOverride ? textOverride : undefined}
                            font={font}
                            fontOptions={fontOptions || undefined}
                            fontSize={Math.max(8, fontSize * 0.55)}
                            textAlign={textAlign}
                            textPosition={textPosition as any}
                            textMargin={textMargin * 0.5}
                            background="transparent"
                            lineColor={lineColor}
                            margin={useCustomMargins ? undefined : margin * 0.4}
                            marginTop={useCustomMargins ? marginTop * 0.4 : undefined}
                            marginBottom={useCustomMargins ? marginBottom * 0.4 : undefined}
                            marginLeft={useCustomMargins ? marginLeft * 0.4 : undefined}
                            marginRight={useCustomMargins ? marginRight * 0.4 : undefined}
                            flat={flat}
                          />
                       </div>

                       {/* Footer Row: Size & Details */}
                       {(item.size || item.category) && (
                         <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider pt-1.5 border-t border-dashed opacity-80" style={{ borderColor: `${lineColor}33`, color: lineColor }}>
                           <span>{item.size ? `SZ: ${item.size}` : ""}</span>
                           <span>{item.category ? `CAT: ${item.category}` : ""}</span>
                         </div>
                       )}

                       <div className="space-y-3 pt-3 border-t border-border/20">
                           {isEditing ? (
                            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-border/60">
                              <div className="space-y-1">
                                <Label className="text-[8px] font-black uppercase tracking-wider">File Label Name</Label>
                                <Input 
                                  value={editName} 
                                  onChange={(e) => setEditName(e.target.value)} 
                                  className="h-8 text-[11px] rounded-lg font-mono px-2"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[8px] font-black uppercase tracking-wider font-mono">Barcode Code</Label>
                                <Input 
                                  value={editContent} 
                                  onChange={(e) => setEditContent(e.target.value)} 
                                  className="h-8 text-[11px] rounded-lg font-mono px-2"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-[8px] font-black uppercase tracking-wider">Price</Label>
                                  <Input 
                                    value={editPrice} 
                                    onChange={(e) => setEditPrice(e.target.value)} 
                                    className="h-7 text-[10px] rounded-lg px-2"
                                    placeholder="e.g. $19.99"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[8px] font-black uppercase tracking-wider">Brand</Label>
                                  <Input 
                                    value={editBrand} 
                                    onChange={(e) => setEditBrand(e.target.value)} 
                                    className="h-7 text-[10px] rounded-lg px-2"
                                    placeholder="e.g. Nike"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-[8px] font-black uppercase tracking-wider">Size</Label>
                                  <Input 
                                    value={editSize} 
                                    onChange={(e) => setEditSize(e.target.value)} 
                                    className="h-7 text-[10px] rounded-lg px-2"
                                    placeholder="e.g. Large"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[8px] font-black uppercase tracking-wider">Category</Label>
                                  <Input 
                                    value={editCategory} 
                                    onChange={(e) => setEditCategory(e.target.value)} 
                                    className="h-7 text-[10px] rounded-lg px-2"
                                    placeholder="e.g. Apparel"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-1.5 justify-end pt-1">
                                <Button size="xs" variant="ghost" className="h-7 text-[10px] rounded-lg" onClick={() => setEditingIdx(null)}>Cancel</Button>
                                <Button size="xs" className="h-7 text-[10px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white" 
                                        onClick={() => {
                                          if (!editContent.trim()) {
                                            toast.error("Code cannot be empty.");
                                            return;
                                          }
                                          handleEditItem(originalIdx, editContent.trim(), editName.trim() || item.name, editPrice.trim(), editBrand.trim(), editSize.trim(), editCategory.trim());
                                          setEditingIdx(null);
                                          toast.success("Item saved successfully!");
                                        }}>
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {item.brand && <span className="bg-primary/10 text-primary font-black uppercase text-[7px] px-1 rounded truncate leading-tight shrink-0">{item.brand}</span>}
                                  <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    setEditingIdx(originalIdx);
                                    setEditContent(item.content);
                                    setEditName(item.name);
                                    setEditPrice(item.price || "");
                                    setEditBrand(item.brand || "");
                                    setEditSize(item.size || "");
                                    setEditCategory(item.category || "");
                                  }}
                                  className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-all p-1 hover:bg-muted rounded-md shrink-0 cursor-pointer"
                                  title="Edit row details"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[9px] font-mono text-muted-foreground truncate opacity-70">VAL: {item.content}</p>
                              <div className="flex gap-1.5 flex-wrap pt-0.5">
                                {item.price && <span className="text-[8.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded-sm shrink-0">{formatPriceWithPrefix(item.price)}</span>}
                                {item.size && <span className="text-[8px] opacity-70 font-mono shrink-0">SZ: {item.size}</span>}
                                {item.category && <span className="text-[8px] opacity-70 font-mono shrink-0">CAT: {item.category}</span>}
                              </div>
                            </div>
                          )}

                          {!isEditing && (
                            <div className="flex items-center gap-1.5 pt-1.5">
                              <Button 
                                variant="outline" 
                                size="xs" 
                                className="h-8 text-[9px] font-bold rounded-xl flex-1 bg-white hover:bg-emerald-50 hover:text-emerald-850 border border-border/50" 
                                onClick={() => handleDownloadSingleItem(originalIdx)}
                              >
                                <Download className="w-2.5 h-2.5 mr-1" /> SVG
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="xs" 
                                className="h-8 text-[9px] font-bold rounded-xl text-red-650 hover:text-red-750 hover:bg-red-50/80" 
                                onClick={() => handleDeleteItem(originalIdx)}
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                          )}
                       </div>
                     </div>
                  );
                })}
           </div>

           {/* Pagination controls for labeller queue preview */}
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/20">
             <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
               Showing {Math.min(startIndex + 1, filteredItems.length)}–{Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} labels (Page {activePage} of {totalPages})
             </div>
             
             <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-end">
               {/* Items per Page Select */}
               <div className="flex items-center gap-2">
                 <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground select-none">Show:</span>
                 <select
                   value={itemsPerPage}
                   onChange={(e) => {
                     setItemsPerPage(Number(e.target.value));
                     setCurrentPage(1);
                   }}
                   className="h-8 px-2 bg-white dark:bg-slate-900 border border-border/50 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-primary text-slate-850"
                 >
                   <option value={6}>6 rows</option>
                   <option value={12}>12 rows</option>
                   <option value={24}>24 rows</option>
                   <option value={48}>48 rows</option>
                   <option value={100}>100 rows</option>
                 </select>
               </div>
               
               {/* Page Buttons */}
               <div className="flex items-center gap-1.5">
                 <Button
                   variant="outline"
                   size="xs"
                   onClick={() => setCurrentPage(1)}
                   disabled={activePage === 1}
                   className="h-8 w-8 p-0 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-850 border border-border/50 disabled:opacity-45"
                   title="First Page"
                 >
                   <ChevronLeft className="w-3.5 h-3.5" style={{ transform: "translateX(-1px)" }} /><ChevronLeft className="w-3.5 h-3.5 -ml-2" style={{ transform: "translateX(-1px)" }} />
                 </Button>
                 
                 <Button
                   variant="outline"
                   size="xs"
                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                   disabled={activePage === 1}
                   className="h-8 w-8 p-0 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-850 border border-border/50 disabled:opacity-45"
                   title="Previous Page"
                 >
                   <ChevronLeft className="w-3.5 h-3.5" />
                 </Button>

                 {/* Page numbers adaptive rendering */}
                 {Array.from({ length: totalPages }, (_, i) => i + 1)
                   .filter(page => {
                     return page === 1 || page === totalPages || Math.abs(page - activePage) <= 1;
                   })
                   .map((page, index, array) => {
                     const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                     return (
                       <React.Fragment key={page}>
                         {showEllipsisBefore && (
                           <span className="text-xs px-1 text-muted-foreground font-bold select-none">...</span>
                         )}
                         <Button
                           variant={activePage === page ? "default" : "outline"}
                           size="xs"
                           onClick={() => setCurrentPage(page)}
                           className={`h-8 min-w-[2rem] px-2 rounded-xl transition-all ${
                             activePage === page 
                               ? "bg-slate-900 border border-slate-900 text-white font-extrabold" 
                               : "bg-white hover:bg-emerald-50 hover:text-emerald-850 border border-border/50"
                           }`}
                         >
                           {page}
                         </Button>
                       </React.Fragment>
                     );
                   })
                 }

                 <Button
                   variant="outline"
                   size="xs"
                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                   disabled={activePage === totalPages}
                   className="h-8 w-8 p-0 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-850 border border-border/50 disabled:opacity-45"
                   title="Next Page"
                 >
                   <ChevronRight className="w-3.5 h-3.5" />
                 </Button>

                 <Button
                   variant="outline"
                   size="xs"
                   onClick={() => setCurrentPage(totalPages)}
                   disabled={activePage === totalPages}
                   className="h-8 w-8 p-0 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-850 border border-border/50 disabled:opacity-45"
                   title="Last Page"
                 >
                   <ChevronRight className="w-3.5 h-3.5" /><ChevronRight className="w-3.5 h-3.5 -ml-2" />
                 </Button>
               </div>
             </div>
           </div>
           
           {items.length > 0 && (
             <div className="mt-8 p-6 bg-muted/20 rounded-2xl text-center border border-dashed border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Batch compiled: all {items.length} barcodes in queue will be fully compiled into the ZIP package
                </p>
             </div>
           )}
        </div>
      )}

      {/* Industrial Engine Status - Positioned Full Width Under the Workspace / Active Queue */}
      <Card className="p-10 border-none shadow-premium rounded-[3rem] bg-card">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Info & Stats column */}
            <div className="lg:col-span-6 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
                     <Settings2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                     <h3 className="font-black uppercase tracking-tight italic text-lg text-foreground">Industrial Engine Status</h3>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">High-volume industrial vector output stream</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/20 rounded-2xl border border-border/50 text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#006241] dark:text-emerald-400 mb-1">Queue Size</p>
                     <p className="text-2xl font-black">{items.length}</p>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-2xl border border-border/50 text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Export Mode</p>
                     <p className="text-2xl font-black italic">ZIP (PNG/SVG)</p>
                  </div>
               </div>

               <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                  <div className="flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">Vector Processing Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     <span className="text-xs font-black text-muted-foreground uppercase tracking-wider font-mono text-[10px]">DPI SCALING: {exportScale}x</span>
                  </div>
               </div>
            </div>

            {/* Trigger elements column / Actions */}
            <div className="lg:col-span-6 bg-muted/10 p-6 rounded-3xl border border-dashed border-border/60 flex flex-col justify-center h-full space-y-4">
               <div className="text-xs font-black text-[#006241] uppercase tracking-wider ml-1">Export Controls</div>
               
               <Button 
                  onClick={() => setIsPrintModalOpen(true)} 
                  disabled={items.length === 0} 
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 border-2 border-amber-600 border-b-[6px] hover:border-b-[4px] active:border-b-2 active:translate-y-[4px] transition-all gap-2 flex items-center justify-center select-none shadow-[0_4px_0_0_rgba(245,158,11,0.15)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-white text-xs"
               >
                  <Printer className="w-4 h-4 mr-1" /> Print Barcode Labels
               </Button>

               <div className="grid grid-cols-2 gap-3">
                 <Button 
                   onClick={executeBulkSVGExport} 
                   disabled={processing || items.length === 0} 
                   className="h-14 rounded-2xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-700 border-b-[6px] hover:border-b-[4px] active:border-b-2 active:translate-y-[4px] transition-all gap-1 flex flex-col justify-center items-center select-none shadow-[0_4px_0_0_rgba(16,185,129,0.15)] disabled:opacity-40 disabled:pointer-events-none text-[9.5px]"
                 >
                    <Archive className="w-4 h-4" /> 
                    <span>{processing ? "Zipping..." : "Zip SVG (Vector)"}</span>
                 </Button>
                 <Button 
                   onClick={executeBulkPNGExport} 
                   disabled={processing || items.length === 0} 
                   className="h-14 rounded-2xl font-black uppercase tracking-widest bg-teal-600 hover:bg-teal-700 text-white border-2 border-teal-700 border-b-[6px] hover:border-b-[4px] active:border-b-2 active:translate-y-[4px] transition-all gap-1 flex flex-col justify-center items-center select-none shadow-[0_4px_0_0_rgba(13,148,136,0.15)] disabled:opacity-40 disabled:pointer-events-none text-[9.5px]"
                 >
                    <Palette className="w-4 h-4" /> 
                    <span>{processing ? "Zipping..." : "Zip PNG (Images)"}</span>
                 </Button>
               </div>

               <Button variant="ghost" onClick={() => setItems([])} disabled={items.length === 0} className="w-full h-12 rounded-xl text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-extrabold bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border-2 border-red-200 dark:border-red-900/50 border-b-[4px] border-b-red-300 dark:border-b-red-800 hover:border-b-[3px] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center select-none shadow-sm disabled:opacity-40 disabled:pointer-events-none">
                  <Trash2 className="w-4 h-4 mr-2" /> Reset Engine
               </Button>
            </div>

         </div>
      </Card>

      {/* Dynamic Printing Options Configuration Modal Drawer */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/45 dark:bg-slate-950/70 backdrop-blur-sm animate-fade-in cursor-default">
          <Card className="p-8 w-full max-w-xl rounded-[2.5rem] bg-card border-none shadow-premium space-y-6">
            <div className="flex items-center justify-between border-b border-border/45 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                  <Printer className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Industrial Print Labeller</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Configure sheets layout for local printers</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-white cursor-pointer flex items-center justify-center"
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
                  className="w-full h-10 px-3 bg-muted/45 border-slate-200 dark:border-slate-800 border rounded-xl text-xs font-bold text-foreground"
                >
                  <option value={1}>1 Label (Single Column)</option>
                  <option value={2}>2 Labels (Double Columns)</option>
                  <option value={3}>3 Labels (Compact Sheet)</option>
                  <option value={4}>4 Labels (Industrial High Density)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Gap spacing</Label>
                <select
                  value={printGap}
                  onChange={(e) => setPrintGap(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-muted/45 border-slate-200 dark:border-slate-800 border rounded-xl text-xs font-bold text-foreground"
                >
                  <option value={8}>8px - Ultra dense</option>
                  <option value={12}>12px - Balanced label size</option>
                  <option value={16}>16px - Standard gap spacing</option>
                  <option value={24}>24px - Wide space boundaries</option>
                </select>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Select Label Elements to include</Label>
              <div className="grid grid-cols-2 gap-3.5">
                <button 
                  onClick={() => setPrintIncludeBrand(!printIncludeBrand)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold select-none cursor-pointer transition-all ${
                    printIncludeBrand ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-400" : "border-border bg-transparent opacity-60"
                  }`}
                >
                  <span>Include Brand / Company</span>
                  <span className="text-lg leading-none">{printIncludeBrand ? "●" : "○"}</span>
                </button>

                <button 
                  onClick={() => setPrintIncludePrice(!printIncludePrice)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold select-none cursor-pointer transition-all ${
                    printIncludePrice ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-400" : "border-border bg-transparent opacity-60"
                  }`}
                >
                  <span>Include Price tags</span>
                  <span className="text-lg leading-none">{printIncludePrice ? "●" : "○"}</span>
                </button>

                {printIncludePrice && (
                  <div className="col-span-2 p-3 bg-muted/40 rounded-xl space-y-2 border border-border/60">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                      Price Format Prefix / Currency Symbol
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
                        <option value="">No Prefix (Plain Number)</option>
                        <option value="$">US Dollar ($)</option>
                        <option value="€">Euro (€)</option>
                        <option value="£">British Pound (£)</option>
                        <option value="¥">Yen / Yuan (¥)</option>
                        <option value="₹">Indian Rupee (₹)</option>
                        <option value="₪">Israeli Shekel (₪)</option>
                        <option value="AED">UAE Dirham (AED)</option>
                        <option value="custom">Custom Prefix...</option>
                      </select>
                      
                      {!["$", "€", "£", "¥", "₹", "AED", "₪", ""].includes(priceCurrencyPrefix) && (
                        <input
                          type="text"
                          value={priceCurrencyPrefix}
                          onChange={(e) => setPriceCurrencyPrefix(e.target.value)}
                          placeholder="e.g. CA$ "
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
                  <span>Include Product titles</span>
                  <span className="text-lg leading-none">{printIncludeName ? "●" : "○"}</span>
                </button>

                <button 
                  onClick={() => setPrintIncludeDetails(!printIncludeDetails)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold select-none cursor-pointer transition-all ${
                    printIncludeDetails ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-400" : "border-border bg-transparent opacity-60"
                  }`}
                >
                  <span>Include Sizes & Category</span>
                  <span className="text-lg leading-none">{printIncludeDetails ? "●" : "○"}</span>
                </button>

                <button 
                  onClick={() => setPrintColorOn(!printColorOn)}
                  className={`col-span-2 p-3 rounded-xl border flex items-center justify-between text-xs font-bold select-none cursor-pointer transition-all text-left ${
                    printColorOn ? "border-emerald-600 bg-emerald-50/20 text-emerald-950 dark:text-emerald-400 font-extrabold" : "border-border bg-transparent opacity-60"
                  }`}
                >
                  <div>
                    <span className="block">Enable Theme Presets (Background Color Sticker)</span>
                    <span className="block text-[8.5px] font-normal text-muted-foreground mt-0.5">Otherwise saves printing ink with safe monochromatic black/white card labels</span>
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
                Cancel
              </Button>
              <Button 
                onClick={handlePrintInNewTab}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 font-black uppercase tracking-wider text-xs px-6 py-2.5 shadow-sm text-white hover:text-white cursor-pointer"
              >
                Trigger Print Spooler
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Printable elements grid */}
      <div id="barcode-print-area" className="hidden">
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${printCols}, minmax(0, 1fr))`,
          gap: `${printGap}px`,
          padding: "10px"
        }}>
          {items.map((item, idx) => (
            <div 
              key={`print-item-${idx}`} 
              className="print-sticker-card" 
              style={{
                width: "320px",
                height: "220px",
                padding: "15px",
                border: borderEnabled ? `${borderWidth}px solid ${lineColor}` : "1px solid #ccc",
                borderRadius: borderRadius === "none" ? "0" : borderRadius === "soft" ? "12px" : "20px",
                backgroundColor: printColorOn ? background : "#ffffff",
                color: lineColor,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
                pageBreakInside: "avoid",
                fontFamily: font === "monospace" ? "monospace" : font === "sans-serif" ? "sans-serif" : "serif"
              }}
            >
              {/* Top header row */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: `${headerFontSize * 0.85}px`, fontWeight: "900", borderBottom: `1px dashed ${lineColor}`, paddingBottom: "6px", textTransform: "uppercase" }}>
                <span>{printIncludeBrand ? (item.brand || labelTextHeader || "PRODUCT LABEL") : "PRODUCT LABEL"}</span>
                {printIncludePrice && item.price && (
                  <span style={{ backgroundColor: lineColor, color: printColorOn ? background : "#ffffff", padding: "2px 6px", borderRadius: "4px" }}>
                    {formatPriceWithPrefix(item.price)}
                  </span>
                )}
              </div>
              
              {/* Name Tag */}
              {printIncludeName && (
                <div style={{ fontSize: "13px", fontWeight: "900", marginTop: "4px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {(item.name || `ITEM #${idx + 1}`).toUpperCase()}
                </div>
              )}
              
              {/* Barcode representation */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, padding: "8px 0" }}>
                <Barcode 
                  value={item.content}
                  format={format}
                  width={1.0}
                  height={45}
                  displayValue={displayValue}
                  text={useTextOverride ? textOverride : undefined}
                  font={font}
                  fontSize={10}
                  background="transparent"
                  lineColor={lineColor}
                  margin={0}
                />
              </div>
              
              {/* Bottom Row */}
              {printIncludeDetails && (item.size || item.category) && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: "bold", borderTop: `1px dashed ${lineColor}`, paddingTop: "4px", opacity: 0.8, textTransform: "uppercase" }}>
                  <span>{item.size ? `SIZE: ${item.size}` : ""}</span>
                  <span>{item.category ? `CAT: ${item.category}` : ""}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Congratulations Celebration Popup */}
      <AnimatePresence>
        {showCongrats && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-md w-full bg-card rounded-[3rem] p-10 shadow-2xl border border-border/50 relative overflow-hidden text-center"
            >
              {/* Confetti-like background effects */}
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
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase">Success!</h2>
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </motion.div>
                    <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">Your labels were successfully exported</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 rounded-3xl border border-dashed border-border/60">
                   <p className="text-sm font-medium leading-relaxed">
                     Your high-precision barcodes have been packaged into an industrial-grade ZIP archive and are ready for high-volume deployment. 
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

              {/* Animated Floating Particles */}
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

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #barcode-print-area, #barcode-print-area * {
            visibility: visible !important;
          }
          #barcode-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            visibility: visible !important;
            display: block !important;
            background: #ffffff !important;
          }
          @page {
            size: auto !important;
            margin: 12mm 10mm 15mm 10mm !important;
          }
          .print-sticker-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
}
