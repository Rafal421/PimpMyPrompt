import { NextResponse } from "next/server";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function handleError(error: unknown, serviceName: string): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { error: `Failed to get response from ${serviceName}` },
    { status: 500 }
  );
}
