'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, DayPickerProps } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = DayPickerProps & {
  disabledDates?: Date[]; // Accept disabled dates as an array of Date objects
  onMondaySelect?: (date: Date) => void; // Callback when a Monday is selected
  selectedMonday?: Date; // Date that represents the selected Monday
};

function Calendar({
  className,
  classNames,
  disabledDates = [],
  onMondaySelect,
  selectedMonday,
  ...props
}: CalendarProps) {
  // Function to generate disabled dates (everything except Monday)
  const getDisabledDays = React.useMemo(() => {
    const disabled: Date[] = [];
    const currentMonth = new Date(selectedMonday || new Date());
    currentMonth.setDate(1); // Set to the 1st of the month to iterate over the month days

    while (currentMonth.getMonth() === (selectedMonday || new Date()).getMonth()) {
      if (currentMonth.getDay() !== 1) { // If not Monday, disable this day
        disabled.push(new Date(currentMonth));
      }
      currentMonth.setDate(currentMonth.getDate() + 1); // Move to the next day
    }
    return disabled;
  }, [selectedMonday]);

  // Function to handle selecting a Monday and updating the parent component
  const handleMondayClick = (date: Date) => {
    if (date.getDay() === 1 && onMondaySelect) {
      onMondaySelect(date);
    }
  };

  // Format the selected Monday week range
  const getWeekRange = (date: Date) => {
    const startOfWeekDate = new Date(date);
    startOfWeekDate.setDate(startOfWeekDate.getDate() - startOfWeekDate.getDay() + 1); // Set to Monday

    const endOfWeekDate = new Date(startOfWeekDate);
    endOfWeekDate.setDate(startOfWeekDate.getDate() + 6); // Add 6 days to get Sunday

    return `${startOfWeekDate.getDate()} ${startOfWeekDate.toLocaleString('default', { month: 'long' })} - ${endOfWeekDate.getDate()} ${endOfWeekDate.toLocaleString('default', { month: 'long' })}`;
  };

  return (
    <div>
      <DayPicker
        showOutsideDays={false} // Only show the days within the month
        className={cn('p-3', className)}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4',
          caption: 'flex justify-center pt-1 relative items-center',
          caption_label: 'text-sm font-medium',
          nav: 'space-x-1 flex items-center',
          nav_button: cn(
            buttonVariants({ variant: 'outline' }),
            'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
          ),
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse space-y-1',
          head_row: 'flex',
          head_cell:
            'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          row: 'flex w-full mt-2',
          cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
          day: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
          ),
          day_range_end: 'day-range-end',
          day_selected:
            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          day_today: 'bg-accent text-accent-foreground',
          day_outside:
            'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
          day_disabled: 'text-muted-foreground opacity-50', // Styling for disabled days
          day_range_middle:
            'aria-selected:bg-accent aria-selected:text-accent-foreground',
          day_hidden: 'invisible', // Hide non-Monday days
          ...classNames,
        }}
        disabled={getDisabledDays} // Use the calculated disabled days
        selected={selectedMonday}
        onDayClick={handleMondayClick}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
      {selectedMonday && (
        <div className="mt-2 text-sm text-muted-foreground">
          <span>{`Week Range: ${getWeekRange(selectedMonday)}`}</span>
        </div>
      )}
    </div>
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
