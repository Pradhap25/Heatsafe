import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  PhoneCall,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { AssistantResponse } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isEmergency?: boolean;
  emergencyContact?: string;
  emergencySteps?: string[];
  sources?: any[];
  ttsText?: string;
  timestamp: string;
}

export const VoiceAssistantPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text:
        language === 'ta'
          ? 'வணக்கம்! நான் ஹீட்சேஃப் குரல் பாதுகாப்பு உதவியாளர். வெயில் பாதுகாப்பு, குடிநீர் அளவு மற்றும் வெப்ப பக்கவாத அறிகுறிகள் பற்றி தமிழில் அல்லது ஆங்கிலத்தில் கேளுங்கள்.'
          : 'Hello! I am HeatSafe Voice Assistant. Ask me about sun protection, hourly fluid requirements, or heat illness first aid in English or Tamil.',
      ttsText:
        language === 'ta'
          ? 'வணக்கம்! நான் ஹீட்சேஃப் குரல் பாதுகாப்பு உதவியாளர்.'
          : 'Hello! I am HeatSafe Voice Assistant.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        // Automatically submit voice query
        handleSend(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string, langCode: string = 'en') => {
    if (!speechEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use the text input below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (messageToSend?: string) => {
    const query = messageToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.sendAssistantMessage(query, language);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.reply_text,
        isEmergency: response.is_emergency,
        emergencyContact: response.emergency_contact,
        emergencySteps: response.emergency_immediate_steps,
        sources: response.sources,
        ttsText: response.tts_text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Speak response aloud if enabled
      if (speechEnabled) {
        speakText(response.tts_text, response.detected_language);
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue retrieving guidance. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Bot className="w-4 h-4" />
            <span>ACCESSIBLE VOICE AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {t('assistant_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Accepts Tamil and English speech or typing with instant life-safety emergency screening.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              setSpeechEnabled(!speechEnabled);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              speechEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{speechEnabled ? 'Audio Readout ON' : 'Audio Muted'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-400">Suggested Inquiries:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSend(t('assistant_quick_1'))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-amber-300 transition-colors"
          >
            {t('assistant_quick_1')}
          </button>
          <button
            onClick={() => handleSend(t('assistant_quick_2'))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
          >
            {t('assistant_quick_2')}
          </button>
          <button
            onClick={() => handleSend(t('assistant_quick_3'))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
          >
            {t('assistant_quick_3')}
          </button>
          <button
            onClick={() => handleSend(t('assistant_quick_4'))}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-xs text-rose-300 font-semibold transition-colors"
          >
            🚨 {t('assistant_quick_4')}
          </button>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="glass-panel-elevated rounded-3xl border border-slate-800 p-4 sm:p-6 flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                    msg.isEmergency
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium ml-auto rounded-tr-none'
                    : msg.isEmergency
                    ? 'bg-rose-950/90 border border-rose-600 text-rose-100 rounded-tl-none shadow-xl shadow-rose-950/50'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Emergency Header if triggered */}
                {msg.isEmergency && (
                  <div className="p-3 rounded-xl bg-rose-900/60 border border-rose-500 flex items-center justify-between gap-3 text-white">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-300 animate-bounce" />
                      <strong className="text-xs uppercase tracking-wider">
                        CRITICAL LIFE-SAFETY ALERT
                      </strong>
                    </div>
                    {msg.emergencyContact && (
                      <a
                        href="tel:108"
                        className="flex items-center gap-1 px-3 py-1 rounded bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Dial 108</span>
                      </a>
                    )}
                  </div>
                )}

                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Emergency Immediate Steps */}
                {msg.emergencySteps && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-800/60 space-y-1.5 text-xs">
                    <span className="font-bold text-rose-300">Immediate Protocol:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-200">
                      {msg.emergencySteps.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Source Attribution */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Guideline Source: <strong>{msg.sources[0].title}</strong> ({msg.sources[0].organization})
                    </span>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${
                    msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-amber-400 p-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Checking safety repository & life-safety protocol...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Input & Voice Controls */}
        <div className="pt-4 border-t border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/60 scale-105'
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Tap to speak'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? 'Listening now... please speak...' : t('assistant_placeholder')}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
