"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";

export default function Setup() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminExists, setAdminExists] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if any admin user exists
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/users/check");
        const data = await res.json();
        setAdminExists(data.userExists);
      } catch (err) {
        console.error("Error checking admin:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      const res = await fetch("/api/users/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create admin user");
      }

      router.push("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (adminExists) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border p-8 shadow-md">
          <h1 className="mb-4 text-center text-2xl font-bold">Admin Setup</h1>
          <p className="text-center mb-6">
            An admin user already exists. Please log in instead.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full rounded-lg bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-bold">Create Admin User</h1>
        <p className="text-center mb-6">
          Set up the first admin user for your SMS platform.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border p-2"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border p-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
          >
            Create Admin User
          </button>
        </form>
      </div>
    </div>
  );
              }
