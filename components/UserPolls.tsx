"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FaTrash, FaEdit, FaPoll, FaCopy } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi2";
import { CustomAlert } from "@/components/CustomAlert";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Poll {
  id: string;
  title: string;
  description: string;
  created_at: string;
  voters_count: number;
}

export default function UserPolls() {
  const { user } = useUser();
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false); // Added state for alert visibility

  useEffect(() => {
    if (!user) return;

    async function fetchUserPolls() {
      setLoading(true);

      const { data: polls, error: pollsError } = await supabase
        .from("polls")
        .select("*")
        .eq("user_id", user?.id);

      if (pollsError) {
        console.error("error fetching polls:", pollsError);
        setLoading(false);
        return;
      }

      const enrichedPolls = await Promise.all(
        (polls || []).map(async (poll) => {
          const { count, error: votersError } = await supabase
            .from("votes")
            .select("*", { count: "exact", head: true })
            .eq("poll_id", poll.id);

          if (votersError) {
            console.error(`error fetching voters for poll ${poll.id}:`, votersError);
          }

          return {
            ...poll,
            voters_count: count || 0,
          };
        })
      );

      setPolls(enrichedPolls || []);
      setLoading(false);
    }

    fetchUserPolls();
  }, [user]);

  async function handleDeletePoll(pollId: string) {
    if (!confirm("Are you sure you want to delete this poll?")) return;

    const { error } = await supabase.from("polls").delete().eq("id", pollId);

    if (error) {
      console.error("error deleting poll:", error);
      alert("Failed to delete poll.");
    } else {
      alert("Poll deleted successfully.");
      setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
    }
  }

  function handleEditPoll(pollId: string) {
    router.push(`/edit/${pollId}`);
  }

  function handleCopy(pollId: string) {
    const url = `${window.location.origin}/poll/${pollId}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowAlert(true); // Show the alert when URL is copied
      setTimeout(() => setShowAlert(false), 3000); // Hide the alert after 3 seconds
    }).catch((error) => {
      console.error("Error copying URL:", error);
    });
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Created Polls</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : polls.length === 0 ? (
        <p className="text-gray-500">You haven’t created any polls yet.</p>
      ) : (
        <div className="grid gap-4 items-center justify-center">
          {polls.map((poll) => (
            <Card key={poll.id} className="flex items-center justify-between  border-black/40 ">
              <CardHeader>
                <CardTitle className="text-lg font-semibold capitalize">{poll.title}</CardTitle>
                <div className="flex gap-x-4">
                  <div className="flex items-center justify-center gap-2">
                    <HiOutlineCalendar />
                    <p className="text-s text-gray-600 mt-1">
                      {new Date(poll.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <FaPoll />
                    <p className="text-s text-gray-600 mt-1 flex items-center gap-1">
                      {poll.voters_count} Voters
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleCopy(poll.id)}
                >
                  <FaCopy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleEditPoll(poll.id)}
                >
                  <FaEdit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleDeletePoll(poll.id)}
                >
                  <FaTrash className="h-4 w-4" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Conditionally render the alert */}
      {showAlert && (
        <CustomAlert title="URL copied to clipboard!" description="You can now share the poll link with others." />
      )}
    </div>
  );
}
