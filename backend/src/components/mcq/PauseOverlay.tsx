import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

interface PauseOverlayProps {
  onResume: () => void;
}

export default function PauseOverlay({ onResume }: PauseOverlayProps) {
  const { t } = useLanguage();
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="bg-white/10 p-8 rounded-2xl text-center backdrop-blur-md max-w-sm"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="w-32 h-32 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
          <Pause className="h-16 w-16 text-white" />
        </div>
        
        <h2 className="text-white text-2xl font-bold mb-6">{t('quiz.paused')}</h2>
        
        <Button 
          onClick={onResume} 
          className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
        >
          <Play className="h-5 w-5 mr-2" />
          {t('quiz.resume')}
        </Button>
      </motion.div>
    </motion.div>
  );
}