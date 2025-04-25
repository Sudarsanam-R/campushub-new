import { redirect } from "next/navigation";

export default function Page() {
  redirect("/student-profile/registered-events");
  return null;
}
