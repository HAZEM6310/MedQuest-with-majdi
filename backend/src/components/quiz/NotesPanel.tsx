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
          // PGRST116 means no rows returned, which is not an error for us
          console.error('Error fetching note:', error);
          toast.error('Failed to load your note');
        }

        setNote(data || null);
        if (data) {
          setNoteContent(data.note_content);
        } else {
          setNoteContent('');
          // Enable editing mode when there's no existing note
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Pencil className="w-5 h-5 mr-2" /> 
          {t('notes.yourNotes')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {isEditing ? (
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={t('notes.placeholder')}
            className="flex-1 min-h-[150px] resize-none"
            autoFocus
          />
        ) : note ? (
          <div className="flex-1 overflow-auto">
            <div className="whitespace-pre-wrap">{note.note_content}</div>
            <div className="text-xs text-muted-foreground mt-4">
              {t('notes.lastUpdated')} {formatDate(note.updated_at)}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            <p>{t('notes.noNoteYet')}</p>
            <p className="text-sm">{t('notes.clickEditToStart')}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 flex justify-between border-t">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel}>
              {t('ui.cancel')}
            </Button>
            <Button onClick={saveNote} disabled={noteContent.trim() === ''}>
              <Save className="w-4 h-4 mr-2" /> {t('ui.save')}
            </Button>
          </>
        ) : (
          <>
            {hasNote && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" /> {t('ui.delete')}
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
            <Button onClick={handleEdit}>
              <Pencil className="w-4 h-4 mr-2" /> {hasNote ? t('ui.edit') : t('notes.createNote')}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}