/**
 * A small text-only PDF so a portfolio export downloads without a browser.
 * The on-screen record also prints to PDF from the browser.
 */
export function textPdf(lines: string[]): Uint8Array {
  const wrapped = lines.flatMap((line) => wrap(line, 90));
  const source = wrapped.length > 0 ? wrapped : ["Beacon Math"];
  const pages: string[][] = [];
  for (let i = 0; i < source.length; i += 46) pages.push(source.slice(i, i + 46));

  const fontObjectId = 3 + pages.length * 2;
  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>`,
  ];

  pages.forEach((pageLines, index) => {
    const content = pageContent(pageLines);
    const contentId = 4 + index * 2;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> >>`,
    );
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

function pageContent(lines: string[]): string {
  const parts = ["BT", "/F1 11 Tf", "14 TL", "54 760 Td"];
  lines.forEach((line, index) => {
    const shown = index === 0 ? `${pdfString(line)} Tj` : `T* ${pdfString(line)} Tj`;
    parts.push(shown);
  });
  parts.push("ET");
  return parts.join("\n");
}

function wrap(line: string, width: number): string[] {
  if (line.length <= width) return [line];
  const words = line.split(/\s+/);
  const rows: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      rows.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) rows.push(current);
  return rows.length > 0 ? rows : [""];
}

function pdfString(value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  return `(${escaped.replace(/[^\x20-\x7e]/g, "?")})`;
}
