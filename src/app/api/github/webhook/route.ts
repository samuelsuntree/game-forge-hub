import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/webhook/verify";
import { routeWebhookEvent } from "@/lib/webhook/router";

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");

  if (!verifyWebhookSignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!event) {
    return NextResponse.json({ error: "Missing event header" }, { status: 400 });
  }

  const payload = JSON.parse(body);

  // Process asynchronously so we respond to GitHub within 10s
  routeWebhookEvent({ event, action: payload.action, payload }).catch((err) => {
    console.error(`Webhook handler error for ${event}/${payload.action}:`, err);
  });

  return NextResponse.json({ received: true });
}
