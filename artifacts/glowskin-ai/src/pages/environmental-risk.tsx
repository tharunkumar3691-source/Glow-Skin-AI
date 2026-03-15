import { useState } from 'react';
import { useGetEnvironmentalRisk } from '@workspace/api-client-react';
import { GlassCard, GlowButton, Badge } from '@/components/ui-elements';
import { Search, MapPin, Sun, Droplets, Wind, ThermometerSun, AlertTriangle, ShieldCheck, CheckCircle2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function EnvironmentalRiskPage() {
  const [city, setCity] = useState('');
  const { toast } = useToast();
  const envMutation = useGetEnvironmentalRisk();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    
    envMutation.mutate({ data: { city: city.trim() } }, {
      onError: (err) => {
        toast({
          title: "Error",
          description: err.error?.error || "Could not fetch forecast",
          variant: "destructive"
        });
      }
    });
  };

  const data = envMutation.data;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-500 mb-4 shadow-inner">
          <Sun className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Environmental Skin Risk</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Weather, UV, and pollution significantly impact your skin barrier. Check your local 7-day forecast to protect proactively.
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input 
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Enter city name (e.g. New York, London)"
          className="w-full pl-14 pr-32 py-5 rounded-full bg-white border-2 border-border focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-lg shadow-sm"
        />
        <GlowButton 
          type="submit" 
          disabled={envMutation.isPending || !city.trim()}
          className="absolute right-2 top-2 bottom-2 px-6"
        >
          {envMutation.isPending ? 'Searching...' : 'Forecast'}
        </GlowButton>
      </form>

      {data && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-primary" />
            <h2 className="text-2xl font-bold">Current Conditions in {data.city}</h2>
          </div>

          {/* Current Conditions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-5 text-center flex flex-col items-center justify-center">
              <Sun className={`w-8 h-8 mb-2 ${data.currentConditions.uvIndex > 5 ? 'text-red-500' : 'text-amber-500'}`} />
              <p className="text-sm text-muted-foreground font-semibold uppercase">UV Index</p>
              <p className="text-3xl font-bold">{data.currentConditions.uvIndex}</p>
            </GlassCard>
            
            <GlassCard className="p-5 text-center flex flex-col items-center justify-center">
              <Droplets className="w-8 h-8 mb-2 text-blue-400" />
              <p className="text-sm text-muted-foreground font-semibold uppercase">Humidity</p>
              <p className="text-3xl font-bold">{data.currentConditions.humidity}%</p>
            </GlassCard>

            <GlassCard className="p-5 text-center flex flex-col items-center justify-center">
              <ThermometerSun className="w-8 h-8 mb-2 text-orange-400" />
              <p className="text-sm text-muted-foreground font-semibold uppercase">Temp</p>
              <p className="text-3xl font-bold">{data.currentConditions.temperature}°C</p>
            </GlassCard>

            <GlassCard className="p-5 text-center flex flex-col items-center justify-center">
              <Wind className="w-8 h-8 mb-2 text-gray-500" />
              <p className="text-sm text-muted-foreground font-semibold uppercase">PM 2.5</p>
              <p className="text-3xl font-bold">{data.currentConditions.pm25 || '--'}</p>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 7 Day Forecast */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> 7-Day Risk Forecast</h3>
              <div className="flex flex-col gap-3">
                {data.forecast.map((day, i) => (
                  <GlassCard key={i} className="!p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/30 transition-colors">
                    <div className="w-24 shrink-0">
                      <p className="font-bold">{day.date}</p>
                      <p className="text-xs text-muted-foreground">Day {day.day}</p>
                    </div>
                    
                    <div className="w-28 shrink-0">
                      <Badge severity={day.riskLevel}>Risk: {day.riskLevel}</Badge>
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-sm flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> {day.mainRisk}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{day.advice}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Preventive Advice */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Action Plan</h3>
              <GlassCard className="bg-gradient-to-br from-emerald-50/50 to-white">
                <ul className="space-y-4">
                  {data.preventiveAdvice.map((advice, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm leading-relaxed">{advice}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}
