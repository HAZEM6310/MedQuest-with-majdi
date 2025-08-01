import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

interface Faculty {
  id: string;
  name: string;
  name_en: string;
  name_fr: string;
  university_name: string | null;
  university_name_en: string | null;
  university_name_fr: string | null;
  is_active: boolean;
  order_index: number;
}

interface NewFacultyData {
  name_en: string;
  name_fr: string;
  university_name_en: string;
  university_name_fr: string;
  is_active: boolean;
  order_index: number;
}

export default function FacultyManagement() {
  const [newFaculty, setNewFaculty] = useState<NewFacultyData>({
    name_en: "",
    name_fr: "",
    university_name_en: "",
    university_name_fr: "",
    is_active: true,
    order_index: 1
  });
  
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  
  const queryClient = useQueryClient();
  
  // Fetch faculties
  const { data: faculties = [] } = useQuery<Faculty[]>({
    queryKey: ['faculties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .order('order_index');
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Add faculty mutation
  const addFacultyMutation = useMutation({
    mutationFn: async (faculty: NewFacultyData) => {
      const { data, error } = await supabase
        .from('faculties')
        .insert([{
          name: faculty.name_en, // Legacy field
          name_en: faculty.name_en,
          name_fr: faculty.name_fr,
          university_name: faculty.university_name_en, // Legacy field
          university_name_en: faculty.university_name_en,
          university_name_fr: faculty.university_name_fr,
          is_active: faculty.is_active,
          order_index: faculty.order_index
        }])
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      setNewFaculty({
        name_en: "",
        name_fr: "",
        university_name_en: "",
        university_name_fr: "",
        is_active: true,
        order_index: 1
      });
      toast.success("Faculty added successfully");
    },
    onError: (error) => {
      console.error('Error adding faculty:', error);
      toast.error("Failed to add faculty");
    }
  });
  
  // Update faculty mutation
  const updateFacultyMutation = useMutation({
    mutationFn: async (faculty: Faculty) => {
      const { error } = await supabase
        .from('faculties')
        .update({
          name: faculty.name_en, // Legacy field
          name_en: faculty.name_en,
          name_fr: faculty.name_fr,
          university_name: faculty.university_name_en, // Legacy field
          university_name_en: faculty.university_name_en,
          university_name_fr: faculty.university_name_fr,
          is_active: faculty.is_active,
          order_index: faculty.order_index
        })
        .eq('id', faculty.id);
        
      if (error) throw error;
      return faculty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      setIsEditDialogOpen(false);
      setEditingFaculty(null);
      toast.success("Faculty updated successfully");
    },
    onError: (error) => {
      console.error('Error updating faculty:', error);
      toast.error("Failed to update faculty");
    }
  });
  
  // Delete faculty mutation
  const deleteFacultyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faculties')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      setIsDeleteDialogOpen(false);
      setFacultyToDelete(null);
      toast.success("Faculty deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting faculty:', error);
      toast.error("Failed to delete faculty");
    }
  });
  
  const handleAddFaculty = () => {
    if (!newFaculty.name_en || !newFaculty.name_fr) {
      toast.error("Faculty name is required in both English and French");
      return;
    }
    
    addFacultyMutation.mutate(newFaculty);
  };
  
  const handleUpdateFaculty = () => {
    if (!editingFaculty) return;
    
    if (!editingFaculty.name_en || !editingFaculty.name_fr) {
      toast.error("Faculty name is required in both English and French");
      return;
    }
    
    updateFacultyMutation.mutate(editingFaculty);
  };
  
  const handleDeleteFaculty = () => {
    if (!facultyToDelete) return;
    deleteFacultyMutation.mutate(facultyToDelete.id);
  };
  
  const openEditDialog = (faculty: Faculty) => {
    setEditingFaculty({ ...faculty });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (faculty: Faculty) => {
    setFacultyToDelete(faculty);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Faculty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name-en">Name (English)</Label>
              <Input
                id="name-en"
                value={newFaculty.name_en}
                onChange={(e) => setNewFaculty({...newFaculty, name_en: e.target.value})}
                placeholder="Faculty of Medicine"
              />
            </div>
            <div>
              <Label htmlFor="name-fr">Name (French)</Label>
              <Input
                id="name-fr"
                value={newFaculty.name_fr}
                onChange={(e) => setNewFaculty({...newFaculty, name_fr: e.target.value})}
                placeholder="Faculté de Médecine"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="university-en">University Name (English)</Label>
              <Input
                id="university-en"
                value={newFaculty.university_name_en}
                onChange={(e) => setNewFaculty({...newFaculty, university_name_en: e.target.value})}
                placeholder="McGill University"
              />
            </div>
            <div>
              <Label htmlFor="university-fr">University Name (French)</Label>
              <Input
                id="university-fr"
                value={newFaculty.university_name_fr}
                onChange={(e) => setNewFaculty({...newFaculty, university_name_fr: e.target.value})}
                placeholder="Université McGill"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="order-index">Display Order</Label>
              <Input
                id="order-index"
                type="number"
                value={newFaculty.order_index}
                onChange={(e) => setNewFaculty({...newFaculty, order_index: parseInt(e.target.value) || 1})}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="is-active"
                checked={newFaculty.is_active}
                onCheckedChange={(checked) => setNewFaculty({...newFaculty, is_active: checked})}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </div>
          
          <Button 
            className="mt-4"
            onClick={handleAddFaculty}
            disabled={!newFaculty.name_en || !newFaculty.name_fr || addFacultyMutation.isPending}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {addFacultyMutation.isPending ? "Adding..." : "Add Faculty"}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Faculty List</CardTitle>
        </CardHeader>
        <CardContent>
          {faculties.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No faculties found. Add your first faculty above.</p>
          ) : (
            <div className="space-y-4">
              {faculties.map((faculty) => (
                <div key={faculty.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{faculty.name_en}</h3>
                    <p className="text-sm text-muted-foreground">{faculty.university_name_en}</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-1 ${faculty.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-xs">{faculty.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(faculty)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(faculty)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
          </DialogHeader>
          
          {editingFaculty && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name-en">Name (English)</Label>
                  <Input
                    id="edit-name-en"
                    value={editingFaculty.name_en}
                    onChange={(e) => setEditingFaculty({...editingFaculty, name_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-name-fr">Name (French)</Label>
                  <Input
                    id="edit-name-fr"
                    value={editingFaculty.name_fr}
                    onChange={(e) => setEditingFaculty({...editingFaculty, name_fr: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-university-en">University Name (English)</Label>
                  <Input
                    id="edit-university-en"
                    value={editingFaculty.university_name_en || ''}
                    onChange={(e) => setEditingFaculty({
                      ...editingFaculty, 
                      university_name_en: e.target.value,
                      university_name: e.target.value // Update legacy field
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-university-fr">University Name (French)</Label>
                  <Input
                    id="edit-university-fr"
                    value={editingFaculty.university_name_fr || ''}
                    onChange={(e) => setEditingFaculty({...editingFaculty, university_name_fr: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-order-index">Display Order</Label>
                  <Input
                    id="edit-order-index"
                    type="number"
                    value={editingFaculty.order_index}
                    onChange={(e) => setEditingFaculty({
                      ...editingFaculty, 
                      order_index: parseInt(e.target.value) || editingFaculty.order_index
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="edit-is-active"
                    checked={editingFaculty.is_active}
                    onCheckedChange={(checked) => setEditingFaculty({...editingFaculty, is_active: checked})}
                  />
                  <Label htmlFor="edit-is-active">Active</Label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateFaculty}
              disabled={updateFacultyMutation.isPending}
            >
              {updateFacultyMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Faculty</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to delete the faculty:</p>
            <p className="font-semibold mt-2">{facultyToDelete?.name_en}</p>
            <p className="text-sm text-muted-foreground mt-1">This action cannot be undone.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteFaculty}
              disabled={deleteFacultyMutation.isPending}
            >
              {deleteFacultyMutation.isPending ? "Deleting..." : "Delete Faculty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}