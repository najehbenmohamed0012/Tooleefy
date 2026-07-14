import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Layers, RefreshCw, Smartphone, Hash, Info, CheckCircle2, AlertTriangle, Copy, Star, Trophy } from "lucide-react";
import { BarcodeStyleSettings } from "./BarcodeStyleSettings";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/Logo";
import { logActivity } from "@/supabase/db";

const barcodeFormats = [
  { value: "CODE128", label: "CODE 128", placeholder: "e.g. TOOLEEFY-789", desc: "Standard high-density linear barcode (supports alphanumeric characters)." },
  { value: "CODE128A", label: "CODE 128 A", placeholder: "e.g. TOOLEEFY-789", desc: "Code 128 sub-type A (Control characters, numbers, uppercase letters)." },
  { value: "CODE128B", label: "CODE 128 B", placeholder: "e.g. TOOLEEFY-789", desc: "Code 128 sub-type B (Numbers, lowercase/uppercase letters, symbols)." },
  { value: "CODE128C", label: "CODE 128 C", placeholder: "e.g. 99123456", desc: "Code 128 sub-type C (Optimized for double-density numeric-only pairs, must exceed even number of digits)." },
  { value: "EAN13", label: "EAN-13", placeholder: "e.g. 4006381333931", desc: "European Article Numbering, requires exactly 12 or 13 numeric digits (if 12, check sum is computed)." },
  { value: "EAN8", label: "EAN-8", placeholder: "e.g. 73513537", desc: "Short-format European article code, requires exactly 7 or 8 numeric digits." },
  { value: "UPC", label: "UPC", placeholder: "e.g. 012345678905", desc: "Universal Product Code (North America), requires exactly 11 or 12 numeric digits." },
  { value: "CODE39", label: "CODE 39", placeholder: "e.g. TOOLEEFY 123", desc: "Alphanumeric symbology (supports A-Z, 0-9, space, and -$%./+)." },
  { value: "ITF14", label: "ITF-14", placeholder: "e.g. 10012345678902", desc: "Interleaved 2 of 5 for global retail shipping, requires exactly 13 or 14 numeric digits." },
  { value: "ITF", label: "ITF", placeholder: "e.g. 5543210986", desc: "Interleaved 2 of 5 numeric-only barcode with variable density (even digits count optimal)." },
  { value: "MSI", label: "MSI", placeholder: "e.g. 827361", desc: "Modified Plessey code (commonly used in supermarkets/shelves), expects numeric-only digits." },
  { value: "MSI10", label: "MSI 10", placeholder: "e.g. 302918", desc: "MSI code with single modulo 10 check digit." },
  { value: "MSI11", label: "MSI 11", placeholder: "e.g. 482019", desc: "MSI code with modulo 11 check digit." },
  { value: "MSI1010", label: "MSI 1010", placeholder: "e.g. 591029", desc: "MSI code with dual modulo 10 check digits." },
  { value: "MSI1110", label: "MSI 1110", placeholder: "e.g. 602910", desc: "MSI code with modulo 11/10 check digits." },
  { value: "pharmacode", label: "Pharmacode", placeholder: "e.g. 12345", desc: "Code used in pharmaceutical packaging, accepts digits from 3 to 131070." },
  { value: "codabar", label: "Codabar", placeholder: "e.g. A123456B", desc: "Self-checking barcode used in libraries & blood banks (starts & ends with A/B/C/D)." }
];

const formatExamples: Record<string, string> = {
  CODE128: "TOOLEEFY-789",
  CODE128A: "UT-88229",
  CODE128B: "Pack-302a",
  CODE128C: "99123456",
  EAN13: "4006381333931",
  EAN8: "73513537",
  UPC: "012345678905",
  CODE39: "CODE 39 TEXT",
  ITF14: "10012345678902",
  ITF: "5543210986",
  MSI: "827361",
  MSI10: "302918",
  MSI11: "482019",
  MSI1010: "591029",
  MSI1110: "602910",
  pharmacode: "12345",
  codabar: "A123456B"
};

function getValidationStatus(val: string, fmt: string) {
  if (!val) return { isValid: false, message: "Field is empty. Please enter content." };
  
  switch (fmt) {
    case "EAN13":
      if (!/^\d{12,13}$/.test(val)) {
        return { isValid: false, message: "EAN-13 expects exactly 12 or 13 numeric digits." };
      }
      break;
    case "EAN8":
      if (!/^\d{7,8}$/.test(val)) {
        return { isValid: false, message: "EAN-8 expects exactly 7 or 8 numeric digits." };
      }
      break;
    case "UPC":
      if (!/^\d{11,12}$/.test(val)) {
        return { isValid: false, message: "UPC expects exactly 11 or 12 numeric digits." };
      }
      break;
    case "ITF14":
      if (!/^\d{13,14}$/.test(val)) {
        return { isValid: false, message: "ITF-14 expects exactly 13 or 14 numeric digits." };
      }
      break;
    case "ITF":
      if (!/^\d+$/.test(val)) {
        return { isValid: false, message: "ITF expects only numeric digits." };
      }
      break;
    case "CODE128C":
      if (!/^\d+$/.test(val)) {
        return { isValid: false, message: "CODE 128 C expects double-density numeric-only digits." };
      }
      break;
    case "pharmacode":
      if (!/^\d+$/.test(val)) {
        return { isValid: false, message: "Pharmacode expects digits only." };
      }
      const num = parseInt(val, 10);
      if (num < 3 || num > 131070) {
        return { isValid: false, message: "Pharmacode range must be between 3 and 131070." };
      }
      break;
    case "codabar":
      if (!/^[A-Da-d]?[0-9\-\$\:\/\.\+]+[A-Da-d]?$/.test(val)) {
        return { isValid: false, message: "Codabar allows digits, symbols (-$:/.+), with optional A/B/C/D start/stops." };
      }
      break;
    case "MSI":
    case "MSI10":
    case "MSI11":
    case "MSI1010":
    case "MSI1110":
      if (!/^\d+$/.test(val)) {
        return { isValid: false, message: "MSI formats expect only numeric digits." };
      }
      break;
    default:
      break;
  }
  return { isValid: true };
}

export function SingleBarcodeGenerator() {
  const navigate = useNavigate();
  const [showCongrats, setShowCongrats] = useState(false);
  const [value, setValue] = useState("TOOLEEFY-789");
  
  // Styling States
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

  // New Professional Options
  const [useLabelHeader, setUseLabelHeader] = useState(false);
  const [labelTextHeader, setLabelTextHeader] = useState("TOOLEEFY INDUSTRIAL");
  const [headerFontSize, setHeaderFontSize] = useState(14);
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderWidth, setBorderWidth] = useState(3);
  const [borderRadius, setBorderRadius] = useState("soft");
  const [exportScale, setExportScale] = useState(2);

  const barcodeRef = useRef<HTMLDivElement>(null);

  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat);
    const validation = getValidationStatus(value, newFormat);
    if (!validation.isValid) {
      setValue(formatExamples[newFormat] || "123456");
    }
    toast.info(`Engine switched to ${newFormat}`);
  };

  const activeFormatObj = barcodeFormats.find(f => f.value === format) || barcodeFormats[0];
  const validation = getValidationStatus(value, format);

  const downloadSVG = () => {
    if (!validation.isValid) {
      toast.error("Please enter a valid format value before exporting.");
      return;
    }
    const svg = barcodeRef.current?.querySelector('svg');
    if (!svg) return;

    let svgData = new XMLSerializer().serializeToString(svg);

    const widthAttr = svg.getAttribute("width");
    const heightAttr = svg.getAttribute("height");
    const svgWidth = widthAttr ? parseFloat(widthAttr) : (svg.getBoundingClientRect().width || 250);
    const svgHeight = heightAttr ? parseFloat(heightAttr) : (svg.getBoundingClientRect().height || 135);

    // If advanced parameters are active, construct a wrapper SVG
    if (useLabelHeader || borderEnabled) {
      const totalHeaderHeight = useLabelHeader ? (headerFontSize + 16) : 0;
      const pad = borderEnabled ? borderWidth * 2 + 10 : 10;
      
      const outerWidth = svgWidth + pad * 2;
      const outerHeight = svgHeight + totalHeaderHeight + pad * 2;
      
      const rx = borderRadius === "none" ? 0 : borderRadius === "soft" ? 12 : 24;
      const fontFam = font === "monospace" ? "monospace" : font === "sans-serif" ? "sans-serif" : "serif";

      svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${outerWidth} ${outerHeight}">
  <rect width="100%" height="100%" fill="${background}" ${borderEnabled ? `stroke="${lineColor}" stroke-width="${borderWidth}" rx="${rx}"` : ""}/>
  ${useLabelHeader ? `<text x="50%" y="${pad + headerFontSize}" text-anchor="middle" font-family="${fontFam}" font-size="${headerFontSize}" font-weight="900" fill="${lineColor}">${labelTextHeader.toUpperCase()}</text>` : ""}
  <g transform="translate(${pad}, ${pad + totalHeaderHeight})">
    ${svgData.replace(/<\?xml.*?\?>/, "").replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "")}
  </g>
</svg>`;
    }

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `barcode-${value}-${format}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("Vector SVG downloaded (fully contains label headers / borders!)");
    setShowCongrats(true);
    logActivity({
      tool_type: 'barcode',
      name: `Barcode ${value} (${format})`,
      status: 'Downloaded SVG'
    });
  };

  const copySVGToClipboard = () => {
    if (!validation.isValid) {
      toast.error("Please enter a valid format value first.");
      return;
    }
    const svg = barcodeRef.current?.querySelector('svg');
    if (!svg) return;

    let svgData = new XMLSerializer().serializeToString(svg);

    const widthAttr = svg.getAttribute("width");
    const heightAttr = svg.getAttribute("height");
    const svgWidth = widthAttr ? parseFloat(widthAttr) : (svg.getBoundingClientRect().width || 250);
    const svgHeight = heightAttr ? parseFloat(heightAttr) : (svg.getBoundingClientRect().height || 135);

    if (useLabelHeader || borderEnabled) {
      const totalHeaderHeight = useLabelHeader ? (headerFontSize + 16) : 0;
      const pad = borderEnabled ? borderWidth * 2 + 10 : 10;
      
      const outerWidth = svgWidth + pad * 2;
      const outerHeight = svgHeight + totalHeaderHeight + pad * 2;
      
      const rx = borderRadius === "none" ? 0 : borderRadius === "soft" ? 12 : 24;
      const fontFam = font === "monospace" ? "monospace" : font === "sans-serif" ? "sans-serif" : "serif";

      svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${outerWidth} ${outerHeight}">
  <rect width="100%" height="100%" fill="${background}" ${borderEnabled ? `stroke="${lineColor}" stroke-width="${borderWidth}" rx="${rx}"` : ""}/>
  ${useLabelHeader ? `<text x="50%" y="${pad + headerFontSize}" text-anchor="middle" font-family="${fontFam}" font-size="${headerFontSize}" font-weight="900" fill="${lineColor}">${labelTextHeader.toUpperCase()}</text>` : ""}
  <g transform="translate(${pad}, ${pad + totalHeaderHeight})">
    ${svgData.replace(/<\?xml.*?\?>/, "").replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "")}
  </g>
</svg>`;
    }

    navigator.clipboard.writeText(svgData)
      .then(() => toast.success("SVG source code copied to clipboard! Ready to paste into vector software."))
      .catch(() => toast.error("Could not write to clipboard."));
  };

  const downloadPNG = () => {
    if (!validation.isValid) {
      toast.error("Please enter a valid format value before exporting.");
      return;
    }
    const svg = barcodeRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement("canvas");
    let svgData = new XMLSerializer().serializeToString(svg);

    const widthAttr = svg.getAttribute("width");
    const heightAttr = svg.getAttribute("height");
    const svgWidth = widthAttr ? parseFloat(widthAttr) : (svg.getBoundingClientRect().width || 250);
    const svgHeight = heightAttr ? parseFloat(heightAttr) : (svg.getBoundingClientRect().height || 135);

    const totalHeaderHeight = useLabelHeader ? (headerFontSize + 16) : 0;
    const pad = borderEnabled ? borderWidth * 2 + 10 : 10;
    
    const outerWidth = svgWidth + pad * 2;
    const outerHeight = svgHeight + totalHeaderHeight + pad * 2;
    
    const rx = borderRadius === "none" ? 0 : borderRadius === "soft" ? 12 : 24;
    const fontFam = font === "monospace" ? "monospace" : font === "sans-serif" ? "sans-serif" : "serif";

    if (useLabelHeader || borderEnabled) {
      svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${outerWidth} ${outerHeight}">
  <rect width="100%" height="100%" fill="${background}" ${borderEnabled ? `stroke="${lineColor}" stroke-width="${borderWidth}" rx="${rx}"` : ""}/>
  ${useLabelHeader ? `<text x="50%" y="${pad + headerFontSize}" text-anchor="middle" font-family="${fontFam}" font-size="${headerFontSize}" font-weight="900" fill="${lineColor}">${labelTextHeader.toUpperCase()}</text>` : ""}
  <g transform="translate(${pad}, ${pad + totalHeaderHeight})">
    ${svgData.replace(/<\?xml.*?\?>/, "").replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "")}
  </g>
</svg>`;
    } else {
      svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${outerWidth} ${outerHeight}">
  <rect width="100%" height="100%" fill="${background}" />
  <g transform="translate(${pad}, ${pad})">
    ${svgData.replace(/<\?xml.*?\?>/, "").replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "")}
  </g>
</svg>`;
    }

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const scale = exportScale; 
      canvas.width = outerWidth * scale;
      canvas.height = outerHeight * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `barcode-${value}-${format}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setShowCongrats(true);
        logActivity({
          tool_type: 'barcode',
          name: `Barcode ${value} (${format})`,
          status: 'Downloaded PNG'
        });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
    toast.success(`High-res PNG downloaded (${exportScale}x scale applied)`);
  };

  const copyPNGToClipboard = () => {
    if (!validation.isValid) {
      toast.error("Please enter a valid format value first.");
      return;
    }
    const svg = barcodeRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement("canvas");
    let svgData = new XMLSerializer().serializeToString(svg);

    const svgWidth = svg.getBoundingClientRect().width || 250;
    const svgHeight = svg.getBoundingClientRect().height || 135;
    const totalHeaderHeight = useLabelHeader ? (headerFontSize + 16) : 0;
    const pad = borderEnabled ? borderWidth * 2 + 10 : 10;
    const outerWidth = svgWidth + pad * 2;
    const outerHeight = svgHeight + totalHeaderHeight + pad * 2;
    
    const rx = borderRadius === "none" ? 0 : borderRadius === "soft" ? 12 : 24;
    const fontFam = font === "monospace" ? "monospace" : font === "sans-serif" ? "sans-serif" : "serif";

    svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${outerWidth} ${outerHeight}">
  <rect width="100%" height="100%" fill="${background}" ${borderEnabled ? `stroke="${lineColor}" stroke-width="${borderWidth}" rx="${rx}"` : ""}/>
  ${useLabelHeader ? `<text x="50%" y="${pad + headerFontSize}" text-anchor="middle" font-family="${fontFam}" font-size="${headerFontSize}" font-weight="900" fill="${lineColor}">${labelTextHeader.toUpperCase()}</text>` : ""}
  <g transform="translate(${pad}, ${pad + totalHeaderHeight})">
    ${svgData.replace(/<\?xml.*?\?>/, "").replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "")}
  </g>
</svg>`;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = outerWidth * 2;
      canvas.height = outerHeight * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]).then(() => {
              toast.success("Design elements copied as PNG image to your clipboard!");
            }).catch(() => {
              toast.error("Writing image to clipboard is not supported in this frame browser.");
            });
          }
        }, "image/png");
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Hash className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight uppercase">Payload Data</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-muted/60 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{format} Engine</span>
                </div>
              </div>

              {/* Format Select Group (Industrial Engine Selectors) */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Industrial Engine (Format Selection)</Label>
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-2 scrollbar-hide py-1">
                  {barcodeFormats.map(fmt => (
                    <button
                      key={fmt.value}
                      onClick={() => handleFormatChange(fmt.value)}
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

              {/* Animated expand input container */}
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={format}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-4 pt-4 border-t border-border/40"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#006241] ml-2">
                      Barcode Field ({activeFormatObj.label})
                    </Label>
                    <span className="text-[8px] font-black tracking-wider uppercase bg-[#daf3e4] text-[#05402a] px-2.5 py-0.5 rounded-full">
                      Ready to encode
                    </span>
                  </div>

                  <div className="relative group">
                    <Input 
                      value={value} 
                      onChange={(e) => setValue(e.target.value)} 
                      placeholder={activeFormatObj.placeholder}
                      className={`h-20 text-2xl font-black rounded-2xl bg-muted/30 border-2 px-8 focus-visible:ring-primary/20 tracking-wider font-mono transition-all ${
                        validation.isValid 
                          ? "border-[#006241]/20 focus-visible:border-[#006241]/40" 
                          : "border-destructive/30 focus-visible:border-destructive/50"
                      }`} 
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                       <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => setValue("")}
                          className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                       >
                          <RefreshCw className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>

                  {/* Real-time Instructions and Validation Notice */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/40 text-xs">
                    {validation.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-left">
                      <p className="font-bold text-foreground">
                        {validation.isValid ? "Format Specifications Matched" : "Format Specifications Warning"}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {activeFormatObj.desc} {validation.message && <span className="text-amber-600 font-bold block mt-1">{validation.message}</span>}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Card>

          <Card className="p-10 border-none shadow-premium rounded-[3rem] bg-card mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase italic">Styling Workspace</h2>
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
              // New states
              useLabelHeader={useLabelHeader} setUseLabelHeader={setUseLabelHeader}
              labelTextHeader={labelTextHeader} setLabelTextHeader={setLabelTextHeader}
              headerFontSize={headerFontSize} setHeaderFontSize={setHeaderFontSize}
              borderEnabled={borderEnabled} setBorderEnabled={setBorderEnabled}
              borderWidth={borderWidth} setBorderWidth={setBorderWidth}
              borderRadius={borderRadius} setBorderRadius={setBorderRadius}
              exportScale={exportScale} setExportScale={setExportScale}
            />
          </Card>
        </div>

        <div className="lg:col-span-4 sticky top-8 space-y-8">
          <Card className="p-10 border-none shadow-premium rounded-[3rem] bg-card overflow-hidden relative animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            <div className="flex flex-col items-center gap-8">
              <div className="text-center space-y-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">High Fidelity Render</h3>
                <p className="text-[10px] font-bold text-primary/60 uppercase">Real-time scan verification</p>
              </div>

              <div className="relative group w-full flex items-center justify-center min-h-[300px]">
                <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10 w-full p-6 flex flex-col items-center justify-center border shadow-xl overflow-hidden transition-all max-w-full"
                     style={{ 
                       backgroundColor: background,
                       borderColor: borderEnabled ? lineColor : "rgba(226, 232, 240, 0.4)",
                       borderWidth: borderEnabled ? `${borderWidth}px` : "1px",
                       borderRadius: borderRadius === "none" ? "0px" : borderRadius === "soft" ? "1.25rem" : "2.5rem"
                     }}>
                  
                  {/* Real-time brand header */}
                  {useLabelHeader && labelTextHeader && (
                    <div 
                      className="font-black mb-3 select-none text-center"
                      style={{ 
                        color: lineColor,
                        fontFamily: font === "monospace" ? "monospace" : font === "sans-serif" ? "sans-serif" : "serif",
                        fontSize: `${headerFontSize}px`,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {labelTextHeader}
                    </div>
                  )}

                  <div ref={barcodeRef} className="flex items-center justify-center max-w-full">
                    {value && validation.isValid ? (
                      <Barcode 
                        value={value}
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
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4 py-8 text-muted-foreground/55 text-center px-4">
                        <AlertTriangle className="w-12 h-12 text-amber-500/80" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-normal">
                          {!value ? "Waiting for payload" : "Invalid value for format"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mt-4">
                <Button 
                  onClick={downloadPNG} 
                  variant="outline" 
                  disabled={!value || !validation.isValid}
                  className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 border-[3px] border-slate-200 dark:border-slate-800 border-b-[6px] hover:border-b-[4px] active:border-b-2 active:translate-y-[4px] transition-all gap-2 flex items-center justify-center select-none shadow-sm disabled:opacity-45 disabled:pointer-events-none"
                >
                   <Download className="w-4 h-4 text-emerald-600" /> PNG
                </Button>
                <Button 
                  onClick={downloadSVG} 
                  disabled={!value || !validation.isValid}
                  className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-700 border-b-[6px] hover:border-b-[4px] active:border-b-2 active:translate-y-[4px] transition-all gap-2 flex items-center justify-center select-none shadow-[0_4px_0_0_rgba(79,70,229,0.15)] disabled:opacity-45 disabled:pointer-events-none"
                >
                   <Download className="w-4 h-4 text-white" /> SVG
                </Button>
              </div>

              <div className="w-full flex flex-col gap-2 mt-2">
                <div className="text-[9px] font-black text-center text-muted-foreground uppercase tracking-widest opacity-75">Clipboard Share Options</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={copySVGToClipboard}
                    variant="ghost" 
                    disabled={!value || !validation.isValid}
                    className="h-10 rounded-xl font-bold uppercase text-[9px] tracking-wider border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 transition-all cursor-pointer disabled:opacity-40"
                  >
                     <Copy className="w-3.5 h-3.5 text-primary" /> Copy SVG Code
                  </Button>
                  <Button 
                    onClick={copyPNGToClipboard}
                    variant="ghost" 
                    disabled={!value || !validation.isValid}
                    className="h-10 rounded-xl font-bold uppercase text-[9px] tracking-wider border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 transition-all cursor-pointer disabled:opacity-40"
                  >
                     <Copy className="w-3.5 h-3.5 text-emerald-600" /> Copy PNG Image
                  </Button>
                </div>
              </div>

              <div className="w-full p-4 bg-muted/30 rounded-2xl border border-border/50">
                 <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Industrial Specs</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="text-[10px] font-bold opacity-60">FORMAT: {format}</div>
                    <div className="text-[10px] font-bold opacity-60">VALUE: {value.length} chars</div>
                 </div>
              </div>

              {/* Promo link banner trigger to enterprise invoice maker */}
              <div className="w-full p-4.5 bg-gradient-to-br from-indigo-50/70 to-indigo-100/30 dark:from-slate-950/40 dark:to-slate-950/20 rounded-[2rem] border border-indigo-200/50 dark:border-slate-800/80 shadow-inner space-y-3 pt-4 text-center mt-2 animate-fade-in">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-850 dark:text-indigo-400">Integrated Business Billing</h4>
                  <p className="text-[9px] text-muted-foreground leading-snug">Generate enterprise invoice templates with auto-compiled QR pay configurations instantly.</p>
                </div>
                
                <Link to="/tools/invoice" className="block w-full">
                  <Button 
                    type="button" 
                    className="w-full h-11 rounded-xl font-extrabold uppercase text-[9px] tracking-wider bg-indigo-600 hover:bg-indigo-650 text-white border-b-4 border-indigo-900 active:border-b-0 active:translate-y-[4px] shadow-sm transition-all gap-1.5 flex items-center justify-center select-none"
                  >
                    📄 Try Corporate Invoice Creator
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
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
                    <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">Your label was successfully exported</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 rounded-3xl border border-dashed border-border/60">
                   <p className="text-sm font-medium leading-relaxed">
                     Your high-precision barcode label has been fully generated and downloaded. It is optimized for retail scanning, scanning redundancy, and product catalog sync.
                   </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {localStorage.getItem("tooleefy_hide_value_page") !== "true" && (
                    <Button 
                      onClick={() => navigate("/value-our-tools")}
                      className="h-14 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border-b-[6px] border-primary/40 hover:border-b-[4px] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2 group shadow-lg"
                    >
                      <Star className="w-4 h-4 fill-current group-hover:animate-spin-slow" />
                      Value our Tools
                    </Button>
                  )}
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
