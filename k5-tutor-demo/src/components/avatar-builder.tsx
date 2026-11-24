import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import {
  avatarAccessoryOptions,
  avatarColorOptions,
  avatarFaceOptions,
  avatarHairOptions,
  avatarSkinOptions,
  type AvatarConfig,
} from "@/lib/lesson-data";

export function AvatarBuilder({
  value,
  onChange,
  compact = false,
}: {
  value: AvatarConfig;
  onChange: (value: AvatarConfig) => void;
  compact?: boolean;
}) {
  const groups = [
    { key: "face" as const, label: "Face shape", options: avatarFaceOptions },
    { key: "skin" as const, label: "Skin tone", options: avatarSkinOptions },
    { key: "hair" as const, label: "Hair", options: avatarHairOptions },
    { key: "color" as const, label: "Favorite color", options: avatarColorOptions },
    { key: "accessory" as const, label: "One accessory", options: avatarAccessoryOptions },
  ];

  return (
    <div className={`avatar-builder ${compact ? "compact" : ""}`}>
      <div className="avatar-builder-preview">
        <Avatar config={value} size={compact ? 80 : 112} label="Your avatar preview" />
        <p className="text-xs text-muted-foreground">Made from original parts. No photo needed.</p>
      </div>
      <div className="avatar-builder-controls">
        {groups.map((group) => (
          <fieldset key={group.key}>
            <legend>{group.label}</legend>
            <div>
              {group.options.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  size="sm"
                  variant={value[group.key] === option.id ? "default" : "outline"}
                  aria-pressed={value[group.key] === option.id}
                  onClick={() => onChange({ ...value, [group.key]: option.id })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}


