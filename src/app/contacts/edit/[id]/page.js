// src/app/contacts/edit/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function EditContact() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contactId = params.id;
  
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    group: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && contactId) {
      fetchContact();
    }
  }, [status, router, contactId]);

  const fetchContact = async () => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch contact");
      }
      
      const contact = await res.json();
      setFormData({
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email || "",
        group: contact.group
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching contact:", error);
      setError("Failed to load contact information");
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update contact");
      }

      router.push("/contacts");
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Contact</h1>
        <button
          onClick={() => router.push("/contacts")}
          className="rounded bg-gray-200 py-2 px-4 hover:bg-gray-300"
        >
          Back to Contacts
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="mb-2 block font-medium" htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium" htmlFor="phoneNumber">
            Phone Number *
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            placeholder="+1234567890"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter in international format (e.g., +1234567890)
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-medium" htmlFor="group">
            Group
          </label>
          <input
            id="group"
            name="group"
            type="text"
            value={formData.group}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Contact"}
          </button>
        </div>
      </form>
    </div>
  );
}
