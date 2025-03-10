"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ImportContacts() {
  const router = useRouter();
  const { status } = useSession();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // More robust CSV validation
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      const fileType = selectedFile.type;
      
      // Check if file has .csv extension or a valid CSV MIME type
      const isCSV = 
        fileName.endsWith('.csv') || 
        fileType === 'text/csv' || 
        fileType === 'application/csv' ||
        fileType === 'application/vnd.ms-excel' ||
        fileType === 'application/octet-stream';
      
      if (!isCSV) {
        setMessage({ 
          type: "error", 
          text: "Please select a valid CSV file" 
        });
        setFile(null);
        
        // Log details for debugging
        console.log("File rejected:", {
          name: selectedFile.name,
          type: selectedFile.type
        });
      } else {
        setFile(selectedFile);
        setMessage({ type: "", text: "" });
        
        // Log successful file selection
        console.log("File accepted:", {
          name: selectedFile.name,
          type: selectedFile.type
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage({ type: "error", text: "Please select a CSV file" });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Debug: log file details before upload
      console.log("Uploading file:", {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      const response = await fetch("/api/contacts/import", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to import contacts");
      }
      
      setMessage({ 
        type: "success", 
        text: `Successfully imported ${data.count} contacts` 
      });
      
      // Clear file input
      setFile(null);
      
      // Redirect back to contacts after 2 seconds
      setTimeout(() => {
        router.push("/contacts");
      }, 2000);
      
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Import Contacts</h1>
        <button
          onClick={() => router.push("/contacts")}
          className="rounded bg-gray-200 py-2 px-4 hover:bg-gray-300"
        >
          Back to Contacts
        </button>
      </header>

      {message.text && (
        <div className={`mb-4 rounded-lg p-4 ${
          message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {message.text}
        </div>
      )}

      <div className="rounded-lg border p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your CSV should include columns for name, email, phone number, and optionally a group.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isUploading || !file}
              className={`rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white ${
                isUploading || !file ? "opacity-50" : "hover:bg-blue-700"
              }`}
            >
              {isUploading ? "Importing..." : "Import Contacts"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/contacts")}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}