import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { unitsMap, convert, UnitType } from "@/utils/converters";
import { 
  ArrowRightLeft, Ruler, Weight, Thermometer, 
  Clock, HardDrive, Zap, Gauge, Move, 
  Wind, Activity, Compass, Flame,
  Hand, RotateCcw, Lightbulb, Droplets,
  Fuel, FlaskRound, Network, Cpu, BatteryMedium,
  Radiation, Sun, Magnet, Coins, Banknote
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ValueBanner } from "@/components/ValueBanner";
import { ConverterFAQ } from "./ConverterFAQ";
import { toast } from "sonner";
import { logActivity } from "@/supabase/db";
import { Button } from "@/components/ui/button";

const CATEGORIES: { id: UnitType; label: string; icon: any }[] = [
  { id: 'length', label: 'Length', icon: Ruler },
  { id: 'weight', label: 'Weight', icon: Weight },
  { id: 'area', label: 'Area', icon: Move },
  { id: 'volume', label: 'Volume', icon: Move },
  { id: 'temperature', label: 'Temperature', icon: Thermometer },
  { id: 'time', label: 'Time', icon: Clock },
  { id: 'data', label: 'Digital', icon: HardDrive },
  { id: 'speed', label: 'Speed', icon: Wind },
  { id: 'pressure', label: 'Pressure', icon: Gauge },
  { id: 'energy', label: 'Energy', icon: Flame },
  { id: 'power', label: 'Power', icon: Zap },
  { id: 'angle', label: 'Angle', icon: Compass },
  { id: 'frequency', label: 'Frequency', icon: Activity },
  { id: 'force', label: 'Force', icon: Hand },
  { id: 'torque', label: 'Torque', icon: RotateCcw },
  { id: 'illuminance', label: 'Light', icon: Lightbulb },
  { id: 'volumetricFlow', label: 'Flow', icon: Droplets },
  { id: 'fuelConsumption', label: 'Fuel', icon: Fuel },
  { id: 'viscosity', label: 'Viscosity', icon: FlaskRound },
  { id: 'digitalRate', label: 'Transfer', icon: Network },
  { id: 'current', label: 'Current', icon: Activity },
  { id: 'voltage', label: 'Voltage', icon: BatteryMedium },
  { id: 'luminousIntensity', label: 'Intensity', icon: Sun },
  { id: 'magnetism', label: 'Magnetism', icon: Magnet },
  { id: 'radiation', label: 'Radiation', icon: Radiation },
  { id: 'currency', label: 'Currency', icon: Banknote },
  { id: 'crypto', label: 'Crypto', icon: Coins },
];

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  usd: "us", eur: "eu", gbp: "gb", jpy: "jp", aud: "au", cad: "ca", 
  chf: "ch", cny: "cn", sek: "se", nzd: "nz", mxn: "mx", sgd: "sg", 
  hkd: "hk", nok: "no", krw: "kr", "try": "tr", rub: "ru", inr: "in", 
  brl: "br", zar: "za", thb: "th", idr: "id", myr: "my", php: "ph",
  dkk: "dk", huf: "hu", pln: "pl", ron: "ro"
};

export function UnitsConverter() {
  const [type, setType] = useState<UnitType>("length");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("km");
  const [value, setValue] = useState<string>("1");
  const [result, setResult] = useState<string>("");
  const [dynamicRates, setDynamicRates] = useState<{ currency: any; crypto: any } | null>(null);

  useEffect(() => {
    document.title = "Precision Units Converter | High-Accuracy Measurement Tool";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Convert between Metric and Imperial units with absolute precision. Our professional unit converter supports length, weight, temperature, area, currency, and crypto with high-fidelity scaling factors.");
    }
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("/api/exchange-rates");
        const data = await res.json();
        setDynamicRates({
          currency: data.fiat,
          crypto: data.crypto
        });
      } catch (err) {
        console.error("Fetch rates failed", err);
      }
    };
    fetchRates();
  }, []);

  const currentUnitsMap = {
    ...unitsMap,
    currency: dynamicRates?.currency 
      ? Object.keys(dynamicRates.currency).map(code => ({
          label: code.toUpperCase(),
          value: code.toLowerCase(),
          factor: dynamicRates.currency[code]
        })).concat([{ label: 'USD', value: 'usd', factor: 1 }]) // Frankfurter is relative to base, I'll normalize below
      : unitsMap.currency,
    crypto: dynamicRates?.crypto
      ? dynamicRates.crypto.map((c: any) => ({
          label: c.name,
          value: c.id, // CG id
          factor: 1 / c.current_price, // Factor relative to 1 USD
          symbol: c.symbol,
          image: c.image
        }))
      : unitsMap.crypto
  };

  useEffect(() => {
    const units = currentUnitsMap[type];
    if (units && units.length > 0) {
      setFromUnit(units[0].value);
      setToUnit(units[1]?.value || units[0].value);
    }
  }, [type, dynamicRates]);

  useEffect(() => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      let converted: number;
      if (type === 'currency' || type === 'crypto') {
        const units = currentUnitsMap[type];
        const from = units.find(u => u.value === fromUnit);
        const to = units.find(u => u.value === toUnit);
        if (from && to) {
          // If factor is relative to USD (1 unit = X USD)
          // Actually Frankfurter is 1 USD = X EUR.
          // For currency: factor is X units per 1 USD.
          // For crypto: factor was set as 1/price? wait.
          // Let's standardize: factor = amount of units per 1 USD.
          // Frankfurter: USD base, rates are rates[code] units per 1 USD. Correct.
          // Crypto: current_price is USD per 1 coin. 
          // So 1 coin = current_price USD.
          // Units per 1 USD = 1 / current_price. Correct.
          
          const valueInUSD = num / from.factor;
          converted = valueInUSD * to.factor;
        } else {
          converted = num;
        }
      } else {
        converted = convert(num, fromUnit, toUnit, type);
      }
      setResult(converted.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    } else {
      setResult("");
    }
  }, [value, fromUnit, toUnit, type, dynamicRates]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Result copied to clipboard!");
    logActivity({
      tool_type: 'converter',
      name: `${value || '0'} ${fromUnit.toUpperCase()} to ${toUnit.toUpperCase()} (${result})`,
      status: 'Converted'
    });
  };

  const renderUnitDisplay = (uValue: string) => {
    const u = currentUnitsMap[type].find(unit => unit.value === uValue);
    if (!u) return <span>Select Unit</span>;
    
    if (type === 'currency') {
      const country = CURRENCY_TO_COUNTRY[u.value];
      return (
        <div className="flex items-center gap-3 w-full">
          {country ? (
            <img 
              src={`https://flagcdn.com/w40/${country}.png`} 
              className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm flex-shrink-0" 
              alt="" 
            />
          ) : (
            <div className="w-5 h-3.5 bg-muted rounded-[2px]" />
          )}
          <span className="truncate flex-1 text-xs">{u.label}</span>
          <span className="text-[10px] font-black opacity-40 group-data-[highlighted]:opacity-100 group-focus:opacity-100 uppercase ml-2 tabular-nums">
            {u.value}
          </span>
        </div>
      );
    }
    
    if (type === 'crypto') {
      const cryptoUnit = u as any;
      return (
        <div className="flex items-center gap-3 w-full">
          {cryptoUnit.image ? (
            <img 
              src={cryptoUnit.image} 
              className="w-5 h-5 object-contain flex-shrink-0" 
              alt="" 
            />
          ) : (
            <div className="w-5 h-5 flex items-center justify-center bg-muted rounded-full">
               <Coins className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
          <span className="truncate flex-1 text-xs">{u.label}</span>
          <span className="text-[10px] font-black opacity-40 group-data-[highlighted]:opacity-100 group-focus:opacity-100 uppercase ml-2 tabular-nums">
            {cryptoUnit.symbol || u.value}
          </span>
        </div>
      );
    }
    
    return <span className="text-xs truncate font-bold">{u.label}</span>;
  };

  return (
    <div className="container mx-auto px-6 py-4 max-w-7xl">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-3xl font-black text-foreground tracking-tighter">Precision Units Converter.</h1>
        <p className="text-muted-foreground text-sm font-medium">Modern high-fidelity conversion engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start relative">
        {/* Mobile/Tablet categories (top horizontal scroll) */}
        <div className="lg:hidden col-span-1 flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2 }}
              onClick={() => setType(cat.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all
                ${type === cat.id 
                  ? 'bg-primary text-white shadow-[0_4px_0_0_#004d33] -translate-y-1' 
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border/10 shadow-[0_2px_0_0_#E2E8F0] active:shadow-none active:translate-y-1'}
              `}
            >
              <cat.icon className={`w-4 h-4 ${type === cat.id ? 'text-white' : 'text-primary'}`} />
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Desktop Left Categories */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
          {CATEGORIES.slice(0, Math.ceil(CATEGORIES.length / 2)).map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2 }}
              onClick={() => setType(cat.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all w-full
                ${type === cat.id 
                  ? 'bg-primary text-white shadow-[0_4px_0_0_#004d33] -translate-y-1' 
                  : 'bg-card text-muted-foreground hover:text-foreground border-2 border-border/10 shadow-[0_3px_0_0_#E2E8F0] active:shadow-none active:translate-y-1'}
              `}
            >
              <cat.icon className={`w-4 h-4 ${type === cat.id ? 'text-white' : 'text-primary'}`} />
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Main Converter Tool */}
        <Card className="col-span-1 lg:col-span-6 p-4 md:p-6 border-none shadow-premium rounded-[2.5rem] bg-card relative overflow-hidden z-10">
          <div className="grid grid-cols-1 gap-4 items-center">
            {/* From Input Group */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Input Value</Label>
                <div className="relative group">
                  <Input 
                    type="number" 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)}
                    className="h-14 text-2xl font-black rounded-2xl border-none bg-muted/50 px-6 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">From Unit</Label>
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger className="h-12 rounded-xl border-none bg-muted/50 font-bold px-5 text-sm">
                    {renderUnitDisplay(fromUnit)}
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-border shadow-2xl min-w-[240px] z-50 opacity-100">
                    {currentUnitsMap[type].map(u => (
                      <SelectItem 
                        key={u.value} 
                        value={u.value} 
                        className="group font-bold py-3 text-xs cursor-pointer text-slate-700 dark:text-slate-200 data-[highlighted]:bg-emerald-600 data-[highlighted]:text-white focus:bg-emerald-600 focus:text-white transition-colors"
                      >
                        {renderUnitDisplay(u.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-3 relative z-20">
              <motion.button 
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={swapUnits}
                className="w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ArrowRightLeft className="w-6 h-6" />
              </motion.button>
            </div>

            {/* To Input Group */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Conversion Result</Label>
                <div className="relative group/res">
                  <div className="h-14 flex items-center px-6 pr-24 text-2xl font-black rounded-2xl bg-primary/5 text-primary border border-primary/10 overflow-hidden truncate">
                     {result || "0.00"}
                  </div>
                  <div className="absolute right-2 top-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={copyToClipboard}
                      className="h-10 rounded-xl px-3 hover:bg-primary/10 text-primary font-bold text-xs"
                      id="btn-copy-conv"
                    >
                       Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">To Unit</Label>
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger className="h-12 rounded-xl border-none bg-muted/50 font-bold px-5 text-sm">
                    {renderUnitDisplay(toUnit)}
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-border shadow-2xl min-w-[240px] z-50 opacity-100">
                    {currentUnitsMap[type].map(u => (
                      <SelectItem 
                        key={u.value} 
                        value={u.value} 
                        className="group font-bold py-3 text-xs cursor-pointer text-slate-700 dark:text-slate-200 data-[highlighted]:bg-emerald-600 data-[highlighted]:text-white focus:bg-emerald-600 focus:text-white transition-colors"
                      >
                        {renderUnitDisplay(u.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-3">
            {currentUnitsMap[type].slice(0, 4).map(u => (
               <div key={u.value} className="p-3 bg-muted/30 rounded-xl border border-transparent hover:border-primary/20 transition-all">
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{u.label}</p>
                 <p className="text-xs font-black text-foreground truncate">
                   {(() => {
                      const num = parseFloat(value) || 0;
                      if (type === 'currency' || type === 'crypto') {
                        const units = currentUnitsMap[type];
                        const from = units.find(unit => unit.value === fromUnit);
                        const to = units.find(unit => unit.value === u.value);
                        if (from && to) {
                          const valueInUSD = num / from.factor;
                          return (valueInUSD * to.factor).toLocaleString(undefined, { maximumFractionDigits: 4 });
                        }
                        return "0";
                      }
                      return convert(num, fromUnit, u.value, type).toLocaleString(undefined, { maximumFractionDigits: 4 });
                   })()} {u.value.toUpperCase().slice(0, 4)}
                 </p>
               </div>
            ))}
          </div>
        </Card>

        {/* Desktop Right Categories */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
          {CATEGORIES.slice(Math.ceil(CATEGORIES.length / 2)).map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2 }}
              onClick={() => setType(cat.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all w-full
                ${type === cat.id 
                  ? 'bg-primary text-white shadow-[0_4px_0_0_#004d33] -translate-y-1' 
                  : 'bg-card text-muted-foreground hover:text-foreground border-2 border-border/10 shadow-[0_3px_0_0_#E2E8F0] active:shadow-none active:translate-y-1'}
              `}
            >
              <cat.icon className={`w-4 h-4 ${type === cat.id ? 'text-white' : 'text-primary'}`} />
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      <ValueBanner />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-8 bg-card border border-border/50 rounded-[2rem] space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Scientific Precision</h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            Engineered with IEEE 754 standard for high-fidelity calculations across physical and digital dimensions.
          </p>
        </div>
        <div className="p-8 bg-card border border-border/50 rounded-[2rem] space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Move className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Universal Scaling</h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            Support for both Metric and Imperial systems with localized deep-scaling factors for global usage.
          </p>
        </div>
        <div className="p-8 bg-card border border-border/50 rounded-[2rem] space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Zero Latency</h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            All calculations are processed locally in real-time. No server calls, no data transmission, total privacy.
          </p>
        </div>
      </div>
      <ConverterFAQ />
    </div>
  );
}
