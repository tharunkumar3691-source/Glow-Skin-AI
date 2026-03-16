import { useState, useRef, useEffect } from 'react';
import { useVoiceDermatologist } from '@/lib/api-client';
import { useSkinStore } from '@/store/use-skin-store';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { GlassCard, GlowButton } from '@/components/ui-elements';
import { Mic, MicOff, Send, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoicePage() {
  const { analysisResult } = useSkinStore();
  const voiceMutation = useVoiceDermatologist();
  
  const [textInput, setTextInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, error: speechError, startListening, stopListening, setTranscript } = useSpeechRecognition();

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, voiceMutation.isPending]);

  // Sync transcript to text input while listening
  useEffect(() => {
    if (isListening) {
      setTextInput(transcript);
    }
  }, [transcript, isListening]);

  const handleSubmit = (overrideText?: string) => {
    const query = overrideText || textInput;
    if (!query.trim()) return;

    // Add to UI immediately
    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    setTextInput('');
    setTranscript('');
    if (isListening) stopListening();

    // Prepare context from scan
    let contextStr = null;
    if (analysisResult) {
      contextStr = `Patient has a skin health score of ${Math.round(analysisResult.healthScore)}/100. Issues: ${analysisResult.detectedIssues.map(i => i.name).join(', ')}.`;
    }

    voiceMutation.mutate({
      data: {
        question: query,
        context: contextStr
      }
    }, {
      onSuccess: (data) => {
        setChatHistory(prev => [...prev, { role: 'ai', text: data.answer }]);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col pb-4">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md bg-pink-50">
          <img src={`${import.meta.env.BASE_URL}images/voice-avatar.png`} alt="Dr. Nova" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">Dr. Nova Sonic <Sparkles className="w-4 h-4 text-primary" /></h1>
          <p className="text-sm text-muted-foreground">Your AI Dermatologist is ready to help.</p>
        </div>
      </div>

      {speechError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
          Speech Error: {speechError}
        </div>
      )}

      {/* Chat Area */}
      <GlassCard className="flex-1 overflow-y-auto mb-6 flex flex-col gap-6 !p-4 sm:!p-6">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="text-lg">Ask any question about skincare, routines, or ingredients.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {chatHistory.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-sm shadow-md' 
                      : 'bg-white border border-border shadow-sm rounded-bl-sm prose prose-sm max-w-none text-foreground'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {voiceMutation.isPending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white border border-border shadow-sm rounded-2xl rounded-bl-sm p-4 flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
        )}
      </GlassCard>

      {/* Follow up suggestions */}
      {voiceMutation.data?.followUpQuestions && chatHistory[chatHistory.length-1]?.role === 'ai' && (
        <div className="flex flex-wrap gap-2 mb-4 shrink-0">
          {voiceMutation.data.followUpQuestions.map((q, i) => (
            <button 
              key={i}
              onClick={() => handleSubmit(q)}
              className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-full transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="relative flex items-center gap-2 shrink-0">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse shadow-red-500/30' 
              : 'bg-white border border-border text-foreground hover:bg-secondary'
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={isListening ? "Listening..." : "Type your question..."}
            className={`w-full bg-white border-2 rounded-full pl-5 pr-14 py-4 focus:outline-none transition-all shadow-sm ${
              isListening ? 'border-primary ring-4 ring-primary/10' : 'border-border focus:border-primary'
            }`}
          />
          <button 
            onClick={() => handleSubmit()}
            disabled={!textInput.trim() || voiceMutation.isPending}
            className="absolute right-2 top-2 bottom-2 w-10 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
