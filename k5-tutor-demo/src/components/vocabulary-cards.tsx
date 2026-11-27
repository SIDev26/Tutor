import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const cards = [
  { term: "Numerator", definition: "The top number. It tells how many equal pieces we are talking about. In 1/4, the numerator is 1." },
  { term: "Denominator", definition: "The bottom number. It tells how many equal pieces make the whole. In 1/4, the denominator is 4." },
  { term: "Unit fraction", definition: "A fraction with 1 on top. It names one equal piece, such as 1/4 or 1/8." },
] as const;

export function VocabularyCards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Record<string, boolean>>({});
  const card = cards[index]!;

  function rate(knewIt: boolean) {
    setKnown((current) => ({ ...current, [card.term]: knewIt }));
    if (index < cards.length - 1) {
      setIndex((current) => current + 1);
      setFlipped(false);
    }
  }

  return (
    <section className="vocabulary-section" aria-label="Fraction vocabulary flash cards">
      <div className="flex justify-between gap-3 items-center mb-3">
        <div>
          <p className="eyebrow text-coral">Word cards</p>
          <h2 className="text-lg font-bold mt-2">Three useful fraction words</h2>
        </div>
        <span className="text-xs text-muted-foreground">{index + 1} of {cards.length}</span>
      </div>
      <button
        type="button"
        className={`vocabulary-card ${flipped ? "flipped" : ""}`}
        aria-label={flipped ? `${card.term}: ${card.definition}` : `Flip the ${card.term} card`}
        aria-pressed={flipped}
        onClick={() => setFlipped((value) => !value)}
      >
        {flipped ? (
          <><strong>{card.term}</strong><span>{card.definition}</span><small>Tap to see the word</small></>
        ) : (
          <><strong>{card.term}</strong><span><RotateCcw size={16} /> Tap to flip</span></>
        )}
      </button>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Button variant="outline" disabled={!flipped} onClick={() => rate(true)}>I knew it</Button>
        <Button variant="outline" disabled={!flipped} onClick={() => rate(false)}>Not yet</Button>
      </div>
      <div className="flex justify-between items-center mt-3 gap-3">
        <div className="flex gap-2" aria-label="Vocabulary self ratings">
          {cards.map((item) => (
            <span key={item.term} className={known[item.term] === undefined ? "rating-dot" : known[item.term] ? "rating-dot known" : "rating-dot review"} title={item.term} />
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setIndex((index + 1) % cards.length); setFlipped(false); }}>
          Next card
        </Button>
      </div>
    </section>
  );
}


