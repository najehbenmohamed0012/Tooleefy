import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdvancedQRPreview } from "./AdvancedQRPreview";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, Link as LinkIcon, Mail, Phone, Wifi, 
  User, Settings2, Image as ImageIcon, Layers, 
  Check, RefreshCw, Smartphone, MessageSquare,
  MapPin, Calendar, Bitcoin, MessageCircle,
  Twitter, Linkedin, Instagram, Facebook, Globe, CheckCircle2,
  Star, Trophy
} from "lucide-react";
import { QRStyleSettings } from "./QRStyleSettings";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import QRCodeStyling from "qr-code-styling";
import { Logo } from "@/components/Logo";
import { logActivity } from "@/supabase/db";

export function SingleQRGenerator() {
  const navigate = useNavigate();
  const [showCongrats, setShowCongrats] = useState(false);
  const [type, setType] = useState("url");
  
  // Content States
  const [url, setUrl] = useState("https://tooleefy.com");
  const [text, setText] = useState("");
  const [email, setEmail] = useState({ to: "", subject: "", body: "" });
  const [phone, setPhone] = useState("");
  const [sms, setSms] = useState({ number: "", message: "" });
  const [whatsapp, setWhatsapp] = useState({ number: "", message: "" });
  const [wifi, setWifi] = useState({ ssid: "", password: "", encryption: "WPA" });
  const [vcard, setVcard] = useState({ name: "", org: "", role: "", phone: "", email: "", url: "", note: "" });
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [crypto, setCrypto] = useState({ coin: "bitcoin", address: "", amount: "" });
  const [event, setEvent] = useState({ title: "", start: "", end: "", location: "", desc: "" });
  const [social, setSocial] = useState({ platform: "instagram", username: "" });
  const [payment, setPayment] = useState({ platform: "paypal", identifier: "", amount: "", currency: "USD" });
  const [appStore, setAppStore] = useState({ apple: "", google: "" });
  const [meeting, setMeeting] = useState({ platform: "zoom", id: "", password: "" });
  const [review, setReview] = useState({ platform: "google", placeId: "" });

  const [qrValue, setQrValue] = useState("https://tooleefy.com");

  // Styling States
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

  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  const categories = [
    { id: "url", icon: LinkIcon, label: "URL" },
    { id: "text", icon: MessageSquare, label: "Text" },
    { id: "social", icon: Instagram, label: "Social" },
    { id: "payment", icon: Bitcoin, label: "Payment" },
    { id: "meeting", icon: Globe, label: "Meeting" },
    { id: "review", icon: CheckCircle2, label: "Review" },
    { id: "mail", icon: Mail, label: "Email" },
    { id: "phone", icon: Phone, label: "Phone" },
    { id: "sms", icon: Smartphone, label: "SMS" },
    { id: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
    { id: "wifi", icon: Wifi, label: "WiFi" },
    { id: "vcard", icon: User, label: "vCard" },
    { id: "location", icon: MapPin, label: "Location" },
    { id: "crypto", icon: Bitcoin, label: "Crypto" },
    { id: "event", icon: Calendar, label: "Event" },
    { id: "appstore", icon: Smartphone, label: "App Store" },
  ];

  useEffect(() => {
    switch (type) {
      case "url": setQrValue(url || "https://tooleefy.com"); break;
      case "text": setQrValue(text || "Tooleefy Text"); break;
      case "mail": setQrValue(`mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`); break;
      case "phone": setQrValue(`tel:${phone}`); break;
      case "sms": setQrValue(`smsto:${sms.number}:${sms.message}`); break;
      case "whatsapp": setQrValue(`https://wa.me/${whatsapp.number.replace(/\+/g, '')}?text=${encodeURIComponent(whatsapp.message)}`); break;
      case "wifi": setQrValue(`WIFI:S:${wifi.ssid};T:${wifi.encryption};P:${wifi.password};;`); break;
      case "vcard": setQrValue(`BEGIN:VCARD\nVERSION:3.0\nN:${vcard.name}\nORG:${vcard.org}\nTITLE:${vcard.role}\nTEL:${vcard.phone}\nEMAIL:${vcard.email}\nURL:${vcard.url}\nNOTE:${vcard.note}\nEND:VCARD`); break;
      case "location": setQrValue(`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`); break;
      case "crypto": setQrValue(`${crypto.coin}:${crypto.address}${crypto.amount ? `?amount=${crypto.amount}` : ''}`); break;
      case "event": setQrValue(`BEGIN:VEVENT\nSUMMARY:${event.title}\nDTSTART:${event.start.replace(/[-:]/g, '')}\nDTEND:${event.end.replace(/[-:]/g, '')}\nLOCATION:${event.location}\nDESCRIPTION:${event.desc}\nEND:VEVENT`); break;
      case "social": {
        const base: Record<string, string> = {
          instagram: "https://instagram.com/",
          twitter: "https://twitter.com/",
          facebook: "https://facebook.com/",
          linkedin: "https://linkedin.com/in/",
          tiktok: "https://tiktok.com/@",
          youtube: "https://youtube.com/@",
          telegram: "https://t.me/",
        };
        setQrValue(social.username ? `${base[social.platform]}${social.username}` : "https://tooleefy.com");
        break;
      }
      case "payment": {
         if (payment.platform === "paypal") {
           setQrValue(`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${payment.identifier}&amount=${payment.amount}&currency_code=${payment.currency}`);
         } else if (payment.platform === "venmo") {
           setQrValue(`https://venmo.com/${payment.identifier}?txn=pay&amount=${payment.amount}&note=QR%20Payment`);
         }
         break;
      }
      case "appstore": setQrValue(appStore.apple || appStore.google || "https://tooleefy.com"); break;
      case "meeting": {
        if (meeting.platform === "zoom") setQrValue(`https://zoom.us/j/${meeting.id}?pwd=${meeting.password}`);
        else if (meeting.platform === "teams") setQrValue(meeting.id);
        else setQrValue(`skype:${meeting.id}?chat`);
        break;
      }
      case "review": {
         if (review.platform === "google") setQrValue(`https://search.google.com/local/writereview?placeid=${review.placeId}`);
         else setQrValue(`https://www.trustpilot.com/review/${review.placeId}`);
         break;
      }
    }
  }, [type, url, text, email, phone, sms, whatsapp, wifi, vcard, location, crypto, event, social, payment, appStore, meeting, review]);

  const compileCombinedSVG = () => {
    // We target the live preview's wrapper
    const container = document.querySelector(".qr-preview-container");
    const svgElement = container?.querySelector("svg") as SVGSVGElement | null;
    if (!svgElement) return "";

    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Clean up background bounding rects from the QR canvas
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
    const sizeAttr = clonedSvg.getAttribute("width") || "1000";
    // Remove declarations and namespaces
    svgData = svgData.replace(/<\?xml.*?\?>/g, "").replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "");

    const currentBg = bgUseGradient ? bgColor : bgColor;
    const currentLine = frameColor || fgColor;

    const width = 340;
    const height = 420;

    // QR layout mapping coords
    const scaledWidth = 240;
    const scaledHeight = 240;
    const offsetX = 50;
    const offsetY = 100;

    // Safely extract paths
    const openTagIndex = svgData.indexOf(">");
    const closeTagIndex = svgData.lastIndexOf("</svg>");
    const svgContent = (openTagIndex !== -1 && closeTagIndex !== -1)
      ? svgData.substring(openTagIndex + 1, closeTagIndex)
      : svgData;

    let frameContents = "";

    if (frameStyle === "smart-badge") {
      frameContents = `
        <rect x="150" y="14" width="40" height="9" rx="4.5" fill="${currentLine}" />
        <text x="170" y="45" text-anchor="middle" font-family="sans-serif" font-size="10px" font-weight="900" fill="${currentLine}" letter-spacing="0.12em">SECURITY PASS GATE</text>
        <text x="170" y="60" text-anchor="middle" font-family="monospace" font-size="7px" font-weight="700" fill="${currentLine}" opacity="0.6">• TRUSTED ACCESS •</text>
        <line x1="40" y1="75" x2="300" y2="75" stroke="${currentLine}" stroke-width="1" stroke-dasharray="1 3" opacity="0.4" />
        <rect x="30" y="360" width="280" height="34" rx="10" fill="${currentLine}" />
        <text x="170" y="381" text-anchor="middle" font-family="sans-serif" font-size="11px" font-weight="950" fill="${bgColor}" letter-spacing="0.05em">${frameText.toUpperCase()}</text>
      `;
    } else if (frameStyle === "retro-ticket") {
      frameContents = `
        <path d="M 0 0 L 0 160 A 15 15 0 0 0 0 190 L 0 420 L 340 420 L 340 190 A 15 15 0 0 0 340 160 L 340 0 Z" fill="${currentBg}" stroke="${currentLine}" stroke-width="2" />
        <line x1="20" y1="175" x2="320" y2="175" stroke="${currentLine}" stroke-width="1.5" stroke-dasharray="3 5" stroke-opacity="0.3" />
        <text x="30" y="45" font-family="monospace" font-size="9px" font-weight="900" fill="${currentLine}">ADMIT ONE TICK</text>
        <text x="310" y="45" text-anchor="end" font-family="monospace" font-size="9px" font-weight="900" fill="${currentLine}">NO. #4829</text>
        <line x1="30" y1="355" x2="310" y2="355" stroke="${currentLine}" stroke-width="2" />
        <text x="170" y="385" text-anchor="middle" font-family="sans-serif" font-size="13px" font-weight="900" fill="${currentLine}" letter-spacing="0.1em">${frameText.toUpperCase()}</text>
      `;
    } else if (frameStyle === "bracket-technical") {
      frameContents = `
        <path d="M 30 70 L 30 50 L 50 50" stroke="${currentLine}" stroke-width="3" fill="none" />
        <path d="M 310 70 L 310 50 L 290 50" stroke="${currentLine}" stroke-width="3" fill="none" />
        <path d="M 30 370 L 30 390 L 50 390" stroke="${currentLine}" stroke-width="3" fill="none" />
        <path d="M 310 370 L 310 390 L 290 390" stroke="${currentLine}" stroke-width="3" fill="none" />
        <text x="45" y="38" font-family="monospace" font-size="8px" font-weight="900" fill="${currentLine}">CORE_DATA_LOCK</text>
        <text x="295" y="38" text-anchor="end" font-family="monospace" font-size="8px" font-weight="900" fill="${currentLine}">COORD.77X_9Y</text>
        <text x="170" y="382" text-anchor="middle" font-family="monospace" font-size="11px" font-weight="900" fill="${currentLine}">&lt; ${frameText.toUpperCase()} &gt;</text>
      `;
    } else if (frameStyle === "stamp-classic") {
      frameContents = `
        <rect x="15" y="15" width="310" height="390" rx="4" fill="none" stroke="${currentLine}" stroke-width="1.5" stroke-dasharray="4 4" />
        <circle cx="280" cy="70" r="30" stroke="${currentLine}" stroke-width="1" fill="none" stroke-dasharray="1 2" opacity="0.4" />
        <text x="280" y="73" text-anchor="middle" font-family="sans-serif" font-size="7px" font-weight="800" fill="${currentLine}" transform="rotate(-12 280 70)" opacity="0.7">PAR AVION</text>
        <rect x="35" y="35" width="35" height="42" rx="3" fill="none" stroke="${currentLine}" stroke-width="1.5" />
        <text x="52" y="61" text-anchor="middle" font-family="serif" font-size="13px" font-weight="900" fill="${currentLine}">25¢</text>
        <line x1="40" y1="365" x2="300" y2="365" stroke="${currentLine}" stroke-width="1" stroke-dasharray="2 4" />
        <text x="170" y="388" text-anchor="middle" font-family="serif" font-size="12px" font-weight="900" fill="${currentLine}" letter-spacing="0.1em">${frameText.toUpperCase()}</text>
      `;
    } else if (frameStyle === "bubble-retro") {
      frameContents = `
        <path d="M 50 15 L 290 15 C 310 15, 320 25, 320 40 L 320 75 C 320 90, 310 100, 290 100 L 195 100 L 170 123 L 145 100 L 50 100 C 30 100, 20 90, 20 75 L 20 40 C 20 25, 30 15, 50 15 Z" fill="${currentLine}" />
        <text x="170" y="60" text-anchor="middle" font-family="sans-serif" font-size="13px" font-weight="950" fill="${bgColor}">${frameText.toUpperCase()}</text>
        <text x="170" y="385" text-anchor="middle" font-family="sans-serif" font-size="8px" font-weight="900" fill="${currentLine}" letter-spacing="0.12em" opacity="0.7">SAY HELLO • PLACE SCAN</text>
      `;
    } else if (frameStyle === "comic-pop") {
      frameContents = `
        <rect x="6" y="6" width="328" height="408" fill="none" stroke="${currentLine}" stroke-width="3" rx="12" />
        <polygon points="280,30 290,40 305,40 300,55 312,65 295,70 290,85 280,75 265,80 270,65 258,55 275,50" fill="#facc15" stroke="${currentLine}" stroke-width="2.5" />
        <text x="284" y="58" text-anchor="middle" font-family="Arial" font-size="8px" font-weight="950" fill="${currentLine}">BOOM</text>
        <g transform="skewX(-6) translate(10, 0)">
          <rect x="30" y="358" width="260" height="36" fill="#ef4444" stroke="${currentLine}" stroke-width="3" rx="4" />
          <text x="160" y="381" text-anchor="middle" font-family="Arial" font-size="11px" font-weight="950" fill="#ffffff">${frameText.toUpperCase()}</text>
        </g>
      `;
    }

    // Determine background gradient
    const fillDef = bgUseGradient
      ? `<defs>
           <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stop-color="${bgColor}" />
             <stop offset="100%" stop-color="${bgColor2}" />
           </linearGradient>
         </defs>
         <rect width="${width}" height="${height}" rx="32" fill="url(#bgGrad)" />`
      : `<rect width="${width}" height="${height}" rx="32" fill="${bgColor}" />`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    /* Ensure scanning elements are solid styled correctly */
    .qr-nested path:not([fill="transparent"]):not([fill="none"]),
    .qr-nested rect:not([fill="transparent"]):not([fill="none"]) { fill: ${fgColor} !important; }
  </style>
  
  ${fillDef}
  
  ${frameContents}
  
  <g class="qr-nested">
    <svg x="${offsetX}" y="${offsetY}" width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${sizeAttr} ${sizeAttr}">
      ${svgContent}
    </svg>
  </g>
</svg>`;
  };

  const downloadSVG = () => {
    if (frameStyle && frameStyle !== "none") {
      const svgData = compileCombinedSVG();
      if (!svgData) {
        toast.error("Compilation error. Live canvas readying.");
        return;
      }
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const a = document.createElement("a");
      a.download = `framed-qr-${Date.now()}.svg`;
      a.href = url;
      a.click();
      toast.success("Vector Framed SVG downloaded");
      setShowCongrats(true);
      logActivity({
        tool_type: 'qr',
        name: 'Framed QR Code',
        status: 'Downloaded SVG'
      });
    } else if (qrInstanceRef.current) {
      qrInstanceRef.current.download({ name: `qr-${Date.now()}`, extension: "svg" });
      toast.success("Vector SVG downloaded");
      setShowCongrats(true);
      logActivity({
        tool_type: 'qr',
        name: 'Single QR Code',
        status: 'Downloaded SVG'
      });
    }
  };

  const downloadPNG = () => {
    if (frameStyle && frameStyle !== "none") {
      const svgData = compileCombinedSVG();
      if (!svgData) {
        toast.error("Compilation error. Live canvas readying.");
        return;
      }
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Double the dimensions for razor sharp retina outputs
        canvas.width = 340 * 3;
        canvas.height = 420 * 3;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "transparent";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(3, 3);
          ctx.drawImage(img, 0, 0);
          
          const pngUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.download = `framed-qr-${Date.now()}.png`;
          a.href = pngUrl;
          a.click();
          toast.success("Retina Framed PNG downloaded");
          setShowCongrats(true);
          logActivity({
            tool_type: 'qr',
            name: 'Framed QR Code',
            status: 'Downloaded PNG'
          });
        }
      };
      img.src = url;
    } else if (qrInstanceRef.current) {
      qrInstanceRef.current.download({ name: `qr-${Date.now()}`, extension: "png" });
      toast.success("High-res PNG downloaded");
      setShowCongrats(true);
      logActivity({
        tool_type: 'qr',
        name: 'Single QR Code',
        status: 'Downloaded PNG'
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-black tracking-tight uppercase">Content Data</h2>
              </div>

              <Tabs value={type} onValueChange={setType} className="space-y-6 flex flex-col w-full">
                <div className="w-full overflow-x-auto scrollbar-hide pb-1">
                  <TabsList className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1.5 rounded-2xl flex flex-row items-center h-auto shadow-sm w-max min-w-full shrink-0 flex-nowrap justify-start">
                    {categories.map(t => (
                      <TabsTrigger 
                        key={t.id} 
                        value={t.id} 
                        className="flex items-center justify-start rounded-xl px-4 py-2.5 font-bold text-xs gap-2 transition-all duration-100 text-muted-foreground hover:text-foreground hover:bg-slate-50/50 dark:hover:bg-slate-800/60 bg-transparent shrink-0 w-auto !h-auto select-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm border-none"
                      >
                        <t.icon className="w-4 h-4 shrink-0 text-muted-foreground data-[state=active]:text-emerald-500" />
                        <span>{t.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="pt-2">
                  <TabsContent value="url" className="mt-0">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Destination URL</Label>
                      <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="h-16 text-xl font-bold rounded-2xl bg-muted/30 border-none px-6 focus-visible:ring-primary/20" />
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="mt-0">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Plain Text Content</Label>
                      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type something here..." className="min-h-[120px] rounded-2xl bg-muted/30 border-none px-6 py-4 focus-visible:ring-primary/20 text-lg font-medium" />
                    </div>
                  </TabsContent>

                  <TabsContent value="mail" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Recipient Email</Label>
                        <Input placeholder="hello@example.com" value={email.to} onChange={e => setEmail({...email, to: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Subject</Label>
                        <Input placeholder="Inquiry" value={email.subject} onChange={e => setEmail({...email, subject: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Message Body</Label>
                      <Textarea placeholder="How can we help?" value={email.body} onChange={e => setEmail({...email, body: e.target.value})} className="min-h-[100px] rounded-xl" />
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="mt-0">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Phone Number</Label>
                      <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="h-16 text-xl font-bold rounded-2xl bg-muted/30 border-none px-6 focus-visible:ring-primary/20" />
                    </div>
                  </TabsContent>

                  <TabsContent value="sms" className="mt-0 space-y-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Phone Number</Label>
                        <Input type="tel" value={sms.number} onChange={e => setSms({...sms, number: e.target.value})} className="h-12 rounded-xl" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Message</Label>
                        <Textarea value={sms.message} onChange={e => setSms({...sms, message: e.target.value})} className="rounded-xl" />
                     </div>
                  </TabsContent>

                  <TabsContent value="whatsapp" className="mt-0 space-y-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">WhatsApp Number</Label>
                        <Input placeholder="15551234567" value={whatsapp.number} onChange={e => setWhatsapp({...whatsapp, number: e.target.value})} className="h-12 rounded-xl" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Pre-filled Message</Label>
                        <Textarea placeholder="Hello, I'm interested in..." value={whatsapp.message} onChange={e => setWhatsapp({...whatsapp, message: e.target.value})} className="rounded-xl" />
                     </div>
                  </TabsContent>

                  <TabsContent value="wifi" className="mt-0 grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Network SSID</Label>
                      <Input value={wifi.ssid} onChange={e => setWifi({...wifi, ssid: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Encryption</Label>
                      <Select value={wifi.encryption} onValueChange={v => setWifi({...wifi, encryption: v})}>
                        <SelectTrigger className="h-12 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800 border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-[2px] transition-all bg-white dark:bg-slate-900 shadow-sm text-left"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WPA">WPA/WPA2</SelectItem>
                          <SelectItem value="WEP">WEP</SelectItem>
                          <SelectItem value="nopass">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Password</Label>
                      <Input type="password" value={wifi.password} onChange={e => setWifi({...wifi, password: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </TabsContent>

                  <TabsContent value="vcard" className="mt-0 grid grid-cols-1 gap-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Full Name</Label>
                        <Input value={vcard.name} onChange={e => setVcard({...vcard, name: e.target.value})} className="h-12 rounded-xl" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Organization</Label>
                        <Input value={vcard.org} onChange={e => setVcard({...vcard, org: e.target.value})} className="h-12 rounded-xl" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email</Label>
                        <Input value={vcard.email} onChange={e => setVcard({...vcard, email: e.target.value})} className="h-12 rounded-xl" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Phone</Label>
                        <Input value={vcard.phone} onChange={e => setVcard({...vcard, phone: e.target.value})} className="h-12 rounded-xl" />
                     </div>
                  </TabsContent>
                  
                  <TabsContent value="location" className="mt-0 grid grid-cols-1 gap-4">
                     <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Latitude</Label><Input placeholder="40.7128" value={location.lat} onChange={e => setLocation({...location, lat: e.target.value})} className="h-12 rounded-xl" /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Longitude</Label><Input placeholder="-74.0060" value={location.lng} onChange={e => setLocation({...location, lng: e.target.value})} className="h-12 rounded-xl" /></div>
                  </TabsContent>

                  <TabsContent value="crypto" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Asset</Label><Select value={crypto.coin} onValueChange={v => setCrypto({...crypto, coin: v})}><SelectTrigger className="h-12 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800 border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-[2px] transition-all bg-white dark:bg-slate-900 shadow-sm text-left"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bitcoin">Bitcoin</SelectItem><SelectItem value="ethereum">Ethereum</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Amount</Label><Input type="number" step="0.0001" placeholder="0.0" value={crypto.amount} onChange={e => setCrypto({...crypto, amount: e.target.value})} className="h-12 rounded-xl" /></div>
                    </div>
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Wallet Address</Label><Input placeholder="Address" value={crypto.address} onChange={e => setCrypto({...crypto, address: e.target.value})} className="h-12 rounded-xl" /></div>
                  </TabsContent>

                  <TabsContent value="social" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Platform</Label><Select value={social.platform} onValueChange={v => setSocial({...social, platform: v})}><SelectTrigger className="h-12 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800 border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-[2px] transition-all bg-white dark:bg-slate-900 shadow-sm text-left"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="twitter">Twitter</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Handle</Label><Input placeholder="@username" value={social.username} onChange={e => setSocial({...social, username: e.target.value})} className="h-12 rounded-xl" /></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="meeting" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Platform</Label><Select value={meeting.platform} onValueChange={v => setMeeting({...meeting, platform: v})}><SelectTrigger className="h-12 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800 border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-[2px] transition-all bg-white dark:bg-slate-900 shadow-sm text-left"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="zoom">Zoom</SelectItem><SelectItem value="teams">Teams</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">ID</Label><Input value={meeting.id} onChange={e => setMeeting({...meeting, id: e.target.value})} className="h-12 rounded-xl" /></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="payment" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Platform</Label>
                        <Select value={payment.platform} onValueChange={v => setPayment({...payment, platform: v})}>
                          <SelectTrigger className="h-12 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800 border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-[2px] transition-all bg-white dark:bg-slate-900 shadow-sm text-left"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="venmo">Venmo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email / Username</Label>
                        <Input placeholder={payment.platform === "paypal" ? "paypal@example.com" : "username"} value={payment.identifier} onChange={e => setPayment({...payment, identifier: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Amount</Label>
                        <Input type="number" placeholder="0.00" value={payment.amount} onChange={e => setPayment({...payment, amount: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Currency</Label>
                        <Select value={payment.currency} onValueChange={v => setPayment({...payment, currency: v})}>
                          <SelectTrigger className="h-12 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800 border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-[2px] transition-all bg-white dark:bg-slate-900 shadow-sm text-left"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="review" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Platform</Label>
                        <Select value={review.platform} onValueChange={v => setReview({...review, platform: v})}>
                          <SelectTrigger className="h-12 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800 border-b-4 hover:border-b-4 active:border-b-2 active:translate-y-[2px] transition-all bg-white dark:bg-slate-900 shadow-sm text-left"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">Google Reviews</SelectItem>
                            <SelectItem value="trustpilot">Trustpilot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                          {review.platform === "google" ? "Place ID" : "Business Domain Name"}
                        </Label>
                        <Input placeholder={review.platform === "google" ? "ChIJN1t_tDeuEmsRUsoyG83A16Y" : "yourbusiness.com"} value={review.placeId} onChange={e => setReview({...review, placeId: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="event" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Event Title</Label>
                      <Input placeholder="Product Launch Presentation" value={event.title} onChange={e => setEvent({...event, title: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Start Date & Time</Label>
                        <Input type="datetime-local" value={event.start} onChange={e => setEvent({...event, start: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">End Date & Time</Label>
                        <Input type="datetime-local" value={event.end} onChange={e => setEvent({...event, end: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Location</Label>
                      <Input placeholder="123 Innovation Way, San Francisco" value={event.location} onChange={e => setEvent({...event, location: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Description</Label>
                      <Textarea placeholder="Join us to celebrate..." value={event.desc} onChange={e => setEvent({...event, desc: e.target.value})} className="min-h-[80px] rounded-xl" />
                    </div>
                  </TabsContent>

                  <TabsContent value="appstore" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Apple App Store URL</Label>
                        <Input placeholder="https://apps.apple.com/..." value={appStore.apple} onChange={e => setAppStore({...appStore, apple: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Google Play Store URL</Label>
                        <Input placeholder="https://play.google.com/..." value={appStore.google} onChange={e => setAppStore({...appStore, google: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </Card>

          <Card className="p-10 border-none shadow-premium rounded-[3rem] bg-card mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase italic">Precision Workspace</h2>
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

              // Elite Custom Bindings
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
        </div>

        <div className="lg:col-span-4 sticky top-8 space-y-8">
          <Card className="p-10 border-none shadow-premium rounded-[3rem] bg-card overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            <div className="flex flex-col items-center gap-8">
              <div className="text-center space-y-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Live Preview</h3>
                <p className="text-[10px] font-bold text-primary/60 uppercase">Real-time vector rendering</p>
              </div>

              <div className={`relative group w-full max-w-[280px] flex items-center justify-center transition-all duration-300 ${
                frameStyle && frameStyle !== "none" ? "aspect-[340/420]" : "aspect-square"
              }`}>
                <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className={`qr-preview-container relative z-10 w-full h-full rounded-[2.5rem] flex items-center justify-center overflow-hidden animate-fade-in ${
                  frameStyle && frameStyle !== "none" 
                    ? "p-0 border-none bg-transparent shadow-none" 
                    : "p-6 border border-white/20 bg-white/50 backdrop-blur-sm shadow-xl"
                }`}
                     style={
                       frameStyle && frameStyle !== "none" 
                         ? {} 
                         : { 
                             background: bgUseGradient 
                               ? `linear-gradient(${bgGradientRotation}deg, ${bgColor}, ${bgColor2})` 
                               : bgColor 
                           }
                     }>
                  <AdvancedQRPreview 
                    value={qrValue}
                    size={1000}
                    fgColor={fgColor}
                    bgColor={bgColor}
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
                    qrRef={qrInstanceRef}
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
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mt-4">
                <Button 
                  onClick={downloadPNG} 
                  variant="outline" 
                  className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 border-[3px] border-slate-200 dark:border-slate-800 border-b-[6px] hover:border-b-[4px] active:border-b-2 active:translate-y-[4px] transition-all gap-2 flex items-center justify-center select-none shadow-sm"
                >
                   <Download className="w-4 h-4 text-emerald-600" /> PNG
                </Button>
                <Button 
                  onClick={downloadSVG} 
                  className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-700 border-b-[6px] hover:border-b-[4px] active:border-b-2 active:translate-y-[4px] transition-all gap-2 flex items-center justify-center select-none shadow-[0_4px_0_0_rgba(79,70,229,0.15)]"
                >
                   <Download className="w-4 h-4 text-white" /> SVG
                </Button>
              </div>

              <div className="w-full p-4 bg-muted/30 rounded-2xl border border-border/50">
                 <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-3 h-3 text-primary animate-spin-slow" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Encryption Status</span>
                 </div>
                 <p className="text-[10px] font-mono break-all opacity-50 line-clamp-2">{qrValue}</p>
              </div>

              {/* Promo link banner trigger to enterprise invoice maker */}
              <div className="w-full p-4.5 bg-gradient-to-br from-indigo-50/70 to-indigo-100/30 dark:from-slate-950/40 dark:to-slate-950/20 rounded-[2rem] border border-indigo-200/50 dark:border-slate-800/80 shadow-inner space-y-3 pt-4 text-center">
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
                    <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">Your QR Code was successfully exported</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 rounded-3xl border border-dashed border-border/60">
                   <p className="text-sm font-medium leading-relaxed">
                     Your custom-branded QR code has been successfully generated & exported. It features specialized vector alignment constraints and is ready for cross-platform scanning.
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
