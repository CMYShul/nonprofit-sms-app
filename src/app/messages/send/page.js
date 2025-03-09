"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SendMessage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    message: "",
    selectedGroup: "all"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [groups, setGroups] = useState(["Default"]);

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

      // Extract unique groups
      const uniqueGroups = [...new Set(data.map((contact) => contact.group))];
      setGroups(uniqueGroups);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError("");
    setSuccess("");

    // Filter contacts by group if needed
    const recipients = formData.selectedGroup === "all" 
      ? contacts 
      : contacts.filter(contact => contact.group === formData.selectedGroup);

    if (recipients.length === 0) {
      setError("No recipients found for the selected group");
      setIsSending(false);
      return;
    }

    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: formData.message,
          recipients: recipients
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send messages");
      }

      const data = await res.json();
      setSuccess(`Successfully sent ${data.results.filter(r => r.success).length} messages out of ${recipients.length} recipients.`);
      setFormData({ ...formData, message: "" });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Send SMS Message</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded bg-gray-200 py-2 px-4 hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">
          {success}
        </div>
      )}

      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-2 text-lg font-medium">Recipients</h2>
        <p className="mb-4">
          Total contacts available: <strong>{contacts.length}</strong>
        </p>
        <div className="mb-2">
          <label className="block font-medium" htmlFor="selectedGroup">
            Select Group
          </label>
          <select
            id="selectedGroup"
            name="selectedGroup"
            value={formData.selectedGroup}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border p-2"
          >
            <option value="all">All Contacts</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group} ({contacts.filter(c => c.group === group).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border p-4">
        <div className="mb-4">
          <label className="mb-2 block font-medium" htmlFor="message">
            Message Content
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            rows="6"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Characters: {formData.message.length}/160 
            {formData.message.length > 160 && " (will be sent as multiple messages)"}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Sending to: <strong>{formData.selectedGroup === "all" ? contacts.length : contacts.filter(c => c.group === formData.selectedGroup).length}</strong> recipients
            </p>
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="rounded-lg bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
}