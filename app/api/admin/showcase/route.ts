import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const images = await prisma.showcaseImage.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await req.json();

  if (!body.imageUrl) {
    return NextResponse.json({ error: "Thiếu link ảnh" }, { status: 400 });
  }

  const maxOrder = await prisma.showcaseImage.aggregate({ _max: { sortOrder: true } });

  const image = await prisma.showcaseImage.create({
    data: {
      imageUrl: body.imageUrl,
      caption: body.caption || null,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json({ image });
}
