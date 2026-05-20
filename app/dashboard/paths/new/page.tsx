import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PathForm } from "@/components/path-form";

export default async function NewPathPage() {
  const session = await getSession();
  if (!session) return null;

  const decks = await prisma.deck.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PathForm decks={decks} />
    </div>
  );
}
