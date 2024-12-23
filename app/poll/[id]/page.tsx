'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@clerk/nextjs';
import { format, startOfWeek } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TimeGrid } from '@/components/TimeGrid';
import { useParams } from 'next/navigation';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Assuming you're using the shadcn table component



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PollPage() {
  const [poll, setPoll] = useState<any>(null);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});
  const [requiredFields, setRequiredFields] = useState<string[]>([]); // Ensure this is an array
  const { user } = useUser();
  const id = useParams().id;

  // Fetch poll data and votes data
  useEffect(() => {
    if (!id) return;

    async function fetchPoll() {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching poll:', error);
        return;
      }

      setPoll(data);

      const fields = data.required_fields;
      console.log('Type of fields:', typeof fields);
      console.log('Fields content:', fields);  // Log the actual content

      let requiredFields: string[] = [];

      if (fields === null) {
        requiredFields = []; // No required fields
      } else if (Array.isArray(fields)) {
        requiredFields = fields; // It's already an array
      } else if (typeof fields === 'string') {
        console.log('Fields is a string');

        // Split the string by commas, remove extra spaces, remove quotes and ensure it becomes an array
        requiredFields = fields
          .split(',')
          .map(field => field.trim().replace(/['"\[\]]+/g, '')); // Remove quotes and square brackets


      } else {
        requiredFields = []; // Default case (if it's neither null, array, nor string)
      }

      setRequiredFields(requiredFields);
    }

    async function fetchVotes() {
      const { data, error } = await supabase
        .from('votes')
        .select('preferred_times, created_at, voter_info')
        .eq('poll_id', id);

      if (error) {
        console.error('Error fetching votes:', error);
        return;
      }

      setVotes(data);
    }

    fetchPoll();
    fetchVotes();
  }, [id]);

  const handleTimeSelect = (times: string[]) => {
    setSelectedTimes(times);
  };

  const handleVoteSubmit = async () => {
    if (selectedTimes.length === 0) {
      alert('Please select at least one time slot.');
      return;
    }
    console.log('Required fields:', requiredFields.length);

    if (requiredFields.length > 0) {

      setIsDialogOpen(true); // Open the dialog to collect required fields
      return;
    }

    submitVote();
  };

  const submitVote = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('votes')
        .insert([{
          poll_id: poll.id,
          preferred_times: selectedTimes,
          voter_info: userInfo,
        }]);

      if (error) {
        console.error('Error submitting vote:', error);
        alert('Failed to submit vote.');
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting the vote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleDialogSubmit = () => {
    if (requiredFields.some(field => !userInfo[field])) {
      alert('Please fill in all required fields.');
      return;
    }

    submitVote();
    setIsDialogOpen(false); // Close the dialog after submitting the vote
  };

  if (!poll) return <div>Loading...</div>;

  const pollStartDate = new Date(poll.start_date);
  pollStartDate.setDate(pollStartDate.getDate() + 1);
  const gridStartDate = startOfWeek(pollStartDate, { weekStartsOn: 1 });

  const selectedDateRange = `${format(new Date(poll.start_date), 'yyyy-MM-dd')} to ${format(
    new Date(poll.end_date),
    'yyyy-MM-dd'
  )}`;

  const timeFrequency: { [key: string]: number } = {};

  votes.forEach((vote) => {
    vote.preferred_times.forEach((time: string) => {
      timeFrequency[time] = (timeFrequency[time] || 0) + 1;
    });
  });
  const timeAgo = (voteTime: Date) => formatDistanceToNow(new Date(voteTime), { addSuffix: true });


  return (
    <div className="container mx-auto px-4 py-8">

      <div className="grid grid-cols-2 gap-8 items-center justify-center">
        <h1 className="text-2xl font-bold mb-0">Poll: {poll.title}</h1>
        <div className="flex lg:flex-row items-center justify-end gap-4">
          <Avatar>
            <AvatarImage src={poll?.image_url} />
            <AvatarFallback>User profile</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">Created by: {poll?.name}</p>
            <p className="text-sm text-muted-foreground">Date Range: {selectedDateRange}</p>
          </div>
        </div>
      </div>







      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Available Time Slots</h2>
        <TimeGrid
          selectedDate={gridStartDate}
          selectedTimes={selectedTimes}
          onTimeSelect={handleTimeSelect}
          unavailableTimes={poll.unavailable_times}
          timeFrequency={timeFrequency}
        />
      </Card>

      <div className="flex justify-center mt-6">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          onClick={handleVoteSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Vote'}
        </button>
      </div>

      {/* Dialog for filling in required fields */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Required Information</DialogTitle>
              <DialogDescription>
                Please fill in the following fields to submit your vote.
              </DialogDescription>
            </DialogHeader>
            {requiredFields.map((field) => (
              <div key={field} className="mt-4">
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                  {field}
                </label>
                <Input
                  id={field}
                  type="text"
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="mt-2 p-2 border rounded-md w-full"
                />
              </div>
            ))}
            <DialogFooter>
              <Button onClick={handleDialogSubmit} className="bg-blue-600 text-white">
                Submit
              </Button>
              <DialogClose asChild>
                <Button className="text-gray-500">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Card className="p-6 mt-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Voters List</h2>
        <Table className="min-w-full  border-collapse">
          <TableHeader className="bg-gray-200">
            <TableRow>
              {/* Show 'Voter' column only when requiredFields is empty */}
              {requiredFields.length === 0 ? (
                <TableHead className="py-3 px-6 text-lg font-medium text-gray-700">Voter</TableHead>
              ) : (
                <TableHead />
              )}

              {/* Display dynamic fields if requiredFields has values */}
              {requiredFields.length > 0 &&
                requiredFields.map((field, index) => (
                  <TableHead key={index} className="py-3 px-6 text-lg font-medium text-gray-700">{field}</TableHead>
                ))}
              <TableHead className="py-3 px-6 text-lg font-medium text-gray-700">Voted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {votes.map((vote, index) => {
              const voteTime = new Date(vote.created_at);
              return (
                <TableRow key={index} className="hover:bg-gray-100 border-b">
                  {/* If requiredFields is empty, show 'Anonymous' in the first cell */}
                  {requiredFields.length === 0 ? (
                    <TableCell className="py-3 px-6 text-gray-800">Anonymous</TableCell>
                  ) : (
                    <TableCell className="py-3 px-6 text-gray-800">{vote.voter_info?.name}</TableCell>
                  )}

                  {/* Display dynamic fields only if requiredFields has values */}
                  {requiredFields.length > 0 &&
                    requiredFields.map((field, idx) => {
                      const fieldValue = vote.voter_info?.[field] || 'N/A';
                      return <TableCell key={idx} className="py-3 px-6 text-gray-800">{fieldValue}</TableCell>;
                    })}

                  {/* Display time voted */}
                  <TableCell className="py-3 px-6 text-gray-800">{timeAgo(voteTime)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>



    </div>
  );
}