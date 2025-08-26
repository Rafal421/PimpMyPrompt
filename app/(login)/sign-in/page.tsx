import { Suspense } from "react";
import OptimizedAuthPage from "../LoginPage";
import { Loader2 } from "lucide-react";
import { Background } from "@/components/ui/background";

function SignInLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <Background />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/40 backdrop-blur-md border border-gray-800/50 shadow-2xl rounded-2xl flex flex-col items-center justify-center h-[480px]">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <p className="text-gray-300 text-lg font-medium">
              Loading sign in...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <OptimizedAuthPage initialMode="login" />
    </Suspense>
  );
}
