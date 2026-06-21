import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Next Boilerplate!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome{name ? `, ${name}` : ""}!</Heading>
          <Text style={paragraph}>
            Thanks for signing up for Next Boilerplate. We&apos;re excited to
            have you on board!
          </Text>
          <Section style={cta}>
            <Button style={button} href={`${process.env.AUTH_URL ?? "http://localhost:3000"}/dashboard`}>
              Go to Dashboard
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Next Boilerplate — If you didn&apos;t create an account, you can
            safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function PasswordResetEmail({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset your password</Heading>
          <Text style={paragraph}>
            Hi{name ? ` ${name}` : ""}, we received a request to reset your
            password. Click the button below to choose a new one.
          </Text>
          <Section style={cta}>
            <Button style={button} href={resetUrl}>
              Reset password
            </Button>
          </Section>
          <Text style={paragraph}>
            This link expires in 1 hour. If you didn&apos;t request a reset,
            ignore this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Next Boilerplate</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  fontFamily: "'Helvetica Neue',sans-serif",
  backgroundColor: "#f6f9fc",
  padding: "20px",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "8px",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "560px",
};

const heading = { fontSize: "24px", fontWeight: 600, color: "#1a1a1a" };
const paragraph = { fontSize: "16px", lineHeight: "26px", color: "#4a4a4a" };
const cta = { textAlign: "center" as const, margin: "32px 0" };
const button = {
  backgroundColor: "#000000",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
  display: "inline-block",
};
const hr = { borderColor: "#f0f0f0", margin: "24px 0" };
const footer = { fontSize: "14px", color: "#999999" };
