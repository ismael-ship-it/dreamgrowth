import { MediaUploader } from "@/components/media-uploader";
import { getCompanyProfile } from "@/lib/company/profile";

export default function MobileUploadPage() {
  const profile = getCompanyProfile();

  return (
    <MediaUploader
      mobile
      defaults={{
        primaryCity: profile.primaryCity,
        primaryState: profile.primaryState,
        serviceOptions: profile.services
      }}
    />
  );
}
