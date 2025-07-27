import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Year, Subject, Course, Question, Option } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { Trash2, PlusCircle } from "lucide-react";

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'year' | 'subject' | 'course' | 'question';
  item: Year | Subject | Course | Question | null;
  onUpdate: () => void;
  years?: Year[];
  subjects?: Subject[];
  courses?: Course[];
}

export default function EditContentModal({
  isOpen,
  onClose,
  type,
  item,
  onUpdate,
  years = [],
  subjects = [],
  courses = []
}: EditContentModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<any>({});
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData(item);
      if (type === 'question') {
        fetchOptions();
      }
    }
  }, [item, type]);

  const fetchOptions = async () => {
    if (!item || type !== 'question') return;
    
    try {
      const { data, error } = await supabase
        .from('options')
        .select('*')
        .eq('question_id', item.id);
      
      if (error) throw error;
      setOptions(data || []);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let updateData: any = {};
      
      if (type === 'year') {
        updateData = {
          name: formData.name_en,
          name_en: formData.name_en,
          name_fr: formData.name_fr,
          description: formData.description_en,
          description_en: formData.description_en,
          description_fr: formData.description_fr,
          order_index: formData.order_index
        };
      } else if (type === 'subject') {
        updateData = {
          year_id: formData.year_id,
          name: formData.name_en,
          name_en: formData.name_en,
          name_fr: formData.name_fr,
          description: formData.description_en,
          description_en: formData.description_en,
          description_fr: formData.description_fr,
          order_index: formData.order_index
        };
      } else if (type === 'course') {
        updateData = {
          subject_id: formData.subject_id,
          title: formData.title_en,
          title_en: formData.title_en,
          title_fr: formData.title_fr,
          description: formData.description_en,
          description_en: formData.description_en,
          description_fr: formData.description_fr,
          category: formData.category,
          is_free: formData.is_free
        };
      } else if (type === 'question') {
        updateData = {
          course_id: formData.course_id,
          text: formData.text_en,
          text_en: formData.text_en,
          text_fr: formData.text_fr,
          explanation: formData.explanation_en,
          explanation_en: formData.explanation_en,
          explanation_fr: formData.explanation_fr
        };
      }

      const { error } = await supabase
        .from(`${type}s`)
        .update(updateData)
        .eq('id', item!.id);

      if (error) throw error;

      // Update options for questions
      if (type === 'question' && options.length > 0) {
        for (const option of options) {
          const { error: optionError } = await supabase
            .from('options')
            .update({
              text: option.text_en,
              text_en: option.text_en,
              text_fr: option.text_fr,
              is_correct: option.is_correct
            })
            .eq('id', option.id);

          if (optionError) throw optionError;
        }
      }

      toast.success(`${type} updated successfully`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating:', error);
      toast.error(`Failed to update ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, field: keyof Option, value: any) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setOptions(updatedOptions);
  };

  const addOption = () => {
    const newOption: Option = {
      id: `temp-${Date.now()}`,
      question_id: item!.id,
      text: '',
      text_en: '',
      text_fr: '',
      is_correct: false,
      created_at: new Date().toISOString()
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(`admin.edit${type.charAt(0).toUpperCase() + type.slice(1)}`)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {type === 'year' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Name (EN)</Label>
                  <Input
                    value={formData.name_en || ''}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Name (FR)</Label>
                  <Input
                    value={formData.name_fr || ''}
                    onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Description (EN)</Label>
                  <Textarea
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Description (FR)</Label>
                  <Textarea
                    value={formData.description_fr || ''}
                    onChange={(e) => setFormData({...formData, description_fr: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={formData.order_index || 1}
                  onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                />
              </div>
            </>
          )}

          {type === 'subject' && (
            <>
              <div>
                <Label>Year</Label>
                <Select value={formData.year_id} onValueChange={(value) => setFormData({...formData, year_id: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name_en || year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Name (EN)</Label>
                  <Input
                    value={formData.name_en || ''}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Name (FR)</Label>
                  <Input
                    value={formData.name_fr || ''}
                    onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Description (EN)</Label>
                  <Textarea
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Description (FR)</Label>
                  <Textarea
                    value={formData.description_fr || ''}
                    onChange={(e) => setFormData({...formData, description_fr: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={formData.order_index || 1}
                  onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                />
              </div>
            </>
          )}

          {type === 'course' && (
            <>
              <div>
                <Label>Subject</Label>
                <Select value={formData.subject_id} onValueChange={(value) => setFormData({...formData, subject_id: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name_en || subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Title (EN)</Label>
                  <Input
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Title (FR)</Label>
                  <Input
                    value={formData.title_fr || ''}
                    onChange={(e) => setFormData({...formData, title_fr: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Description (EN)</Label>
                  <Textarea
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Description (FR)</Label>
                  <Textarea
                    value={formData.description_fr || ''}
                    onChange={(e) => setFormData({...formData, description_fr: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_free"
                  checked={formData.is_free || false}
                  onCheckedChange={(checked) => setFormData({...formData, is_free: checked})}
                />
                <Label htmlFor="is_free">Free Course</Label>
              </div>
            </>
          )}

          {type === 'question' && (
            <>
              <div>
                <Label>Course</Label>
                <Select value={formData.course_id} onValueChange={(value) => setFormData({...formData, course_id: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title_en || course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Question (EN)</Label>
                  <Textarea
                    value={formData.text_en || ''}
                    onChange={(e) => setFormData({...formData, text_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Question (FR)</Label>
                  <Textarea
                    value={formData.text_fr || ''}
                    onChange={(e) => setFormData({...formData, text_fr: e.target.value})}
                  />
                </div>
              </div>
              
              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Options (Multiple correct answers allowed)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Checkbox
                          checked={option.is_correct}
                          onCheckedChange={(checked) => handleOptionChange(index, 'is_correct', checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium w-6">
                          {String.fromCharCode(65 + index)}:
                        </span>
                      </div>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)} (EN)`}
                        value={option.text_en || ''}
                        onChange={(e) => handleOptionChange(index, 'text_en', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)} (FR)`}
                        value={option.text_fr || ''}
                        onChange={(e) => handleOptionChange(index, 'text_fr', e.target.value)}
                        className="flex-1"
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Explanation (EN)</Label>
                  <Textarea
                    value={formData.explanation_en || ''}
                    onChange={(e) => setFormData({...formData, explanation_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Explanation (FR)</Label>
                  <Textarea
                    value={formData.explanation_fr || ''}
                    onChange={(e) => setFormData({...formData, explanation_fr: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('ui.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? t('ui.loading') : t('ui.update')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
