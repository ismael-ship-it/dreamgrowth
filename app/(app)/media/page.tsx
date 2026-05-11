import { MediaUploader } from "@/components/media-uploader";
import { getCompanyProfile } from "@/lib/company/profile";

export default function MediaPage() {
  const profile = getCompanyProfile();

  return (
    <MediaUploader
      defaults={{
        primaryCity: profile.primaryCity,
        primaryState: profile.primaryState,
        serviceOptions: profile.services
      }}
    />
  );
}
