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

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-gray-400">
            There was a problem with your login attempt
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-300 text-sm mb-6">
            Please check your credentials and try again. If the problem
            persists, contact support.
          </p>
          <Button
            asChild
            className="w-full bg-white text-black hover:bg-gray-200 font-semibold"
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
