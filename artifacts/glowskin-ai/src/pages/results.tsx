import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useSkinStore } from '@/store/use-skin-store';
import { GlassCard, Badge, GlowButton } from '@/components/ui-elements';
import { useGenerateTreatment } from '@/lib/api-client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { AlertCircle, Calendar, Sun, ArrowRight, CheckCircle2, Sparkles, Moon, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ResultsPage() {
  const [, setLocation] = useLocation();
  const { analysisResult, skinType, imageBase64 } = useSkinStore();
  const treatmentMutation = useGenerateTreatment();

  useEffect(() => {
    // Redirect if no data
    if (!analysisResult) {
      setLocation('/scan');
      return;
    }

    // Auto-generate treatment plan if not already fetched
    if (!treatmentMutation.data && !treatmentMutation.isPending && !treatmentMutation.isError) {
      treatmentMutation.mutate({
        data: {
          analysisId: analysisResult.analysisId,
          detectedIssues: analysisResult.detectedIssues.map(i => i.name),
          skinType: skinType
        }
      });
    }
  }, [analysisResult, setLocation, skinType, treatmentMutation]);

  if (!analysisResult) return null;

  const getScoreColorHex = (score: number) => {
    if (score >= 90) return '#4ade80'; // green-400
    if (score >= 70) return '#86efac'; // green-300
    if (score >= 50) return '#fde047'; // green-200 / yellow
    if (score >= 30) return '#fb923c'; // orange-400
    return '#f87171'; // red-400
  };

  const chartData = {
    datasets: [{
      data: [analysisResult.healthScore, 100 - analysisResult.healthScore],
      backgroundColor: [getScoreColorHex(analysisResult.healthScore), '#f3f4f6'],
      borderWidth: 0,
      circumference: 250,
      rotation: 235,
      cutout: '85%',
      borderRadius: 20
    }]
  };

  const chartOptions = {
    plugins: { tooltip: { enabled: false } },
    maintainAspectRatio: false,
    responsive: true,
  };

  const treatment = treatmentMutation.data;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Skin Intelligence</h1>
          <p className="text-muted-foreground text-lg">AI Diagnosis #{analysisResult.analysisId}</p>
        </div>
        <Link href="/scan">
          <GlowButton variant="outline" className="hidden sm:flex">New Scan</GlowButton>
        </Link>
      </div>

      {/* Top Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Step 1: Scan Results */}
        <GlassCard className="flex flex-col h-full border-t-4 border-t-primary">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
            <h2 className="text-xl font-bold">Detected Issues</h2>
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-inner shrink-0 border border-border">
              {imageBase64 ? (
                <img src={imageBase64} alt="Scan thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center"><AlertCircle className="text-muted-foreground" /></div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm text-muted-foreground font-medium mb-1">Skin Type</p>
              <p className="text-lg font-bold">{skinType || 'Not specified'}</p>
            </div>
          </div>

          <div className="flex-1">
            {analysisResult.detectedIssues.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysisResult.detectedIssues.map((issue, i) => (
                  <Badge key={i} severity={issue.severity}>{issue.name}</Badge>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">No major issues detected!</span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Step 2: Health Score */}
        <GlassCard className="flex flex-col h-full border-t-4 border-t-accent items-center justify-center relative overflow-hidden">
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground font-bold">2</div>
            <h2 className="text-xl font-bold">Health Score</h2>
          </div>

          <div className="relative w-48 h-48 mt-10">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
              <span className="text-5xl font-bold text-foreground">{Math.round(analysisResult.healthScore)}</span>
              <span className="text-sm font-medium text-muted-foreground">/ 100</span>
            </div>
          </div>
          
          <div className="text-center mt-[-20px]">
            <Badge severity={
              analysisResult.healthScore >= 70 ? 'low' : 
              analysisResult.healthScore >= 50 ? 'medium' : 'high'
            }>
              {analysisResult.scoreLabel}
            </Badge>
          </div>
        </GlassCard>

        {/* Step 3: Protection & Recovery */}
        <GlassCard className="flex flex-col h-full border-t-4 border-t-emerald-400">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">3</div>
            <h2 className="text-xl font-bold">Recovery Path</h2>
          </div>

          <div className="bg-secondary/50 rounded-2xl p-5 mb-6 flex items-start gap-4">
            <Calendar className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Recovery</p>
              <p className="text-2xl font-bold">{analysisResult.recoveryDays} Days</p>
              <p className="text-sm text-muted-foreground mt-1">Following the AI plan below.</p>
            </div>
          </div>

          <div className="mt-auto">
            <Link href="/environmental-risk">
              <div className="group bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 p-4 rounded-2xl border border-amber-100 transition-colors cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="text-amber-500 w-6 h-6" />
                  <span className="font-semibold text-amber-900">Check Local Risk</span>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Treatment Plan Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4"
      >
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Sparkles className="text-primary w-8 h-8" /> 
          Your AI Treatment Plan
        </h2>

        {treatmentMutation.isPending ? (
          <GlassCard className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold">Nova Lite is generating your plan...</h3>
            <p className="text-muted-foreground">Cross-referencing dermatological knowledge</p>
          </GlassCard>
        ) : treatmentMutation.isError ? (
          <GlassCard className="bg-red-50 border-red-100">
            <p className="text-red-600 font-medium text-center">Failed to generate treatment plan. Please try again.</p>
            <div className="flex justify-center mt-4">
              <GlowButton onClick={() => treatmentMutation.mutate({ data: { detectedIssues: analysisResult.detectedIssues.map(i=>i.name) }})}>
                Retry Generation
              </GlowButton>
            </div>
          </GlassCard>
        ) : treatment ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Routines */}
            <div className="space-y-6">
              <GlassCard className="bg-gradient-to-br from-white to-blue-50/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sun className="text-amber-500" /> Morning Routine
                </h3>
                <ul className="space-y-3">
                  {treatment.morningRoutine.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-bold text-amber-600 shrink-0 border border-amber-100">{i+1}</div>
                      <span className="text-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard className="bg-gradient-to-br from-white to-indigo-50/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Moon className="text-indigo-500" /> Night Routine
                </h3>
                <ul className="space-y-3">
                  {treatment.nightRoutine.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0 border border-indigo-100">{i+1}</div>
                      <span className="text-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* Products & Advice */}
            <div className="space-y-6">
              <GlassCard>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Droplets className="text-primary" /> Recommended Ingredients
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/30 p-4 rounded-2xl">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Face Wash</p>
                    <p className="font-medium">{treatment.recommendedProducts.faceWash}</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Moisturizer</p>
                    <p className="font-medium">{treatment.recommendedProducts.moisturizer}</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Sunscreen</p>
                    <p className="font-medium">{treatment.recommendedProducts.sunscreen}</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Treatment</p>
                    <p className="font-medium">{treatment.recommendedProducts.treatmentCream}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-xl font-bold mb-4">Lifestyle & Natural Remedies</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Lifestyle</h4>
                    <ul className="list-disc pl-5 space-y-1 text-foreground">
                      {treatment.lifestyleAdvice.map((advice, i) => <li key={i}>{advice}</li>)}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Home Remedy</h4>
                    <p className="bg-primary/5 p-4 rounded-xl border border-primary/10 italic">
                      "{treatment.homeRemedy}"
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
