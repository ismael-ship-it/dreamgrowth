import { GrowthChat } from "@/components/growth-chat";
import { getCompanyProfile } from "@/lib/company/profile";

export default function GrowthChatPage() {
  const profile = getCompanyProfile();

  return (
    <GrowthChat
      companyName={profile.companyName}
      primaryCity={profile.primaryCity}
      industry={profile.industry}
    />
  );
}
