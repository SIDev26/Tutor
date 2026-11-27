import { useState } from "react";
import { Check, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InterestId } from "@/lib/lesson-data";
import { LineUp } from "@/components/teach-scene";

export function FractionStripManipulative({ interest }: { interest: InterestId }) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const whole = interest === "soccer" ? "match orange" : "crew snack bar";

  function place(parts: number) {
    if (selected !== parts) return;
    setPlaced((current) => (current.includes(parts) ? current : [...current, parts]));
    setSelected(null);
  }

  return (
    <section className="fraction-manipulative" aria-label="Drag-and-drop fraction strips">
      <div className="flex items-start gap-3">
        <Hand className="text-coral shrink-0 mt-1" size={20} />
        <div>
          <h3>Build it with fraction strips</h3>
          <p>Drag each shaded piece to its matching strip. On a touchscreen, tap a piece, then tap a strip.</p>
        </div>
      </div>
      <div className="fraction-piece-tray" aria-label="Pieces to move">
        {[4, 8].map((parts) => (
          <button
            type="button"
            key={parts}
            draggable={!placed.includes(parts)}
            className={`draggable-fraction-piece ${selected === parts ? "selected" : ""}`}
            disabled={placed.includes(parts)}
            aria-pressed={selected === parts}
            aria-label={`One ${parts === 4 ? "fourth" : "eighth"} of a ${whole}`}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", String(parts));
              setSelected(parts);
            }}
            onClick={() => setSelected(selected === parts ? null : parts)}
          >
            {placed.includes(parts) ? <Check size={16} /> : null}
            1/{parts} piece
          </button>
        ))}
      </div>
      <div className="fraction-drop-strips">
        {[4, 8].map((parts) => (
          <div className="fraction-drop-row" key={parts}>
            <span>{parts} equal pieces</span>
            <button
              type="button"
              className={`fraction-drop-strip ${placed.includes(parts) ? "filled" : ""}`}
              aria-label={`Drop the 1/${parts} piece on the strip with ${parts} equal pieces`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setSelected(Number(event.dataTransfer.getData("text/plain")));
                const dragged = Number(event.dataTransfer.getData("text/plain"));
                if (dragged === parts) {
                  setPlaced((current) => (current.includes(parts) ? current : [...current, parts]));
                  setSelected(null);
                }
              }}
              onClick={() => place(parts)}
            >
              {Array.from({ length: parts }, (_, index) => (
                <span key={index} className={index === 0 && placed.includes(parts) ? "placed" : ""} />
              ))}
            </button>
          </div>
        ))}
      </div>
      {placed.length === 2 ? (
        <p className="manipulative-discovery" role="status">
          <Check size={17} /> The wholes are the same length. One fourth takes more room than one eighth.
        </p>
      ) : null}
      {placed.length === 2 ? (
        <LineUp a={4} b={8} theme={interest === "soccer" ? "soccer" : "space"} showSign />
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)} disabled={selected === null}>
          Clear selected piece
        </Button>
      )}
    </section>
  );
}


