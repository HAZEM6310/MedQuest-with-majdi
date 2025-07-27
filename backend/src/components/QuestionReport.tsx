
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface QuestionReportProps {
  questionId: string;
}

export default function QuestionReport({ questionId }: QuestionReportProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('question_reports')
        .insert({
          question_id: questionId,
          user_id: user.id,
          reason: reason as 'mal_posed' | 'repetitive' | 'incorrect' | 'other',
          description: description || null,
        });

      if (error) throw error;

      toast.success("Question reported successfully");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error) {
      console.error('Error reporting question:', error);
      toast.error("Failed to report question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Flag className="h-4 w-4 mr-2" />
          {t('quiz.report')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('quiz.report')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">{t('quiz.reportReason')}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mal_posed">{t('quiz.malPosed')}</SelectItem>
                <SelectItem value="repetitive">{t('quiz.repetitive')}</SelectItem>
                <SelectItem value="incorrect">{t('quiz.incorrect')}</SelectItem>
                <SelectItem value="other">{t('quiz.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">{t('quiz.reportDescription')}</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
            >
              {isSubmitting ? t('loading') : t('quiz.submitReport')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
