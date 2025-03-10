// src/app/contacts/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Contacts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

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
      setMessage({ type: "error", text: "Failed to load contacts" });
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const res = await fetch(`/api/contacts/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete contact");
        }

        // Update the contacts list without reloading
        setContacts(contacts.filter(contact => contact.id !== id));
        setMessage({ type: "success", text: `${name} was deleted successfully` });
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } catch (error) {
        console.error("Error deleting contact:", error);
        setMessage({ type: "error", text: error.message });
      }
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded bg-gray-200 py-2 px-4 hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </header>

      {message.text && (
        <div className={`mb-4 rounded-lg p-4 ${
          message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {message.text}
        </div>
      )}

      <div className="mb-6 flex justify-between">
        <h2 className="text-xl">{contacts.length} Total Contacts</h2>
        <div className="space-x-2">
          <button
            onClick={() => router.push("/contacts/import")}
            className="rounded-lg bg-purple-600 py-2 px-4 text-white hover:bg-purple-700"
          >
            Import CSV
          </button>
          <button
            onClick={() => router.push("/contacts/add")}
            className="rounded-lg bg-green-600 py-2 px-4 text-white hover:bg-green-700"
          >
            Add New Contact
          </button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-500">No contacts found. Add your first contact to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Group
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    {contact.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {contact.phoneNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {contact.email || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {contact.group}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => router.push(`/contacts/edit/${contact.id}`)}
                      className="mr-2 text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id, contact.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
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
