'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeGrid } from '@/components/TimeGrid';
import { format, startOfWeek, addDays } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { SelectWeek } from '@/components/SelectWeek';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy } from "lucide-react"; // Import the copy icon

export function CreatePoll() {
  const [date, setDate] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [title, setTitle] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollLink, setPollLink] = useState<string | null>(null); // state for poll link
  const [copySuccess, setCopySuccess] = useState(false); // state to show copy success
  const [customFields, setCustomFields] = useState<string[]>([]); // state to store custom fields
  const [isDialogOpen, setIsDialogOpen] = useState(false); // state to manage dialog visibility
  const router = useRouter();
  const { user } = useUser();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Function to handle adding custom fields
  const handleAddCustomField = () => {
    if (customFields.length < 2) {
      setCustomFields([...customFields, '']);
    }
  };

  // Handle input change for custom fields
  const handleCustomFieldChange = (index: number, value: string) => {
    const updatedFields = [...customFields];
    updatedFields[index] = value;
    setCustomFields(updatedFields);
  };

  // Function to handle the creation of the poll and generating the poll link
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!user) {
      console.error('User is not authenticated');
      return;
    }

    const unavailableTimes = selectedTimes; // the selected times represent the unavailable times
    const pollTitle = title;
    const selectedDateRange = `${format(
      startOfWeek(date || new Date(), { weekStartsOn: 1 }),
      'd MMMM yyyy'
    )} to ${format(
      addDays(startOfWeek(date || new Date(), { weekStartsOn: 1 }), 6),
      'd MMMM yyyy'
    )}`;

    // Save poll data to Supabase, including required custom fields
    const { data, error } = await supabase
      .from('polls')
      .insert([{
        title: pollTitle,
        user_id: user.id,
        name: user.fullName,
        image_url: user.imageUrl,
        unavailable_times: unavailableTimes,
        start_date: startOfWeek(date || new Date(), { weekStartsOn: 1 }),
        end_date: addDays(startOfWeek(date || new Date(), { weekStartsOn: 1 }), 6),
        required_fields: JSON.stringify(customFields) // Store the custom fields as JSON
      }])
      .select('id'); // Make sure to explicitly select the `id` field in the response

    if (error) {
      console.error('Error creating poll:', error.message);
      return;
    }

    // Now `data` should contain the `id` because we selected it explicitly
    const generatedPollLink = `${window.location.origin}/poll/${data[0].id}`;
    setPollLink(generatedPollLink); // Set the poll link state
    setIsDialogOpen(true); // Open the dialog once the poll is created
  }

  // Function to copy the poll link to the clipboard
  const copyToClipboard = () => {
    if (pollLink) {
      navigator.clipboard.writeText(pollLink)
        .then(() => {
          setCopySuccess(true); // Show success feedback
          setTimeout(() => setCopySuccess(false), 2000); // Reset feedback after 2 seconds
        })
        .catch((err) => console.error('Failed to copy:', err));
    }
  };

  return (
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Poll Title and Week Selector Card */}
        <Card className="p-4 shadow-lg rounded-lg bg-white">
          <h1 className="text-2xl font-bold text-center mb-4">Create A New Poll</h1>

          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Poll Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Team Meeting"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="week-select">Select Week</Label>
              <SelectWeek id="week-select" onWeekSelect={(startOfWeekDate) => setDate(startOfWeekDate)} />
            </div>
            {date && (
              <div className="text-sm text-muted-foreground mt-4">
                {`Selected week: ${format(
                  startOfWeek(date, { weekStartsOn: 1 }),
                  'd MMMM yyyy'
                )} to ${format(
                  addDays(startOfWeek(date, { weekStartsOn: 1 }), 6),
                  'd MMMM yyyy'
                )}`}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Custom Fields (Optional)</h2>
            <div>
              {customFields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`field-${index}`}>Field {index + 1}</Label>
                  <Input
                    id={`field-${index}`}
                    value={field}
                    onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                    placeholder={`Custom Field ${index + 1}`}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleAddCustomField} disabled={customFields.length >= 2}>
              Add Custom Field
            </Button>
          </div>
        </Card>

        {/* Time Grid Card */}
        <Card className="p-4 shadow-lg rounded-lg bg-white col-span-2 lg:col-span-2">
          <h2 className="text-2xl font-semibold text-center mb-4">Select Unavailable Time</h2>
          <TimeGrid
            selectedDate={date}
            selectedTimes={selectedTimes}
            onTimeSelect={(times) => setSelectedTimes(times)}
            color="bg-red-400"
          />
          <div className="mt-8 flex justify-end">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!title || !date || isSubmitting}
              className="bg-primary text-white hover:bg-primary-dark"
            >
              Create and Share Poll
            </Button>
          </div>
        </Card>
      </div>

      {/* Dialog to display Poll Link and Copy Button */}
      {pollLink && isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Poll Link</DialogTitle>
              <DialogDescription>
                Share the link with others to participate in your poll.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">Link</Label>
                <Input
                  id="link"
                  value={pollLink}
                  readOnly
                  className="w-full"
                />
              </div>
              <Button
                onClick={copyToClipboard}
                size="sm"
                className="px-3"
              >
                <span className="sr-only">Copy</span>
                <Copy />
              </Button>
            </div>
            {copySuccess && <p className="text-green-500 mt-2">Link copied to clipboard!</p>}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
