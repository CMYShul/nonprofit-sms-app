"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-bold">Shul SMS Portal</h1>
        <h2 className="mb-6 text-center text-xl text-gray-600">
          One-Way Messaging Platform
        </h2>
        <p className="mb-8 text-center text-gray-600">
          Securely send SMS messages to the Shul List.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full rounded-lg bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}