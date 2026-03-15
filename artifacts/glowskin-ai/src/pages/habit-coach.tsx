import { useState, useEffect } from 'react';
import { useSkinHabitCoach, AnalyzeSkinRequestSkinType } from '@workspace/api-client-react';
import { useSkinStore } from '@/store/use-skin-store';
import { GlassCard, GlowButton } from '@/components/ui-elements';
import { Droplets, CheckCircle2, Sun, Moon, Shield, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const skinTypes: { value: AnalyzeSkinRequestSkinType, label: string }[] = [
  { value: 'Dry', label: 'Dry' },
  { value: 'Oily', label: 'Oily' },
  { value: 'Combination', label: 'Combination' },
  { value: 'Balanced', label: 'Balanced' },
];

export default function HabitCoachPage() {
  const { analysisResult, skinType } = useSkinStore();
  const coachMutation = useSkinHabitCoach();
  
  const [formType, setFormType] = useState<AnalyzeSkinRequestSkinType>('Balanced');
  const [issues, setIssues] = useState('');

  // Auto-fetch if we have scan data
  useEffect(() => {
    if (analysisResult && !coachMutation.data && !coachMutation.isPending) {
      coachMutation.mutate({
        data: {
          detectedIssues: analysisResult.detectedIssues.map(i => i.name),
          skinType: skinType
        }
      });
    }
  }, [analysisResult, skinType, coachMutation]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedIssues = issues.split(',').map(i => i.trim()).filter(Boolean);
    coachMutation.mutate({
      data: {
        detectedIssues: parsedIssues.length ? parsedIssues : ['general maintenance'],
        skinType: formType
      }
    });
  };

  const plan = coachMutation.data;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4 shadow-inner">
          <Droplets className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold mb-3">AI Skin Habit Coach</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Consistency is key to perfect skin. Get a personalized daily routine structured by our AI.
        </p>
      </div>

      {!analysisResult && !plan && (
        <GlassCard className="max-w-xl mx-auto mb-12">
          <div className="flex items-start gap-3 bg-primary/10 p-4 rounded-xl text-primary mb-6">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">You haven't scanned your face yet. Tell us about your skin below to generate a routine, or <a href="/scan" className="underline font-bold">take a scan</a> for better results.</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Skin Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {skinTypes.map(type => (
                  <button
                    type="button"
                    key={type.value}
                    onClick={() => setFormType(type.value)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                      formType === type.value 
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-secondary/50 text-foreground border-transparent hover:border-primary/30'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Current Issues (comma separated)</label>
              <input 
                type="text"
                value={issues}
                onChange={e => setIssues(e.target.value)}
                placeholder="e.g. acne, redness, dryness"
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <GlowButton type="submit" disabled={coachMutation.isPending} className="w-full">
              {coachMutation.isPending ? 'Generating...' : 'Generate Habit Plan'}
            </GlowButton>
          </form>
        </GlassCard>
      )}

      {coachMutation.isPending && analysisResult && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-xl font-bold">Crafting your habit plan...</h3>
        </div>
      )}

      {plan && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Morning */}
            <GlassCard className="border-t-4 border-t-amber-400 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sun className="w-24 h-24 text-amber-500" />
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sun className="text-amber-500" /> Morning
                </h2>
                <div className="space-y-4">
                  {plan.morningRoutine.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.step}</p>
                        {item.reason && <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Afternoon */}
            <GlassCard className="border-t-4 border-t-emerald-400 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-24 h-24 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="text-emerald-500" /> Afternoon
                </h2>
                <div className="space-y-4">
                  {plan.afternoonProtection.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.step}</p>
                        {item.reason && <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Night */}
            <GlassCard className="border-t-4 border-t-indigo-400 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Moon className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Moon className="text-indigo-500" /> Night
                </h2>
                <div className="space-y-4">
                  {plan.nightRoutine.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.step}</p>
                        {item.reason && <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

          </div>

          {/* Healthy Habits */}
          <GlassCard className="bg-gradient-to-r from-primary/5 to-accent/5">
            <h2 className="text-2xl font-bold mb-6 text-center">Daily Healthy Habits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plan.healthyHabits.map((habit, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-border flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{habit}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
