import { redirect } from "next/navigation";
import { ROUTES } from "@/routes";

export default function AccountIndexPage() {
  redirect(ROUTES.ACCOUNT.PROFILE);
}
