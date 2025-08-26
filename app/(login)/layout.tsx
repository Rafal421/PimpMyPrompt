import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PimpMyPrompt - Authentication",
  description: "Sign in or create an account to access PimpMyPrompt",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
