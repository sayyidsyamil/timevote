'use client';

import { useState, useMemo } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimeGridProps {
  selectedDate?: Date;
  selectedTimes: string[];
  onTimeSelect: (times: string[]) => void;
  unavailableTimes?: string[] | string | null;
  timeFrequency?: { [key: string]: number };
  color?: string;
}

export function TimeGrid({
  selectedDate,
  selectedTimes,
  onTimeSelect,
  unavailableTimes,
  timeFrequency = {},
  color = 'bg-yellow-300',
}: TimeGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ dayIndex: number; timeIndex: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ dayIndex: number; timeIndex: number } | null>(null);

  const startDate = selectedDate ? startOfWeek(selectedDate, { weekStartsOn: 1 }) : new Date();
  const timeSlots = generateTimeSlots();
  const weekDays = generateWeekDays(startDate);

  const normalizedUnavailableTimes = useMemo(() => {
    if (!unavailableTimes) return [];
    if (typeof unavailableTimes === 'string') return [unavailableTimes];
    return unavailableTimes;
  }, [unavailableTimes]);

  function getTimeKey(dayIndex: number, timeIndex: number) {
    return `${format(weekDays[dayIndex], 'yyyy-MM-dd')}-${timeSlots[timeIndex]}`;
  }

  function handleMouseDown(dayIndex: number, timeIndex: number, isUnavailable: boolean) {
    if (isUnavailable) return;
    setIsDragging(true);
    setDragStart({ dayIndex, timeIndex });
    setDragEnd({ dayIndex, timeIndex });
  }

  function handleMouseMove(dayIndex: number, timeIndex: number, isUnavailable: boolean) {
    if (!isDragging || isUnavailable) return;
    setDragEnd({ dayIndex, timeIndex });
  }

  function handleMouseUp() {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const selectedCells = getSelectedCells();
    const newSelection = new Set(selectedTimes);

    selectedCells.forEach(cell => {
      const timeKey = getTimeKey(cell.dayIndex, cell.timeIndex);
      if (newSelection.has(timeKey)) {
        newSelection.delete(timeKey);
      } else {
        newSelection.add(timeKey);
      }
    });

    onTimeSelect(Array.from(newSelection));
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }

  function getSelectedCells() {
    if (!dragStart || !dragEnd) return [];

    const minDay = Math.min(dragStart.dayIndex, dragEnd.dayIndex);
    const maxDay = Math.max(dragStart.dayIndex, dragEnd.dayIndex);
    const minTime = Math.min(dragStart.timeIndex, dragEnd.timeIndex);
    const maxTime = Math.max(dragStart.timeIndex, dragEnd.timeIndex);

    const cells = [];
    for (let day = minDay; day <= maxDay; day++) {
      for (let time = minTime; time <= maxTime; time++) {
        cells.push({ dayIndex: day, timeIndex: time });
      }
    }
    return cells;
  }

  function isTimeSlotUnavailable(day: Date, time: string): boolean {
    const timeKey = `${format(day, 'yyyy-MM-dd')}-${time}`;
    return normalizedUnavailableTimes.includes(timeKey);
  }

  function isSelected(dayIndex: number, timeIndex: number) {
    const timeKey = getTimeKey(dayIndex, timeIndex);
    if (selectedTimes.includes(timeKey)) return true;

    if (isDragging && dragStart && dragEnd) {
      const selectedCells = getSelectedCells();
      return selectedCells.some(
        cell => cell.dayIndex === dayIndex && cell.timeIndex === timeIndex
      );
    }
    return false;
  }

  function getShadeOfBlue(frequency: number) {
    if (frequency === 0) return '';

    const maxFrequency = Math.max(...Object.values(timeFrequency));
    const percentage = (frequency / maxFrequency) * 100;

    if (percentage <= 10) return 'bg-blue-400/10';
    if (percentage <= 20) return 'bg-blue-400/20';
    if (percentage <= 30) return 'bg-blue-400/30';
    if (percentage <= 40) return 'bg-blue-400/40';
    if (percentage <= 50) return 'bg-blue-400/50';
    if (percentage <= 60) return 'bg-blue-400/60';
    if (percentage <= 70) return 'bg-blue-400/70';
    if (percentage <= 80) return 'bg-blue-400/80';
    return 'bg-blue-500';
  }

  // Added a common class for non-selectable text
  const nonSelectableClass = "select-none";

  return (
    <div className={`overflow-x-auto ${nonSelectableClass}`}>
      <div className="min-w-[600px]">
        <div
          className="grid grid-cols-8 grid-rows-[auto, repeat(48, minmax(0, 1fr))] gap-1"
          onMouseLeave={() => {
            setIsDragging(false);
            setDragStart(null);
            setDragEnd(null);
          }}
          onMouseUp={handleMouseUp}
        >
          <div className="sticky top-0 left-0 bg-gray-100 z-10 grid grid-rows-[auto, repeat(48, minmax(0, 1fr))]">
            <div className={`h-10 flex items-center justify-center text-sm font-medium text-gray-500 ${nonSelectableClass}`}>
              Time
            </div>
            {timeSlots.map((time) => (
              <div
                key={time}
                className={`h-5 flex items-center justify-center text-xs font-medium text-gray-400 ${nonSelectableClass}`}
              >
                {time}
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIndex) => {
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div key={dayIndex} className="space-y-1">
                <div
                  className={`h-10 flex flex-col items-center justify-center font-medium text-center text-sm 
                    ${isToday ? 'bg-blue-100 text-blue-700 rounded-md' : 'text-gray-800'} ${nonSelectableClass}`}
                >
                  <div>{format(day, 'EEE')}</div>
                  <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                    {format(day, 'd MMM')}
                  </div>
                </div>

                {timeSlots.map((time, timeIndex) => {
                  const timeKey = `${format(day, 'yyyy-MM-dd')}-${time}`;
                  const isUnavailable = isTimeSlotUnavailable(day, time);
                  const frequency = timeFrequency[timeKey] || 0;

                  return (
                    <TooltipProvider key={`${dayIndex}-${time}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-full h-5 rounded-md border transition-all 
                              ${isUnavailable ? 'bg-black/80 text-gray-400 cursor-not-allowed' : 'cursor-pointer'} 
                              ${isSelected(dayIndex, timeIndex) ? `${color} text-white` : getShadeOfBlue(frequency)} 
                              ${nonSelectableClass}`}
                            onMouseDown={() => handleMouseDown(dayIndex, timeIndex, isUnavailable)}
                            onMouseMove={() => handleMouseMove(dayIndex, timeIndex, isUnavailable)}
                            onMouseEnter={() => handleMouseMove(dayIndex, timeIndex, isUnavailable)}
                          >
                            {frequency > 0 && (
                              <p className={`absolute text-xs text-gray-700 text-center flex items-center justify-center font-semibold ${nonSelectableClass}`}>
                                {/* {frequency} */}
                              </p>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className={nonSelectableClass}>Frequency: {frequency}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

function generateWeekDays(startDate: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

export default TimeGrid;