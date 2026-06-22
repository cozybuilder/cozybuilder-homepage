import { redirect } from "next/navigation";

// /sns 는 /marketing 으로 통합됨.
export default function SnsRedirect() {
  redirect("/marketing");
}
