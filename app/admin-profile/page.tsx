import { redirect } from "next/navigation";

export default function Page() {
  redirect("/admin-profile/organized-events");
  return null;
}
