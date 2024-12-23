"use client"; // ensure it's a client-side component

import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const CustomAlert = ({ title, description }) => {
    return (
      <div
        className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 p-4 pt-10"
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <Alert className="transition-opacity duration-1000 opacity-100 border-black/40">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </div>
    );
  };
  
