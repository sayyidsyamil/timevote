'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeGrid } from '@/components/TimeGrid';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CustomAlert } from '@/components/CustomAlert'; // Assuming this component is defined elsewhere

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditPoll() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useUser();

  const [poll, setPoll] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // New state for the custom alert

  useEffect(() => {
    if (!id) return;

    // Fetch poll details
    async function fetchPoll() {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching poll:', error.message);
        return;
      }

      if (data.user_id !== user?.id) {
        setShowAlert(true); // Show alert if unauthorized
        router.push(`/poll/${id}`);
        return;
      }

      setPoll(data);
      setTitle(data.title);
      setSelectedTimes(data.unavailable_times || []);
    }

    // Fetch existing votes
    async function fetchVotes() {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('poll_id', id);

      if (error) {
        console.error('Error fetching votes:', error.message);
        return;
      }

      setVotes(data);
    }

    fetchPoll();
    fetchVotes();
  }, [id, user?.id]);

  // Handle time grid selection
  const handleTimeSelect = (times: string[]) => {
    setSelectedTimes(times);
  };

  // Handle poll update
  const handleSaveChanges = async () => {
    setIsSubmitting(true);

    const { error } = await supabase
      .from('polls')
      .update({
        title,
        unavailable_times: selectedTimes,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating poll:', error.message);
      setShowAlert(true); // Show alert on error
    } else {
      setShowAlert(true); // Show alert on success
      router.push(`/poll/${id}`);
    }

    setIsSubmitting(false);
  };

  // Handle delete votes
  const handleDeleteVotes = async () => {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('poll_id', id);

    if (error) {
      console.error('Error deleting votes:', error.message);
      setShowAlert(true); // Show alert on error
    } else {
      setVotes([]);
      setShowAlert(true); // Show alert on success
    }

    setIsDialogOpen(false);
  };

  if (!poll) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <Card className="p-6 shadow-lg bg-white rounded-lg border border-black/40">
        <h1 className="text-2xl font-bold mb-4">Edit Poll: {poll.title}</h1>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Poll Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Update poll title"
              className="w-full"
            />
          </div>

          <div>
            <Label>Update Unavailable Times</Label>
            <TimeGrid
              selectedDate={new Date(poll.start_date)}
              selectedTimes={selectedTimes}
              onTimeSelect={handleTimeSelect}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              className="bg-primary text-white"
            >
              Save Changes
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-red-600 text-white"
            >
              Delete Votes
            </Button>
          </div>
        </div>
      </Card>

      {/* Custom alert for feedback */}
      {showAlert && (
        <CustomAlert 
          title="Operation Successful" 
          description="The changes were successfully saved or the votes were deleted." 
        />
      )}

      {/* Confirmation dialog for deleting votes */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <p>Are you sure you want to delete all votes? This action cannot be undone.</p>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleDeleteVotes} className="bg-red-600 text-white">
                Confirm
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} className="text-gray-500">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
