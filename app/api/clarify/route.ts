import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { provider, ...body } = await req.json();

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }
    const cookieHeader = req.headers.get("cookie");

    const response = await fetch(
      new URL(`/api/providers/${provider}`, req.url),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({
          action: "clarify",
          ...body,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Provider error (${response.status}):`,
        errorText.substring(0, 200)
      );
      return NextResponse.json(
        {
          error: `Provider returned ${response.status}: ${response.statusText}`,
          debug: errorText.substring(0, 500),
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Error in /api/clarify:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to get response from AI.", details: errorMessage },
      { status: 500 }
    );
  }
}
