"use client";

import React, { useState } from "react";
import { Camera, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form local state placeholders
  const [fullName, setFullName] = useState("John Doe");
  const [phone, setPhone] = useState("+91 98765 43210");
  const email = "user@example.com"; // Read-only session data

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    // TODO: Connect to Supabase Auth Update User Profile
    // Example:
    // const { error } = await supabase.auth.updateUser({
    //   data: { full_name: fullName, phone_number: phone }
    // });
    
    // Simulate short network delay for UI feel
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setIsSubmitting(false);
    setSuccess(true);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Avatar Selection Section */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground block">
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative group size-20 rounded-full border border-border bg-muted flex items-center justify-center overflow-hidden">
            <span className="text-2xl font-bold text-muted-foreground select-none">
              {fullName ? fullName.charAt(0).toUpperCase() : "U"}
            </span>
            
            {/* Camera Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="size-5 text-white" />
            </div>
            
            {/* Input file for avatar upload */}
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Upload profile picture"
              title="Upload profile picture"
              onChange={() => {
                // TODO: Upload image file to Supabase Storage bucket and update user metadata
              }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Allowed formats: JPG, PNG or WebP. Max size: 2MB.
            </p>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline text-left block"
              onClick={() => {
                // TODO: Trigger file selector or remove avatar
              }}
            >
              Remove photo
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Full Name */}
        <div className="space-y-2">
          <label 
            htmlFor="full-name" 
            className="text-sm font-semibold text-foreground block"
          >
            Full Name
          </label>
          <input
            id="full-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Email - Read-only */}
        <div className="space-y-2">
          <label 
            htmlFor="email" 
            className="text-sm font-semibold text-foreground block"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            readOnly
            value={email}
            disabled
            className="w-full px-3 py-2 rounded-lg border border-input bg-muted/50 text-muted-foreground text-sm cursor-not-allowed focus-visible:outline-none"
          />
          <p className="text-[11px] text-muted-foreground">
            Contact support to change your registered email address.
          </p>
        </div>

        {/* Phone Number */}
        <div className="space-y-2 sm:col-span-2">
          <label 
            htmlFor="phone" 
            className="text-sm font-semibold text-foreground block"
          >
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving changes...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        
        {success && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 animate-in fade-in duration-200">
            <UserCheck className="size-4" />
            Profile updated successfully
          </span>
        )}
      </div>
    </form>
  );
}
