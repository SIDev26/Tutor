export function RichMath({ text }: { text: string }) {
  const parts = text.split(/(\d+\/\d+)/g);
  return (
    <>
      {parts.map((part, index) => {
        const fraction = part.match(/^(\d+)\/(\d+)$/);
        if (!fraction) return <span key={index}>{part}</span>;
        return (
          <span key={index} className="frac" aria-label={`${fraction[1]} over ${fraction[2]}`}>
            <sup>{fraction[1]}</sup>
            <span aria-hidden="true">/</span>
            <sub>{fraction[2]}</sub>
          </span>
        );
      })}
    </>
  );
}
