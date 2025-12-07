import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { ChatBot } from '@/components/ChatBot';
import { motion } from 'framer-motion';

export default function ChatAssistant() {
  return (
    <div className="min-h-screen">
      <Navbar showProfile />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto h-[calc(100vh-8rem)]"
          >
            <ChatBot />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
