import React from 'react';
import { format, addDays } from 'date-fns';
import {Button} from '@/components/ui/button'
import { CalendarIcon } from "@radix-ui/react-icons"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'; // Adjust the import path as needed
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'; // Adjust the import path as needed
import { Calendar } from '@/components/ui/calendar'; // Adjust the import path as needed

interface DatePickerWithPresetsProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const DatePickerWithPresets: React.FC<DatePickerWithPresetsProps> = ({ selectedDate, setSelectedDate }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={`
            w-[240px] justify-start text-left font-normal
            ${!selectedDate && "text-muted-foreground"}
          `}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-auto flex-col space-y-2 p-2"
      >
        <Select
          onValueChange={(value) =>
            setSelectedDate(addDays(new Date(), parseInt(value)))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="-1">Yesterday</SelectItem>
            <SelectItem value="0">Today</SelectItem>
            <SelectItem value="1">Tomorrow</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar mode="single" selected={selectedDate || undefined} onSelect={(date) => setSelectedDate(date || null)} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerWithPresets;