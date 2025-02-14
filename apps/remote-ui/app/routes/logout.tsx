import { redirect } from "@remix-run/node";
import { logout } from "server/session.server";

export async function loader({ request }) {
  return logout(request);
}

export async function action({ request }) {
  return logout(request);
}