'use client';

import { useState } from 'react';
import { format, startOfMonth, startOfWeek, endOfWeek, addDays, isToday, isAfter, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button'; // Assuming you're using a custom Button component from Shadcn
import { Card } from '@/components/ui/card'; // Assuming you're using a custom Card component from Shadcn
import { Label } from '@/components/ui/label'; // Assuming you're using a custom Label component from Shadcn

// SelectWeek component

export function SelectWeek({ onWeekSelect }: { onWeekSelect: (date: Date) => void }) {
    const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to current date
  
    const getWeeksOfMonth = (date: Date) => {
      const weeks = [];
      let currentDate = startOfMonth(date);
      const today = new Date();
  
      while (currentDate.getMonth() === date.getMonth()) {
        const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
        const endOfWeekDate = endOfWeek(startOfWeekDate, { weekStartsOn: 1 }); // Sunday
  
        if (isToday(startOfWeekDate) || isAfter(startOfWeekDate, today)) {
          const range = `${format(startOfWeekDate, 'd MMMM')} - ${format(endOfWeekDate, 'd MMMM')}`;
          weeks.push({ range, startOfWeekDate });  // Store the actual start date here
        }
  
        currentDate = addDays(startOfWeekDate, 7); // Move to the next week
      }
  
      return weeks;
    };
  
    const weeks = getWeeksOfMonth(selectedDate);
  
    const handleWeekSelect = (week: { range: string; startOfWeekDate: Date }) => {
      setSelectedWeek(week.range);
      onWeekSelect(week.startOfWeekDate); // Pass the start date of the selected week
    };
  
    const handleMonthChange = (monthOffset: number) => {
      if (monthOffset < 0 && isBefore(startOfMonth(selectedDate), startOfMonth(new Date()))) {
        return;
      }
      setSelectedDate(addDays(selectedDate, monthOffset * 30));
    };
  
    return (
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <Button variant="outline" onClick={() => handleMonthChange(-1)}>
            &lt;
          </Button>
          <Label className="text-xl font-semibold">{format(selectedDate, 'MMMM yyyy')}</Label>
          <Button variant="outline" onClick={() => handleMonthChange(1)}>
            &gt;
          </Button>
        </div>
  
        <Card className="p-2">
          <div className="space-y-4">
            {weeks.map((week, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-black border border-black focus:bg-black/80 focus:text-white hover:bg-black/20"
                onClick={() => handleWeekSelect(week)}
              >
                {week.range}
              </Button>
            ))}
          </div>
        </Card>

      </div>
    );
  }
  