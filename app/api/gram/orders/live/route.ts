import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LIVE_ORDERS_URL = "https://gramappapi.kalp.ltd/auth/v1/orders/live";

type LiveOrdersData = {
  totalOrders: number;
  received: number;
  rejected: number;
  pending: number;
  pickup: number;
  totalDelivered: number;
  today: {
    totalOrders: number;
    received: number;
    rejected: number;
    pending: number;
    pickup: number;
    totalDelivered: number;
  };
  month: {
    totalOrders: number;
    received: number;
    rejected: number;
    pending: number;
    pickup: number;
    totalDelivered: number;
  };
};

type LiveOrdersResponse = {
  success: boolean;
  message: string;
  data: LiveOrdersData;
};

export async function GET() {
  try {
    const response = await fetch(LIVE_ORDERS_URL, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch live order stats",
        },
        { status: response.status }
      );
    }

    const payload = (await response.json()) as LiveOrdersResponse;
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: `Unable to fetch live order stats: ${message}`,
      },
      { status: 500 }
    );
  }
}
