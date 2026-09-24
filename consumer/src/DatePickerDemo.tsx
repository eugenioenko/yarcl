import { format, isWeekend } from 'date-fns';
import { de } from 'date-fns/locale/de';
import { useState } from 'react';
import { DatePicker, Field, Inline, type DateRange } from 'yarcl';

const day = (d: Date | null | undefined) => (d ? format(d, 'yyyy-MM-dd') : 'none');

export function DatePickerDemo() {
  const [appointment, setAppointment] = useState<Date | null>(new Date(2026, 8, 15));
  const [stay, setStay] = useState<DateRange | null>({ from: new Date(2026, 8, 3), to: new Date(2026, 8, 7) });

  return (
    <Inline align="start" className="fields">
      <Field label="Appointment" description={`Value: ${day(appointment)}`}>
        <DatePicker value={appointment} onValueChange={setAppointment} placeholder="Pick a date" />
      </Field>
      <Field label="Stay" description={`From ${day(stay?.from)} to ${day(stay?.to)}`}>
        <DatePicker mode="range" value={stay} onValueChange={setStay} placeholder="Pick check-in and check-out" />
      </Field>
      <Field label="Delivery day" description="Weekdays from September 10 to 20">
        <DatePicker
          defaultValue={new Date(2026, 8, 14)}
          min={new Date(2026, 8, 10)}
          max={new Date(2026, 8, 20)}
          isDateDisabled={isWeekend}
          name="delivery"
        />
      </Field>
      <Field label="Termin (German)">
        <DatePicker
          locale={de}
          displayFormat="P"
          placeholder="Datum wählen"
          labels={{ dialog: 'Datum wählen', previousMonth: 'Vorheriger Monat', nextMonth: 'Nächster Monat' }}
          size="sm"
          color="success"
        />
      </Field>
    </Inline>
  );
}
