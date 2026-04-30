import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { TeamMemberOnboardingLink } from "@/models/TeamMemberOnboardingLink";
import { TeamMemberOnboardingFormClient } from "@/components/team-member-onboarding-form-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ token: string }> };

export default async function TeamOnboardingPage({ params }: Props) {
  const { token } = await params;
  const trimmed = token?.trim();
  if (!trimmed) notFound();

  await connectDB();
  const link = await TeamMemberOnboardingLink.findOne({ token: trimmed }).lean();
  if (!link) notFound();

  if ((link as any).isActive === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/50 to-muted/30 py-12 px-4 sm:py-16 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-muted-foreground">Link expired or deactivated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This onboarding link is no longer active. If you need to submit your details, please request a new link.
              </p>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-8">
            Powered by <span className="font-semibold text-foreground">Kalp.ltd</span> — Innovation Studio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-muted/30 py-12 px-4 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <TeamMemberOnboardingFormClient token={trimmed} />
        <p className="text-center text-xs text-muted-foreground mt-8">
          Powered by <span className="font-semibold text-foreground">Kalp.ltd</span> — Innovation Studio
        </p>
      </div>
    </div>
  );
}
