"use client";

import { useState } from "react";

import Section from "./components/section";
import { createUser } from "./actions";

export default function SetupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser(
      formData.firstName,
      formData.lastName,
      Number(formData.age),
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Financial Setup
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Personal Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-zinc-800"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-zinc-800"
                />
              </div>
            </div>
          </Section>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
