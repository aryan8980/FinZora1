import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sendChatMessage } from '@/services/api';
import { Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  subtext?: string;
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI financial copilot.",
      subtext: 'Ask me anything about your expenses, income, portfolio, or financial advice!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const pushMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to AI backend
      const result = await sendChatMessage(userMessage.content, true);
      
      if (result.success) {
        pushMessage({ 
          role: 'assistant', 
          content: result.response,
          subtext: result.data_used ? '✓ Using your live financial data' : undefined
        });
      } else if (result.fallback) {
        // AI not configured, show helpful message
        pushMessage({
          role: 'assistant',
          content: 'AI Chat Not Configured',
          subtext:
            (result.message || '') +
            ' Add a FREE Groq API key (set GROQ_API_KEY in .env) to enable cloud AI. You can also use a Hugging Face or Gemini key.'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      pushMessage({
        role: 'assistant',
        content: 'Connection Error',
        subtext: 'Unable to reach the backend. Please ensure the Flask server is running on port 5000.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Financial Advisor
        </CardTitle>
      </CardHeader>
      
      <CardContent ref={listRef} className="flex-1 overflow-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.subtext && (
                  <p className="text-xs text-muted-foreground mt-1">{message.subtext}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking with AI...
            </div>
          </motion.div>
        )}
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
};
