// lib/database.types.ts

export type Poll = {
    id: string;
    title: string;
    user_id: string;
    week_start: string; // formatted date string, e.g., '2024-12-22'
  };
  
  export type Vote = {
    id: string;
    user_id: string;
    poll_id: string;
    time_slot: string;
  };
  
  export type Database = {
    polls: Poll;
    votes: Vote;
  };
  