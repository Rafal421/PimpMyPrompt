import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Background } from "@/components/ui/background";

interface ErrorPageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const errorMessage =
    params.message || "There was a problem with your login attempt";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Animated background */}
      <Background />

      <Card className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-md border border-gray-800/50 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-900/20 backdrop-blur-sm border border-red-800/50 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-gray-400">
            There was a problem during login attempt
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
