import { render } from "@react-email/components";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { WelcomeEmail, PasswordResetEmail } from "@/components/emails";

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  if (!resend) {
    console.log(`[email] (dev) Welcome email to ${to}`);
    return;
  }

  const html = await render(<WelcomeEmail name={name} />);
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to Next Boilerplate!",
    html,
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  if (!resend) {
    console.log(`[email] (dev) Password reset email to ${to}: ${resetUrl}`);
    return;
  }

  const html = await render(<PasswordResetEmail name={name} resetUrl={resetUrl} />);
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your password",
    html,
  });
}
