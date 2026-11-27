import { Avatar } from "@/components/avatar";
import { avatarPresets, type AvatarConfig } from "@/lib/lesson-data";

export function AvatarPicker({ value, onChange }: { value: AvatarConfig; onChange: (value: AvatarConfig) => void }) {
  const same = (a: AvatarConfig) => JSON.stringify(a) === JSON.stringify(value);
  return (
    <div className="avatar-preset-grid" role="radiogroup" aria-label="Choose an avatar">
      {avatarPresets.map((preset, i) => (
        <button key={i} type="button" role="radio" aria-checked={same(preset)} aria-label={`Avatar ${i + 1}`} className={`avatar-preset ${same(preset) ? "selected" : ""}`} onClick={() => onChange({ ...preset })}>
          <Avatar config={preset} size={64} />
        </button>
      ))}
    </div>
  );
}


