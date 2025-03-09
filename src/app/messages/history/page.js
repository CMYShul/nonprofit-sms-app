"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MessageHistory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchMessages();
    }
  }, [status, router]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Message History</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded bg-gray-200 py-2 px-4 hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </header>

      {messages.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-500">No messages have been sent yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200"></table>
          <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {messages.map((message) => (
                <tr key={message.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    {new Date(message.createdAt).toLocaleDateString()} 
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md overflow-hidden text-ellipsis">
                      {message.content}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {message.recipientCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={message.successCount === message.recipientCount ? 
                      "text-green-600" : "text-yellow-600"}>
                      {message.successCount} / {message.recipientCount}
                      ({Math.round((message.successCount / message.recipientCount) * 100)}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}