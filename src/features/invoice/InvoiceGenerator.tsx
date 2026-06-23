import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogTrigger,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { 
  Building2, Hash, Landmark, Truck, Signature, LayoutTemplate, Eye,
  Download, Plus, Trash2, FileText, ShieldCheck, 
  Image as ImageIcon, Globe, DollarSign, Calendar, 
  Settings2, Percent, CreditCard, Type,
  QrCode, Barcode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { InvoicePreview } from "./InvoicePreview";
import { FAQSection } from "./FAQSection";
import { ValueBanner } from "@/components/ValueBanner";
import { Logo } from "@/components/Logo";
import { Star, Trophy } from "lucide-react";
import { logActivity } from "@/supabase/db";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

const CURRENCIES = [
  { label: "USD ($)", value: "USD", symbol: "$" },
  { label: "EUR (€)", value: "EUR", symbol: "€" },
  { label: "GBP (£)", value: "GBP", symbol: "£" },
  { label: "JPY (¥)", value: "JPY", symbol: "¥" },
  { label: "AUD ($)", value: "AUD", symbol: "$" },
  { label: "CAD ($)", value: "CAD", symbol: "$" },
];

export function InvoiceGenerator() {
  const navigate = useNavigate();
  const [showCongrats, setShowCongrats] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  
  const [businessName, setBusinessName] = useState("Your Business Name");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessTaxId, setBusinessTaxId] = useState("");
  
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientTaxId, setClientTaxId] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-001`);
  const [poNumber, setPoNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  
  const [showShipping, setShowShipping] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [iban, setIban] = useState("");
  const [swift, setSwift] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  const [template, setTemplate] = useState("modern");
  const [taxLabel, setTaxLabel] = useState("Tax");
  const [invoiceColor, setInvoiceColor] = useState("#000000"); // Standard black as default for high contrast
  
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consulting Services', quantity: 1, rate: 1500 }
  ]);

  React.useEffect(() => {
    document.title = "Enterprise Invoice Generator | Professional Business Invoicing Tool";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Generate professional enterprise invoices for free with our powerful invoicing tool. Features custom themes, QR codes, bank details, and automated tax calculations for small businesses and freelancers.");
    }
  }, []);
  
  const [taxRate, setTaxRate] = useState(15);
  const [discountRate, setDiscountRate] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment is due within 30 days. Please include invoice number on all payments.");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const discountAmount = (subtotal * discountRate) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount + shippingCost;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const brandColorRgb = hexToRgb(invoiceColor);
    
    // Theme flags
    const isNeo = template === 'neo';
    const isClassic = template === 'classic';
    const isMinimal = template === 'minimal';
    const isFuturistic = template === 'futuristic';
    const isBold = template === 'bold';
    const isLuxury = template === 'luxury';
    const isIndustrial = template === 'industrial';

    let currentY = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const checkPageBreak = (neededHeight: number) => {
      if (currentY + neededHeight > pageHeight - 20) {
        doc.addPage();
        if (isFuturistic) {
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }
        currentY = 20;
        return true;
      }
      return false;
    };

    // Global background for Futuristic
    if (isFuturistic) {
      doc.setFillColor(15, 23, 42); // slate-950 roughly
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
    if (isLuxury) {
      doc.setFillColor(255, 253, 250); // Creamy background
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
    if (isIndustrial) {
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    // Header Accents
    if (isClassic) {
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 5, 'F');
    } else if (isNeo) {
      doc.setDrawColor(0);
      doc.setLineWidth(2);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');
    } else if (isIndustrial) {
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 15, 'F');
    } else if (isLuxury) {
      doc.setFillColor(212, 175, 55); // Gold
      doc.rect(0, 0, pageWidth, 2, 'F');
    } else if (!isMinimal && !isFuturistic) {
      doc.setFillColor(brandColorRgb[0], brandColorRgb[1], brandColorRgb[2]);
      doc.rect(0, 0, pageWidth, 4, 'F');
    }

    if (isFuturistic) {
      doc.setFillColor(brandColorRgb[0], brandColorRgb[1], brandColorRgb[2]);
      doc.rect(0, 0, pageWidth, 1, 'F');
    }

    // Logo & Business Details
    if (logo) {
      if (isNeo) {
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(margin - 1, currentY - 1, 27, 27, 'S');
      }
      doc.addImage(logo, 'PNG', margin, currentY, 25, 25);
    }

    const businessX = logo ? margin + 30 : margin;
    const formatNumberPDF = (num: number) => {
      const parts = num.toFixed(2).split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    };

    const isSerif = isClassic || isLuxury;
    const isMono = isIndustrial;

    doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "bold");
    doc.setFontSize(isSerif ? 20 : 18);
    
    if (isFuturistic) doc.setTextColor(255, 255, 255);
    else if (isNeo || isIndustrial) doc.setTextColor(0, 0, 0);
    else if (isLuxury) doc.setTextColor(26, 26, 26);
    else doc.setTextColor(brandColorRgb[0], brandColorRgb[1], brandColorRgb[2]);
    
    const splitBusinessName = doc.splitTextToSize(businessName.toUpperCase(), 80);
    doc.text(splitBusinessName, businessX, currentY + 8);
    
    const businessNameHeight = (splitBusinessName.length * 7);
    let businessDetailsY = currentY + 12 + businessNameHeight;

    doc.setFontSize(9);
    doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "normal");
    doc.setTextColor(isFuturistic ? 160 : 100);
    
    if (businessAddress) { 
      const splitBusAddr = doc.splitTextToSize(businessAddress, 80);
      doc.text(splitBusAddr, businessX, businessDetailsY); 
      businessDetailsY += (splitBusAddr.length * 4.5) + 2; 
    }
    if (businessEmail) { doc.text(businessEmail, businessX, businessDetailsY); businessDetailsY += 5; }
    if (businessPhone) { doc.text(businessPhone, businessX, businessDetailsY); businessDetailsY += 5; }
    if (businessTaxId) { doc.text(`TAX ID: ${businessTaxId}`, businessX, businessDetailsY); businessDetailsY += 5; }

    // Invoice Title
    if (isBold) {
      doc.setFontSize(60);
      doc.setTextColor(240, 240, 240);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", pageWidth - margin, currentY + 30, { align: 'right', angle: 0 });
    }

    doc.setFontSize(isNeo ? 32 : 24);
    doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "bold");
    if (isFuturistic) doc.setTextColor(255, 255, 255);
    else if (isNeo || isIndustrial) doc.setTextColor(0, 0, 0);
    else if (isMinimal) doc.setTextColor(150);
    else doc.setTextColor(50);
    
    doc.text("INVOICE", pageWidth - margin, currentY + 10, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(isFuturistic ? 120 : 120);
    doc.text(`NUMBER`, pageWidth - 60, currentY + 20);
    doc.setTextColor(isFuturistic ? 255 : 50);
    doc.text(invoiceNumber, pageWidth - margin, currentY + 20, { align: 'right' });

    doc.setTextColor(isFuturistic ? 120 : 120);
    doc.text(`DATE`, pageWidth - 60, currentY + 26);
    doc.setTextColor(isFuturistic ? 255 : 50);
    doc.text(invoiceDate, pageWidth - margin, currentY + 26, { align: 'right' });

    if (dueDate) {
      doc.setTextColor(isFuturistic ? 120 : 120);
      doc.text(`DUE DATE`, pageWidth - 60, currentY + 32);
      doc.setTextColor(brandColorRgb[0], brandColorRgb[1], brandColorRgb[2]);
      doc.text(dueDate, pageWidth - margin, currentY + 32, { align: 'right' });
    }

    currentY = Math.max(businessDetailsY, currentY + 40) + 15;

    // Recipients
    if (!isClassic && !isNeo && !isIndustrial) {
      doc.setDrawColor(isFuturistic ? 40 : 240);
      doc.line(margin, currentY - 10, pageWidth - margin, currentY - 10);
    }
    
    if (isNeo) {
      doc.setDrawColor(0);
      doc.setLineWidth(1);
      doc.setFillColor(165, 243, 252); // Cyan-300
      doc.rect(margin, currentY - 5, 80, 40, 'FD');
    } else if (isIndustrial) {
      doc.setDrawColor(0);
      doc.setLineWidth(1);
      doc.line(margin, currentY - 5, margin + 80, currentY - 5);
      doc.line(margin, currentY - 5, margin, currentY + 35);
    }

    doc.setFontSize(10);
    doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "bold");
    if (isNeo || isIndustrial) doc.setTextColor(0);
    else if (isMinimal) doc.setTextColor(200);
    else if (isLuxury) doc.setTextColor(212, 175, 55);
    else doc.setTextColor(brandColorRgb[0], brandColorRgb[1], brandColorRgb[2]);
    doc.text("BILL TO", margin + (isNeo ? 5 : (isIndustrial ? 5 : 0)), currentY + (isNeo ? 2 : 0));
    
    doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "bold");
    doc.setTextColor(isFuturistic ? 255 : 30);
    doc.text(clientName || "Recipient Name", margin + (isNeo ? 5 : (isIndustrial ? 5 : 0)), currentY + 8 + (isNeo ? 2 : 0));
    
    doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "normal");
    doc.setTextColor(isFuturistic ? 180 : 80);
    let clientDetailsY = currentY + 14 + (isNeo ? 2 : (isIndustrial ? 2 : 0));
    if (clientAddress) { 
      const splitClientAddress = doc.splitTextToSize(clientAddress, 60);
      doc.text(splitClientAddress, margin + (isNeo ? 5 : (isIndustrial ? 5 : 0)), clientDetailsY); 
      clientDetailsY += (splitClientAddress.length * 5); 
    }
    if (clientEmail) { doc.text(clientEmail, margin + (isNeo ? 5 : (isIndustrial ? 5 : 0)), clientDetailsY); clientDetailsY += 5; }
    if (clientTaxId) doc.text(`TAX ID: ${clientTaxId}`, margin + (isNeo ? 5 : (isIndustrial ? 5 : 0)), clientDetailsY);

    if (showShipping && shippingAddress) {
      const shippingX = pageWidth / 2 + 10;
      if (isNeo) {
        doc.setFillColor(255, 165, 243); // Magenta-300
        doc.rect(shippingX - 5, currentY - 5, 80, 40, 'FD');
      }
      doc.setFont(isClassic ? "times" : "helvetica", "bold");
      doc.setTextColor(isNeo ? 0 : brandColorRgb[0], isNeo ? 0 : brandColorRgb[1], isNeo ? 0 : brandColorRgb[2]);
      doc.text("SHIP TO", shippingX, currentY);
      
      doc.setFont(isClassic ? "times" : "helvetica", "normal");
      doc.setTextColor(isFuturistic ? 180 : 80);
      const splitShipping = doc.splitTextToSize(shippingAddress, 60);
      doc.text(splitShipping, shippingX, currentY + 8);
    }

    currentY = Math.max(clientDetailsY + 10, currentY + 35);

    // Items Table Header
    if (isNeo) {
      doc.setFillColor(0, 0, 0);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
      doc.setTextColor(255, 255, 255);
    } else if (isIndustrial) {
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
      doc.setTextColor(255, 255, 255);
    } else if (isLuxury) {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'S');
      doc.setTextColor(212, 175, 55);
    } else {
      doc.setFillColor(isFuturistic ? 30 : 248, isFuturistic ? 41 : 250, isFuturistic ? 59 : 252);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
      doc.setTextColor(isFuturistic ? 150 : 100);
    }
    
    doc.setFontSize(8);
    doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "bold");
    doc.text("DESCRIPTION", margin + 5, currentY + 6.5);
    doc.text("QTY", margin + 100, currentY + 6.5);
    doc.text(`PRICE`, margin + 125, currentY + 6.5);
    doc.text(`AMOUNT`, pageWidth - margin - 5, currentY + 6.5, { align: 'right' });

    currentY += 16;
    doc.setFontSize(9);
    doc.setTextColor(isFuturistic ? 220 : 40);
    doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "normal");

    items.forEach((item) => {
      checkPageBreak(25);
      
      const splitDesc = doc.splitTextToSize(item.description || "Project Item", 90);
      const rowHeight = (splitDesc.length * 5) + 5;
      
      doc.text(splitDesc, margin + 5, currentY);
      doc.text(item.quantity.toString(), margin + 100, currentY);
      doc.text(`${currency.symbol}${formatNumberPDF(item.rate)}`, margin + 125, currentY);
      
      doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "bold");
      doc.text(`${currency.symbol}${formatNumberPDF(item.quantity * item.rate)}`, pageWidth - margin - 5, currentY, { align: 'right' });
      doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "normal");

      doc.setDrawColor(isFuturistic ? 50 : 250);
      doc.setLineWidth(isNeo || isIndustrial ? 0.5 : 0.1);
      doc.line(margin, currentY + rowHeight - 6, pageWidth - margin, currentY + rowHeight - 6);
      currentY += rowHeight;
    });

    // Totals
    currentY += 5;
    checkPageBreak(50);
    const summaryX = pageWidth - margin - 60;
    const valueX = pageWidth - margin - 5;

    doc.setFontSize(9);
    doc.setTextColor(isFuturistic ? 150 : 100);
    doc.text("SUBTOTAL", summaryX, currentY);
    doc.setTextColor(isFuturistic ? 255 : 40);
    doc.text(`${currency.symbol}${formatNumberPDF(subtotal)}`, valueX, currentY, { align: 'right' });

    if (discountAmount > 0) {
      currentY += 7;
      doc.setTextColor(isFuturistic ? 150 : 100);
      doc.text(`DISCOUNT (${discountRate}%)`, summaryX, currentY);
      doc.setTextColor(220, 38, 38);
      doc.text(`-${currency.symbol}${formatNumberPDF(discountAmount)}`, valueX, currentY, { align: 'right' });
    }

    if (shippingCost > 0) {
      currentY += 7;
      doc.setTextColor(isFuturistic ? 150 : 100);
      doc.text("SHIPPING", summaryX, currentY);
      doc.setTextColor(isFuturistic ? 255 : 40);
      doc.text(`${currency.symbol}${formatNumberPDF(shippingCost)}`, valueX, currentY, { align: 'right' });
    }

    currentY += 7;
    doc.setTextColor(isFuturistic ? 150 : 100);
    doc.text(`${taxLabel || 'TAX'} (${taxRate}%)`, summaryX, currentY);
    doc.setTextColor(isFuturistic ? 255 : 40);
    doc.text(`${currency.symbol}${formatNumberPDF(taxAmount)}`, valueX, currentY, { align: 'right' });

    currentY += 10;
    if (isNeo) {
      doc.setFillColor(250, 204, 21); // Yellow-400
      doc.setDrawColor(0);
      doc.setLineWidth(1);
      doc.rect(summaryX - 5, currentY - 6, 65, 12, 'FD');
      doc.setTextColor(0);
    } else if (isIndustrial) {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(0);
      doc.setLineWidth(1.5);
      doc.rect(summaryX - 5, currentY - 6, 65, 12, 'FD');
      doc.setTextColor(0);
    } else if (isLuxury) {
      doc.setFillColor(26, 26, 26);
      doc.rect(summaryX - 5, currentY - 6, 65, 12, 'F');
      doc.setTextColor(212, 175, 55);
    } else {
      doc.setDrawColor(isFuturistic ? 255 : brandColorRgb[0], isFuturistic ? 255 : brandColorRgb[1], isFuturistic ? 255 : brandColorRgb[2]);
      doc.setLineWidth(0.5);
      doc.line(summaryX, currentY - 6, valueX, currentY - 6);
      doc.setTextColor(isFuturistic ? 255 : brandColorRgb[0], isFuturistic ? 255 : brandColorRgb[1], isFuturistic ? 255 : brandColorRgb[2]);
    }
    
    doc.setFontSize(12);
    doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "bold");
    doc.text("TOTAL DUE", summaryX, currentY + (isNeo || isIndustrial || isLuxury ? 2 : 0));
    doc.text(`${currency.symbol}${formatNumberPDF(total)}`, valueX, currentY + (isNeo || isIndustrial || isLuxury ? 2 : 0), { align: 'right' });

    // Footer elements
    currentY += 20;
    
    const footerStartY = currentY;

    if (notes) {
      checkPageBreak(40);
      if (isNeo) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(0);
        doc.rect(margin, currentY - 5, 80, 30, 'FD');
      } else if (isIndustrial) {
        doc.setDrawColor(0);
        doc.rect(margin, currentY - 5, 80, 30, 'S');
      }
      doc.setFontSize(9);
      doc.setTextColor(isNeo || isIndustrial ? 0 : brandColorRgb[0], isNeo || isIndustrial ? 0 : brandColorRgb[1], isNeo || isIndustrial ? 0 : brandColorRgb[2]);
      doc.text("NOTES", margin + (isNeo || isIndustrial ? 5 : 0), currentY);
      doc.setFontSize(8);
      doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "normal");
      doc.setTextColor(isFuturistic ? 150 : 100);
      const splitNotes = doc.splitTextToSize(notes, 80);
      doc.text(splitNotes, margin + (isNeo || isIndustrial ? 5 : 0), currentY + 6);
      currentY += (splitNotes.length * 5) + 15;
    }

    if (terms) {
      checkPageBreak(40);
      if (isNeo) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY - 5, 150, 20, 'FD');
      } else if (isIndustrial) {
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, currentY - 5, 150, 20, 'F');
      }
      doc.setFontSize(9);
      doc.setTextColor(isNeo || isIndustrial ? 0 : brandColorRgb[0], isNeo || isIndustrial ? 0 : brandColorRgb[1], isNeo || isIndustrial ? 0 : brandColorRgb[2]);
      doc.text("TERMS", margin + (isNeo || isIndustrial ? 5 : 0), currentY);
      doc.setFontSize(8);
      doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "normal");
      doc.setTextColor(isFuturistic ? 150 : 100);
      const splitTerms = doc.splitTextToSize(terms, 150);
      doc.text(splitTerms, margin + (isNeo || isIndustrial ? 5 : 0), currentY + 6);
      currentY += (splitTerms.length * 5) + 15;
    }

    // Payment Info & Interactive Add-ons (QR, Barcode, Signature)
    currentY += 10;
    checkPageBreak(60);
    const addOnY = currentY;
    let addOnMaxHeight = 0;

    // LEFT Column: Payment Details
    if (bankName || accountNumber || iban || swift || accountHolder || paymentLink) {
      const bankWidth = 70;
      const bankX = margin;
      
      if (isNeo) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(0);
        doc.rect(bankX, addOnY - 5, bankWidth, 40, 'FD');
      } else if (isIndustrial) {
        doc.setDrawColor(0);
        doc.rect(bankX, addOnY - 5, bankWidth, 40, 'S');
      }
      
      doc.setFontSize(9);
      doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "bold");
      doc.setTextColor(isNeo || isIndustrial ? 0 : (isLuxury ? 212 : brandColorRgb[0]), isNeo || isIndustrial ? 0 : (isLuxury ? 175 : brandColorRgb[1]), isNeo || isIndustrial ? 0 : (isLuxury ? 55 : brandColorRgb[2]));
      
      doc.text("PAYMENT DETAILS", bankX + (isNeo || isIndustrial ? 5 : 0), addOnY);
      
      doc.setFontSize(8);
      doc.setFont(isSerif ? "times" : (isMono ? "courier" : "helvetica"), "normal");
      doc.setTextColor(isFuturistic ? 150 : 100);
      let bankY = addOnY + 6;
      
      if (bankName) { doc.text(`Bank: ${bankName}`, bankX + (isNeo || isIndustrial ? 5 : 0), bankY); bankY += 4.5; }
      if (accountHolder) { doc.text(`Holder: ${accountHolder}`, bankX + (isNeo || isIndustrial ? 5 : 0), bankY); bankY += 4.5; }
      if (accountNumber) { doc.text(`Acc: ${accountNumber}`, bankX + (isNeo || isIndustrial ? 5 : 0), bankY); bankY += 4.5; }
      if (iban) { doc.text(`IBAN: ${iban}`, bankX + (isNeo || isIndustrial ? 5 : 0), bankY); bankY += 4.5; }
      if (swift) { doc.text(`SWIFT: ${swift}`, bankX + (isNeo || isIndustrial ? 5 : 0), bankY); bankY += 4.5; }
      if (paymentLink) {
        doc.setTextColor(isNeo || isIndustrial ? 0 : (isLuxury ? 212 : brandColorRgb[0]), isNeo || isIndustrial ? 0 : (isLuxury ? 175 : brandColorRgb[1]), isNeo || isIndustrial ? 0 : (isLuxury ? 55 : brandColorRgb[2]));
        doc.text(`Link: ${paymentLink}`, bankX + (isNeo || isIndustrial ? 5 : 0), bankY);
      }
      addOnMaxHeight = Math.max(addOnMaxHeight, 45);
    }

    // MIDDLE: QR Code & Barcode
    const qrX = margin + 75;
    if (qrCode) {
      if (isNeo) {
        doc.setDrawColor(0);
        doc.rect(qrX - 1, addOnY - 1, 27, 27, 'S');
      }
      doc.addImage(qrCode, 'PNG', qrX, addOnY, 25, 25);
      doc.setFontSize(7);
      doc.setTextColor(isFuturistic ? 150 : 150);
      doc.text("SCAN TO PAY", qrX, addOnY + 30);
      addOnMaxHeight = Math.max(addOnMaxHeight, 35);
    }
    
    if (barcode) {
      const barcodeY = addOnY + (qrCode ? 35 : 0);
      if (isNeo) {
        doc.setDrawColor(0);
        doc.rect(qrX - 1, barcodeY - 1, 47, 17, 'S');
      }
      doc.addImage(barcode, 'PNG', qrX, barcodeY, 45, 15);
      addOnMaxHeight = Math.max(addOnMaxHeight, (qrCode ? 35 : 0) + 20);
    }

    // RIGHT Column: Signature
    if (signature) {
      const sigWidth = 40;
      const sigX = pageWidth - margin - sigWidth;
      doc.addImage(signature, 'PNG', sigX, addOnY, sigWidth, 18);
      doc.setDrawColor(isFuturistic ? 255 : 200);
      doc.line(sigX, addOnY + 20, pageWidth - margin, addOnY + 20);
      doc.setFontSize(7);
      doc.setTextColor(isFuturistic ? 150 : 150);
      doc.text("AUTHORIZED SIGNATURE", pageWidth - margin, addOnY + 25, { align: 'right' });
      addOnMaxHeight = Math.max(addOnMaxHeight, 35);
    }

    currentY = addOnY + addOnMaxHeight + 10;

    // Page numbers
    const totalPages = doc.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(isFuturistic ? 100 : 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`${invoiceNumber.toLowerCase()}.pdf`);
    logActivity({
      tool_type: 'invoice',
      name: `${invoiceNumber.toUpperCase()}`,
      status: 'Downloaded'
    });
    setShowCongrats(true);
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-[1440px]">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
            <FileText className="w-3 h-3" /> Ultimate Invoicing v3.0
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">Enterprise Invoice Generator.</h1>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-4 xl:gap-6 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-7 space-y-4 xl:space-y-6">
            <Card className="p-6 md:p-8 xl:p-10 border-none shadow-premium rounded-[2.5rem] bg-card">
              <Tabs defaultValue="company" className="w-full">
                <div className="w-full overflow-x-auto scrollbar-hide mb-8 pb-1.5 flex justify-start md:justify-center">
                  <TabsList className="bg-primary dark:bg-slate-900/80 p-1.5 rounded-[1.5rem] flex h-auto shadow-lg shadow-primary/20 dark:shadow-black/20 border dark:border-white/5 shrink-0 flex-nowrap">
                    {['company', 'client', 'items', 'payment', 'advanced'].map(t => (
                      <TabsTrigger 
                        key={t} 
                        value={t} 
                        className="rounded-xl px-5 py-2.5 capitalize font-black text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-primary data-[state=active]:text-primary dark:data-[state=active]:text-white text-white/70 dark:text-white/40 hover:text-white dark:hover:text-white transition-all shrink-0"
                      >
                        {t}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value="company" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className={`w-32 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${logo ? 'border-none' : 'border-border hover:border-primary/50 bg-muted/30'}`}
                      >
                        {logo ? <img src={logo} className="w-full h-full object-cover" /> : <><ImageIcon className="w-6 h-6 mb-1" /><span className="text-[9px] font-black uppercase">Logo</span></>}
                      </div>
                      <input type="file" ref={logoInputRef} onChange={e => handleImageUpload(e, setLogo)} className="hidden" accept="image/*" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest">Business Name</Label>
                        <Input value={businessName} onChange={e => setBusinessName(e.target.value)} className="h-10 text-lg font-black bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest">Tax ID</Label>
                        <Input value={businessTaxId} onChange={e => setBusinessTaxId(e.target.value)} className="h-10 text-xs font-bold bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Email</Label>
                      <Input value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Phone</Label>
                      <Input value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Address</Label>
                    <textarea value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} className="w-full h-20 p-4 text-xs rounded-xl bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all outline-none resize-none" />
                  </div>
                </TabsContent>

                <TabsContent value="client" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Client Name</Label>
                      <Input value={clientName} onChange={e => setClientName(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Client Tax ID</Label>
                      <Input value={clientTaxId} onChange={e => setClientTaxId(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Billing Address</Label>
                    <textarea value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full h-20 p-4 text-xs rounded-xl bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all outline-none resize-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={showShipping} onCheckedChange={setShowShipping} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Different Shipping Address</span>
                  </div>
                  {showShipping && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <textarea value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} className="w-full h-20 p-4 text-xs rounded-xl bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all outline-none resize-none mt-2" placeholder="Shipping destination..." />
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="items" className="space-y-4 mt-0">
                  <div className="grid grid-cols-12 gap-4 pb-2 border-b text-[10px] font-black uppercase tracking-widest opacity-50">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-right">Rate</div>
                    <div className="col-span-1"></div>
                  </div>
                  <AnimatePresence mode="popLayout">
                    {items.map(item => (
                      <motion.div layout key={item.id} className="grid grid-cols-12 gap-2 md:gap-4 items-center">
                        <div className="col-span-12 md:col-span-6"><Input placeholder="Item description" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" /></div>
                        <div className="col-span-5 md:col-span-2"><Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all text-center" /></div>
                        <div className="col-span-5 md:col-span-3"><Input type="number" placeholder="Rate" value={item.rate} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value))} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all text-right" /></div>
                        <div className="col-span-2 md:col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-muted-foreground hover:text-error"><Trash2 className="h-4 w-4" /></Button></div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <Button onClick={addItem} variant="outline" className="w-full h-10 border-dashed text-[10px] font-black uppercase tracking-widest"><Plus className="h-3 w-3 mr-2" /> Add Item</Button>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest">Bank Name</Label><Input value={bankName} onChange={e => setBankName(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest">Account Holder</Label><Input value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest">Account Number</Label><Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest">Payment Link (Stripe/PayPal)</Label><Input value={paymentLink} onChange={e => setPaymentLink(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" placeholder="https://..." /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest">IBAN</Label><Input value={iban} onChange={e => setIban(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest">SWIFT / BIC</Label><Input value={swift} onChange={e => setSwift(e.target.value)} className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all" /></div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest block">Invoice Brand Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {['#000000', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#ea580c'].map(c => (
                          <button 
                            key={c}
                            onClick={() => setInvoiceColor(c)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all",
                              invoiceColor === c ? "border-primary scale-110 shadow-lg" : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input 
                          type="color" 
                          value={invoiceColor} 
                          onChange={e => setInvoiceColor(e.target.value)}
                          className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Custom Tax Label</Label>
                      <Input 
                        value={taxLabel} 
                        onChange={e => setTaxLabel(e.target.value)} 
                        className="h-10 text-xs bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                        placeholder="e.g. VAT, GST, Sales Tax"
                      />
                    </div>
                  </div>

                  <Separator className="bg-muted" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4 flex flex-col items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest">QR Code</Label>
                      <div onClick={() => qrInputRef.current?.click()} className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${qrCode ? 'border-none' : 'border-border hover:border-primary/50 bg-muted/30 group'}`}>
                        {qrCode ? <img src={qrCode} className="w-full h-full object-contain" /> : <QrCode className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />}
                      </div>
                      <input type="file" ref={qrInputRef} onChange={e => handleImageUpload(e, setQrCode)} className="hidden" accept="image/*" />
                    </div>
                    <div className="space-y-4 flex flex-col items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Barcode</Label>
                      <div onClick={() => barcodeInputRef.current?.click()} className={`w-36 h-20 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${barcode ? 'border-none' : 'border-border hover:border-primary/50 bg-muted/30 group'}`}>
                        {barcode ? <img src={barcode} className="w-full h-full object-contain" /> : <Barcode className="h-8 w-16 text-muted-foreground group-hover:text-primary transition-colors" />}
                      </div>
                      <input type="file" ref={barcodeInputRef} onChange={e => handleImageUpload(e, setBarcode)} className="hidden" accept="image/*" />
                    </div>
                    <div className="space-y-4 flex flex-col items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Signature</Label>
                      <div onClick={() => signatureInputRef.current?.click()} className={`w-24 h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer ${signature ? 'border-none' : 'bg-muted/30'}`}>
                        {signature ? <img src={signature} className="w-full h-full object-contain" /> : <Signature className="h-6 w-6 text-muted-foreground" />}
                      </div>
                      <input type="file" ref={signatureInputRef} onChange={e => handleImageUpload(e, setSignature)} className="hidden" accept="image/*" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Percent className="w-3 h-3" /> Tax Rate</Label>
                      <Input type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value))} className="h-10 bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all text-xs font-bold rounded-xl" />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Percent className="w-3 h-3" /> Discount %</Label>
                      <Input type="number" value={discountRate} onChange={e => setDiscountRate(parseFloat(e.target.value))} className="h-10 bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all text-xs font-bold rounded-xl" />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Truck className="w-3 h-3" /> Shipping</Label>
                      <Input type="number" value={shippingCost} onChange={e => setShippingCost(parseFloat(e.target.value))} className="h-10 bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all text-xs font-bold rounded-xl" />
                  </div>
                  <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Currency</Label>
                      <Select value={currency.value} onValueChange={v => setCurrency(CURRENCIES.find(c => c.value === v)!)}>
                        <SelectTrigger className="h-10 bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all text-xs font-bold rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>
              </div>

              <Separator className="my-8 bg-muted" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><Type className="w-3 h-3" /> Notes</Label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full h-24 p-3 text-xs font-medium rounded-xl bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all outline-none resize-none" />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><CreditCard className="w-3 h-3" /> Terms</Label>
                    <textarea value={terms} onChange={e => setTerms(e.target.value)} className="w-full h-24 p-3 text-xs font-medium rounded-xl bg-muted/30 border border-border/50 focus:border-primary/50 focus:bg-background transition-all outline-none resize-none" />
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-primary dark:bg-primary/90 rounded-[2rem] border border-primary/10 gap-4 shadow-xl shadow-primary/20">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white block mb-1">Total Payable</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tight">{currency.symbol}{total.toLocaleString()}</span>
                    <span className="text-[10px] font-medium text-white/70 tracking-widest uppercase">{currency.value}</span>
                  </div>
                </div>
                <div className="flex flex-col text-right gap-0.5 sm:border-l sm:border-white/20 sm:pl-6 w-full sm:w-auto">
                  <div className="text-[10px] font-bold text-white/90 uppercase tracking-tight flex justify-between sm:justify-end gap-4"><span>Subtotal</span> <span>{currency.symbol}{subtotal.toLocaleString()}</span></div>
                  <div className="text-[10px] font-bold text-white/90 uppercase tracking-tight flex justify-between sm:justify-end gap-4"><span>Tax ({taxRate}%)</span> <span>{currency.symbol}{taxAmount.toLocaleString()}</span></div>
                  {shippingCost > 0 && <div className="text-[10px] font-bold text-white/90 uppercase tracking-tight flex justify-between sm:justify-end gap-4"><span>Shipping</span> <span>{currency.symbol}{shippingCost.toLocaleString()}</span></div>}
                  {discountAmount > 0 && <div className="text-[10px] font-bold text-white uppercase tracking-tight flex justify-between sm:justify-end gap-4"><span>Discount</span> <span>-{currency.symbol}{discountAmount.toLocaleString()}</span></div>}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Preview & Export */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 mt-8 lg:mt-0 pt-6 lg:pt-0 border-t border-dashed border-border/40 lg:border-t-0">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-foreground">Live Preview</span>
              </div>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="w-[120px] h-8 text-[10px] font-black uppercase border-none bg-card shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="neo">Neo-Brutal</SelectItem>
                  <SelectItem value="bold">Bold Focus</SelectItem>
                  <SelectItem value="futuristic">Futuristic</SelectItem>
                  <SelectItem value="luxury">Luxury Serif</SelectItem>
                  <SelectItem value="industrial">Industrial Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog>
              <DialogTrigger render={<button className="w-full relative group cursor-zoom-in outline-none" />}>
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors z-20 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 p-4 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="border border-border/50 rounded-[2rem] shadow-2xl bg-white h-[680px] overflow-hidden relative bg-slate-50">
                    <div className="absolute inset-0 overflow-y-auto p-4 flex flex-col items-center scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <div className="w-[850px] origin-top scale-[0.4] sm:scale-[0.5] md:scale-[0.55] lg:scale-[0.38] xl:scale-[0.48] 2xl:scale-[0.55] transition-transform shrink-0 shadow-lg mb-8">
                        <InvoicePreview 
                          data={{
                            logo, businessName, businessEmail, businessAddress, businessPhone, businessTaxId,
                            clientName, clientEmail, clientAddress, clientTaxId, showShipping, shippingAddress,
                            invoiceNumber, poNumber, invoiceDate, dueDate, currency, items,
                            taxRate, discountRate, shippingCost, notes, terms,
                            bankName, accountHolder, accountNumber, iban, swift, paymentLink, template,
                            qrCode, barcode, signature,
                            subtotal, discountAmount, taxAmount, total, taxLabel, invoiceColor
                          }}
                        />
                      </div>
                    </div>
                  </div>
              </DialogTrigger>
              <DialogContent className="max-w-[98vw] md:max-w-[90vw] lg:max-w-[85vw] w-fit h-[95vh] p-0 overflow-hidden bg-muted/95 backdrop-blur-xl border-none rounded-[2.5rem] flex flex-col">
                <DialogHeader className="sr-only">
                  <DialogTitle>Invoice Preview</DialogTitle>
                </DialogHeader>
                <div className="w-full flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                  <div className="relative h-fit w-fit flex flex-col items-center justify-start">
                    <div className="w-[1000px] h-fit origin-top scale-[min(calc(90vh/1414px),calc(85vw/1000px))] md:scale-[min(calc(80vh/1414px),calc(70vw/1000px))] transition-transform shrink-0 shadow-2xl bg-white rounded-xl mb-12">
                      <InvoicePreview 
                        data={{
                          logo, businessName, businessEmail, businessAddress, businessPhone, businessTaxId,
                          clientName, clientEmail, clientAddress, clientTaxId, showShipping, shippingAddress,
                          invoiceNumber, poNumber, invoiceDate, dueDate, currency, items,
                          taxRate, discountRate, shippingCost, notes, terms,
                          bankName, accountHolder, accountNumber, iban, swift, paymentLink, template,
                          qrCode, barcode, signature,
                          subtotal, discountAmount, taxAmount, total, taxLabel, invoiceColor
                        }}
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={generatePDF} 
              className="w-full h-16 bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-xs rounded-[1.5rem] shadow-[0_6px_0_0_#1e1b4b] border-2 border-indigo-950/20 border-b-[6px] hover:border-b-[4px] active:border-b-2 active:translate-y-[4px] transition-all gap-3 flex items-center justify-center select-none"
            >
              <Download className="w-5 h-5" /> Download Professional PDF
            </Button>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Link to="/tools/qr" className="flex items-center justify-center gap-2 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-600 text-white font-black uppercase tracking-widest text-[9px] rounded-2xl shadow-[0_6px_0_0_#065f46] dark:shadow-[0_6px_0_0_#064e3b] hover:shadow-[0_3px_0_0_#065f46] dark:hover:shadow-[0_3px_0_0_#064e3b] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all text-center px-3 border border-emerald-400/20">
                <QrCode className="w-4 h-4" /> Create Brand QR
              </Link>
              <Link to="/tools/barcode" className="flex items-center justify-center gap-2 h-14 bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-600 text-white font-black uppercase tracking-widest text-[9px] rounded-2xl shadow-[0_6px_0_0_#134e4a] dark:shadow-[0_6px_0_0_#0f766e] hover:shadow-[0_3px_0_0_#134e4a] dark:hover:shadow-[0_3px_0_0_#0f766e] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all text-center px-3 border border-teal-400/20">
                <Barcode className="w-4 h-4" /> Create Barcode
              </Link>
            </div>
          </div>
        </div>
        <ValueBanner />
        <FAQSection />
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
                    <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">Your invoice was successfully generated</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 rounded-3xl border border-dashed border-border/60">
                   <p className="text-sm font-medium leading-relaxed">
                     Your premium corporate invoice template has been fully calculated, organized, and downloaded as a high-fidelity PDF ready for client billing and dispatch.
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
};
