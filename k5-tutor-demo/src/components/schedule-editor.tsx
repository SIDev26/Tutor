import { Button } from "@/components/ui/button";
import { dailyMinuteOptions, timeWindows, toggleSlot, weekDays, type ScheduleSettings } from "@/lib/schedule";

export function ScheduleEditor({ value, onChange }: { value: ScheduleSettings; onChange: (value: ScheduleSettings) => void }) {
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="text-sm font-semibold mb-3">1. Time per day</legend>
        <div className="flex flex-wrap gap-2">
          {dailyMinuteOptions.map((m) => (
            <Button key={m} type="button" variant={value.minutes === m ? "default" : "outline"} aria-pressed={value.minutes === m} onClick={() => onChange({ ...value, minutes: m })}>
              {m} minutes
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Less time means fewer or shorter lessons that week. Teaching is never skipped.</p>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-semibold mb-3">2. When they may use it</legend>
        <div className="slot-grid" role="grid" aria-label="Weekly time slots">
          <span />
          {weekDays.map((d) => <span key={d} className="slot-day">{d}</span>)}
          {timeWindows.map((w) => (
            <div className="contents" role="row" key={w.id}>
              <span className="slot-label">{w.label}<small>{w.start}:00–{w.end}:00</small></span>
              {weekDays.map((d) => {
                const on = value.slots[d].includes(w.id);
                return (
                  <button
                    key={d}
                    type="button"
                    role="gridcell"
                    className={`slot-cell ${on ? "on" : ""}`}
                    aria-pressed={on}
                    aria-label={`${d} ${w.label.toLowerCase()} ${on ? "allowed" : "not allowed"}`}
                    onClick={() => onChange({ ...value, slots: toggleSlot(value.slots, d, w.id) })}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Tap a square to allow or block that time. Outside these times your child sees a friendly “come back” screen.</p>
      </fieldset>
    </div>
  );
}


