import { EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } from "./constants";

const isConfigured =
  EMAILJS_SERVICE_ID !== "YOUR_SERVICE_ID" &&
  EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID" &&
  EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY";

interface AlertEmailParams {
  toEmail: string;
  currency: string;
  direction: "above" | "below";
  targetRate: number;
  currentRate: number;
}

// Sends the "환율 알림" trigger email via EmailJS — a service built
// specifically for calling straight from browser JS with no backend, which
// fits this static-export app (there's no server to own an SMTP
// connection). The @emailjs/browser SDK is imported dynamically so the
// static build doesn't pull it into the main bundle for people who never
// configure email alerts at all.
export async function sendAlertEmail(params: AlertEmailParams): Promise<boolean> {
  if (!isConfigured) {
    // Not a hard error — email is an optional add-on to the existing
    // browser Notification, so a person who hasn't set up EmailJS yet
    // should just silently keep getting the notification-only behavior.
    console.warn("[다환] EmailJS가 설정되지 않아 이메일 알림을 건너뛰었어요. lib/constants.ts를 확인하세요.");
    return false;
  }
  try {
    const emailjs = (await import("@emailjs/browser")).default;
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: params.toEmail,
        currency: params.currency,
        direction: params.direction === "above" ? "이상" : "이하",
        target_rate: params.targetRate.toLocaleString("ko-KR"),
        current_rate: params.currentRate.toLocaleString("ko-KR"),
      },
      { publicKey: EMAILJS_PUBLIC_KEY }
    );
    return true;
  } catch (err) {
    console.error("[다환] 이메일 알림 전송 실패", err);
    return false;
  }
}

export const emailAlertsConfigured = isConfigured;
