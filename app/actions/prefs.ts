"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/** Flip the signed-in user's festive-decoration preference. */
export async function toggleWhimsy() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { showWhimsy: true },
  });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { showWhimsy: !user.showWhimsy },
  });
  revalidatePath("/", "layout");
}
