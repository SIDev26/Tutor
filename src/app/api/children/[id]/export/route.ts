import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { readParent } from "@/server/auth";
import { exportRows, weeklyReportFor } from "@/server/learning";
import { toCsv } from "@/lib/csv";
import { textPdf } from "@/lib/simplePdf";
import { statusLabel } from "@/lib/labels";
import { SKILLS } from "@/content/skills";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const parent = await readParent();
  const { id } = await context.params;
  if (!parent) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const child = await prisma.child.findFirst({
    where: { id, parentId: parent.sub },
    include: { states: true },
  });
  if (!child) return NextResponse.json({ error: "Child not found." }, { status: 404 });
  const format = new URL(request.url).searchParams.get("format");
  const exported = await exportRows(id);
  if (!exported) return NextResponse.json({ error: "Child not found." }, { status: 404 });
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "pdf") {
    const report = await weeklyReportFor(id);
    const stateBySkill = new Map(child.states.map((state) => [state.skillId, state]));
    const lines = [
      "Beacon Math record",
      `Child: ${child.nickname}`,
      `Grade: ${child.grade}`,
      `Exported: ${stamp}`,
      "",
      "This file is for a homeschool portfolio. It lists nickname and grade only.",
      "",
      report?.report.headline ?? "",
      ...(report?.report.paragraphs ?? []),
      "",
      "Skill map",
    ];
    for (const skill of SKILLS) {
      const state = stateBySkill.get(skill.id);
      const status = statusLabel(state?.status ?? "NOT_STARTED", state?.inferred ?? false);
      const confidence = Math.round((state?.pMastery ?? 0.15) * 100);
      lines.push(`${skill.id}  ${skill.title}  ${status}  ${confidence}% confidence`);
    }
    lines.push("", `Answered items in this export: ${exported.rows.length}`);
    const bytes = textPdf(lines);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="beacon-${child.nickname}-${stamp}.pdf"`,
      },
    });
  }

  const csv = toCsv([
    ["nickname", child.nickname],
    ["grade", String(child.grade)],
    [],
    exported.header,
    ...exported.rows,
  ]);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="beacon-${child.nickname}-${stamp}.csv"`,
    },
  });
}
