import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Pencil, Save, Trash2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QuestionNote {
  id: string;
  user_id: string;
  question_id: string;
  note_content: string;
  created_at: string;
  updated_at: string;
}

interface NotesPanelProps {
  questionId: string;
}

export default function NotesPanel({ questionId }: NotesPanelProps) {
  const [note, setNote] = useState<QuestionNote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [noteContent, setNoteContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const hasNote = !!note;

  // Fetch note when component mounts or questionId changes
  useEffect(() => {
    if (!user?.id || !questionId) {
      setIsLoading(false);
      return;
    }

    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('question_notes')
          .select('*')
          .eq('user_id', user.id)
          .eq('question_id', questionId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching note:', error);
          toast.error('Failed to load your note');
        }

        setNote(data || null);
        if (data) {
          setNoteContent(data.note_content);
        } else {
          setNoteContent('');
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error in note fetching:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [user?.id, questionId]);

  const saveNote = async () => {
    if (!user?.id || !questionId) return;
    
    try {
      // If we already have a note, update it
      if (note?.id) {
        const { error } = await supabase
          .from('question_notes')
          .update({
            note_content: noteContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', note.id);

        if (error) throw error;
        
        setNote({
          ...note,
          note_content: noteContent,
          updated_at: new Date().toISOString()
        });
        
        toast.success(t('ui.save'));
      } else {
        // Otherwise, create a new note
        const { data, error } = await supabase
          .from('question_notes')
          .insert({
            user_id: user.id,
            question_id: questionId,
            note_content: noteContent
          })
          .select()
          .single();

        if (error) throw error;
        
        setNote(data);
        toast.success(t('notes.createNote'));
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save your note');
    }
  };

  const deleteNote = async () => {
    if (!note?.id) return;
    
    try {
      const { error } = await supabase
        .from('question_notes')
        .delete()
        .eq('id', note.id);

      if (error) throw error;
      
      setNote(null);
      setNoteContent('');
      setIsEditing(true);
      toast.success(t('ui.delete'));
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete your note');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (note) {
      // Revert changes
      setNoteContent(note.note_content);
      setIsEditing(false);
    } else {
      // If there was no note initially, just clear the textarea
      setNoteContent('');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: language === 'fr' ? fr : enUS
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col relative">
      <CardHeader className="pb-2 sticky top-0 z-10 bg-white">
        <CardTitle className="text-lg flex items-center">
          <Pencil className="w-4 h-4 mr-2" /> 
          {t('notes.yourNotes')}
        </CardTitle>
      </CardHeader>
      
      {/* Content with padding at bottom to account for fixed footer */}
      <CardContent className="p-2 pb-16 flex-1 overflow-auto">
        {isEditing ? (
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={t('notes.placeholder')}
            className="resize-none min-h-[200px]"
            autoFocus
          />
        ) : note ? (
          <div>
            <div className="whitespace-pre-wrap">{note.note_content}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {t('notes.lastUpdated')} {formatDate(note.updated_at)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
            <AlertCircle className="w-6 h-6 mb-1 opacity-50" />
            <p className="text-sm">{t('notes.noNoteYet')}</p>
            <p className="text-xs">{t('notes.clickEditToStart')}</p>
          </div>
        )}
      </CardContent>

      {/* Fixed footer at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-between z-10 shadow-md">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              {t('ui.cancel')}
            </Button>
            <Button size="sm" onClick={saveNote} disabled={noteContent.trim() === ''}>
              <Save className="w-3 h-3 mr-1" /> {t('ui.save')}
            </Button>
          </>
        ) : (
          <>
            {hasNote && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-3 h-3 mr-1" /> {t('ui.delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('notes.deleteConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('notes.deleteConfirmDescription')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('ui.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteNote} className="bg-destructive text-destructive-foreground">
                      {t('ui.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button size="sm" onClick={handleEdit}>
              <Pencil className="w-3 h-3 mr-1" /> {hasNote ? t('ui.edit') : t('notes.createNote')}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}