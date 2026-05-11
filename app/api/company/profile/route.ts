import { NextResponse } from "next/server";
import {
  getCompanyProfile,
  saveCompanyProfile,
  type CompanyProfileInput
} from "@/lib/company/profile";

export async function GET() {
  return NextResponse.json({ profile: getCompanyProfile() });
}

export async function POST(request: Request) {
  const input = (await request.json()) as Partial<CompanyProfileInput>;

  return NextResponse.json({
    profile: saveCompanyProfile({
      companyName: input.companyName ?? "",
      website: input.website ?? "",
      phone: input.phone ?? "",
      email: input.email ?? "",
      primaryCity: input.primaryCity ?? "",
      primaryState: input.primaryState ?? "",
      showroom: input.showroom ?? "",
      fabricationShop: input.fabricationShop ?? "",
      industry: input.industry ?? "",
      tone: input.tone ?? "",
      services: input.services ?? [],
      serviceAreas: input.serviceAreas ?? [],
      callsToAction: input.callsToAction ?? [],
      rules: input.rules ?? []
    }),
    message: "Company profile saved locally for DreamGrowth."
  });
}
