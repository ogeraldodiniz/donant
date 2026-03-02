import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, LocateFixed, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

interface IBGECity {
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
      };
    };
  };
}

interface CityPickerProps {
  city: string;
  state: string;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  /** Compact mode for inline forms (smaller heights) */
  compact?: boolean;
  /** Show the "Detect location" button */
  showDetect?: boolean;
  /** Optional class for the wrapper */
  className?: string;
}

export function CityPicker({
  city,
  state,
  onCityChange,
  onStateChange,
  compact = false,
  showDetect = true,
  className = "",
}: CityPickerProps) {
  const [suggestions, setSuggestions] = useState<IBGECity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingCities(true);
    try {
      const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`
      );
      if (res.ok) {
        const all: IBGECity[] = await res.json();
        const filtered = all
          .filter((c) => c.nome.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    } catch {
      setSuggestions([]);
    }
    setLoadingCities(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (city.length >= 2 && !state) searchCities(city);
      else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [city, state, searchCities]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCity = (c: IBGECity) => {
    onCityChange(c.nome);
    onStateChange(c.microrregiao.mesorregiao.UF.sigla);
    setShowSuggestions(false);
  };

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const res = await fetch("https://ip-api.com/json/?fields=city,regionName,region");
      if (res.ok) {
        const geo = await res.json();
        if (geo.city) onCityChange(geo.city);
        if (geo.region) onStateChange(geo.region);
      }
    } catch {
      // silent
    }
    setDetectingLocation(false);
  };

  const h = compact ? "h-9" : "h-12";
  const textSize = compact ? "text-xs sm:text-sm" : "text-base";

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetect && (
        <button
          type="button"
          onClick={detectLocation}
          disabled={detectingLocation}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-dashed border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {detectingLocation ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5" />
          )}
          Detectar localização
        </button>
      )}

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Digite sua cidade..."
          value={city}
          onChange={(e) => {
            onCityChange(e.target.value);
            onStateChange("");
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className={`pl-10 ${h} rounded-xl ${textSize}`}
          autoComplete="off"
        />
        {loadingCities && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((c) => (
              <button
                key={`${c.nome}-${c.microrregiao.mesorregiao.UF.sigla}`}
                type="button"
                onClick={() => selectCity(c)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">{c.nome}</span>
                <span className="text-xs text-muted-foreground">
                  {c.microrregiao.mesorregiao.UF.sigla}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {state && (
        <div className="flex items-center gap-2 px-1">
          <Check className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {city} — <span className="font-semibold text-foreground">{state}</span>
          </span>
        </div>
      )}
    </div>
  );
}
