import { isAdminAuthed } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import AdminLogin from "../AdminLogin";
import ShowcaseClient from "./ShowcaseClient";

export const dynamic = "force-dynamic";

export default async function AdminShowcasePage() {
  if (!isAdminAuthed()) return <AdminLogin />;

  const images = await prisma.showcaseImage.findMany({ orderBy: { sortOrder: "asc" } });

  return <ShowcaseClient initialImages={images} />;
}
