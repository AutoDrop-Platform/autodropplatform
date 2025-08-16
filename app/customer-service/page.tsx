"use client"

import { useState } from "react"
import { CustomerServiceAgent } from "@/components/customer-service-agent"

export default function CustomerServicePage() {
  const [language, setLanguage] = useState<"en" | "ar">("en")

  return (
    <div className="h-screen">
      <CustomerServiceAgent language={language} onLanguageChange={setLanguage} />
    </div>
  )
}
