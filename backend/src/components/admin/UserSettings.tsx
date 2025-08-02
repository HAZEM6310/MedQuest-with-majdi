import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { User, Search, CalendarPlus, Trash2, AlertTriangle } from "lucide-react";
import { useMutation } from '@tanstack/react-query';

interface UserDetails {
  id: string;
  email: string;
  full_name: string | null;
  subscription_end_date: string | null;
  created_at: string;
  credits: number;
  voucher_code: string | null;
  is_admin: boolean;
}

const UserSettings = () => {
  const [email, setEmail] = useState('');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchUser = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
        
      if (profileError) throw profileError;
      
      if (!profileData) {
        toast.error("No user found with that email address");
        setUserDetails(null);
        setIsLoading(false);
        return;
      }
      
      setUserDetails(profileData as UserDetails);
      toast.success("User found");
      
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error("Failed to fetch user details");
    }
    
    setIsLoading(false);
  };
  
  const addFreeMonth = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .rpc('admin_add_subscription_months', { 
          user_id: userId, 
          months: 1 
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Free month added to user's subscription");
      // Refresh user details
      if (userDetails) {
        setIsLoading(true);
        searchUser();
      }
    },
    onError: (error) => {
      console.error("Error adding free month:", error);
      toast.error("Failed to add free month to subscription");
    }
  });
  
  const deleteUserAccount = useMutation({
    mutationFn: async (userId: string) => {
      // Use a safer approach that only deletes from tables we know exist
      // First, check if there's a subscriptions table and delete from it
      try {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        // If this table doesn't exist, we can ignore the error
        console.log("Note: subscriptions table may not exist");
      }
      
      // Delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      return userId;
    },
    onSuccess: (userId) => {
      toast.success("User account deleted successfully");
      setUserDetails(null);
      setEmail('');
      
      // Log for admin reference that auth record might remain
      console.log(`Profile for user ${userId} deleted. Note: The auth record may still exist in the auth.users table.`);
    },
    onError: (error) => {
      console.error("Error deleting user account:", error);
      toast.error(`Failed to delete user account: ${(error as any).message || 'Unknown error'}`);
    }
  });
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  const isSubscriptionActive = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) > new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          User Settings
        </CardTitle>
        <CardDescription>Manage user accounts and subscriptions</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="user-email">Search by Email</Label>
          <div className="flex gap-2">
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex-1"
            />
            <Button 
              onClick={searchUser} 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? "Searching..." : <><Search className="h-4 w-4 mr-2" /> Search</>}
            </Button>
          </div>
        </div>
        
        {userDetails && (
          <div className="border rounded-lg p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Information</h3>
                <Badge variant={userDetails.is_admin ? "default" : "outline"}>
                  {userDetails.is_admin ? "Admin" : "User"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="font-medium">Email</div>
                <div>{userDetails.email}</div>
                
                <div className="font-medium">Name</div>
                <div>{userDetails.full_name || "Not provided"}</div>
                
                <div className="font-medium">Joined on</div>
                <div>{formatDate(userDetails.created_at)}</div>
                
                <div className="font-medium">Subscription Status</div>
                <div className="flex items-center">
                  <Badge variant={isSubscriptionActive(userDetails.subscription_end_date) ? "success" : "destructive"}>
                    {isSubscriptionActive(userDetails.subscription_end_date) ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="font-medium">Subscription Ends</div>
                <div>{formatDate(userDetails.subscription_end_date)}</div>
                
                <div className="font-medium">Credits</div>
                <div>{userDetails.credits || 0}</div>
                
                <div className="font-medium">Last Voucher Used</div>
                <div>{userDetails.voucher_code || "None"}</div>
              </div>
              
              <div className="flex justify-between pt-4 mt-4 border-t">
                <Button
                  onClick={() => addFreeMonth.mutate(userDetails.id)}
                  disabled={addFreeMonth.isPending}
                  variant="outline"
                >
                  <CalendarPlus className="h-4 w-4 mr-2" /> 
                  {addFreeMonth.isPending ? "Adding..." : "Add 1 Month Free"}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-destructive" /> Delete User Account
                        </div>
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this account? This action cannot be undone.
                        <div className="mt-2 p-2 bg-muted rounded-md">
                          <p className="font-medium">{userDetails.email}</p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Note: This will delete user data from the profiles table. The auth record might require additional cleanup later.
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUserAccount.mutate(userDetails.id)}
                        disabled={deleteUserAccount.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteUserAccount.isPending ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSettings;