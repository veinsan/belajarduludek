import { getSession } from "@/lib/auth";
import { GeminiCopilot } from "@/components/gemini-copilot";

export default async function GeminiPage() {
  const session = await getSession();
  if (!session) return null;

  return <GeminiCopilot />;
}
