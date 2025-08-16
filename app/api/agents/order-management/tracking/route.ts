import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get("trackingNumber")

    if (!trackingNumber) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 })
    }

    // Mock tracking information
    const trackingInfo = {
      trackingNumber,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      currentLocation: "Distribution Center - Dubai",
      updates: [
        {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "shipped",
          location: "Origin Facility - China",
          description: "Package shipped from origin facility",
        },
        {
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: "in_transit",
          location: "International Hub - Hong Kong",
          description: "Package in transit to destination country",
        },
        {
          timestamp: new Date().toISOString(),
          status: "in_transit",
          location: "Distribution Center - Dubai",
          description: "Package arrived at local distribution center",
        },
      ],
    }

    return NextResponse.json(trackingInfo)
  } catch (error) {
    console.error("Tracking lookup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
