import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-6xl mb-8">Hello World</h1>
        <div className="space-x-4">
          <Link href="/login" className="bg-white text-black px-6 py-3 rounded">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
