"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchContacts();
    }
  }, [status, router]);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      setContacts(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">SMS Messaging Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded bg-gray-200 py-2 px-4 hover:bg-gray-300"
        >
          Sign Out
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Contact Management</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/contacts/add")}
              className="rounded-lg bg-green-600 py-2 px-4 text-white hover:bg-green-700"
            >
              Add New Contact
            </button>
            <button
              onClick={() => router.push("/contacts/import")}
              className="rounded-lg bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
            >
              Import Contacts (CSV)
            </button>
            <button
              onClick={() => router.push("/contacts")}
              className="rounded-lg bg-gray-600 py-2 px-4 text-white hover:bg-gray-700"
            >
              View All Contacts ({contacts.length})
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-4 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Send Messages</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push("/messages/send")}
              className="rounded-lg bg-purple-600 py-2 px-4 text-white hover:bg-purple-700"
            >
              Compose New Message
            </button>
            <button
              onClick={() => router.push("/messages/history")}
              className="rounded-lg bg-gray-600 py-2 px-4 text-white hover:bg-gray-700"
            >
              Message History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}