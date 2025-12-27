import { Page } from '@playwright/test';

/**
 * Mailpit API helper for E2E tests.
 * Interacts with mailpit to retrieve and process confirmation emails.
 */

const MAILPIT_URL = process.env.MAILPIT_URL || 'http://localhost:8025';

interface MailpitMessage {
  ID: string;
  From: { Address: string; Name: string };
  To: Array<{ Address: string; Name: string }>;
  Subject: string;
  Snippet: string;
  Created: string;
}

interface MailpitMessagesResponse {
  messages: MailpitMessage[];
  total: number;
}

interface MailpitMessageDetail {
  ID: string;
  From: { Address: string; Name: string };
  To: Array<{ Address: string; Name: string }>;
  Subject: string;
  HTML: string;
  Text: string;
}

/**
 * Get all messages from mailpit.
 */
export async function getMessages(): Promise<MailpitMessage[]> {
  const response = await fetch(`${MAILPIT_URL}/api/v1/messages`);
  const data: MailpitMessagesResponse = await response.json();
  return data.messages || [];
}

/**
 * Get a specific message by ID.
 */
export async function getMessage(id: string): Promise<MailpitMessageDetail> {
  const response = await fetch(`${MAILPIT_URL}/api/v1/message/${id}`);
  return await response.json();
}

/**
 * Find confirmation email for a specific email address.
 */
export async function findConfirmationEmail(email: string): Promise<MailpitMessage | null> {
  const messages = await getMessages();

  return messages.find(msg =>
    msg.To.some(to => to.Address === email) &&
    msg.Subject.includes('Confirmation')
  ) || null;
}

/**
 * Extract confirmation link from email HTML content.
 */
export function extractConfirmationLink(html: string): string | null {
  // Look for the confirmation link pattern
  const match = html.match(/href="(http[^"]*\/users\/confirmation\?confirmation_token=[^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Get the confirmation link for a specific email address.
 * Waits for the email to arrive if not immediately available.
 */
export async function getConfirmationLink(email: string, maxAttempts = 10): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const confirmationEmail = await findConfirmationEmail(email);

    if (confirmationEmail) {
      const messageDetail = await getMessage(confirmationEmail.ID);
      const link = extractConfirmationLink(messageDetail.HTML);
      if (link) {
        return link;
      }
    }

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return null;
}

/**
 * Delete all messages in mailpit (cleanup).
 */
export async function deleteAllMessages(): Promise<void> {
  await fetch(`${MAILPIT_URL}/api/v1/messages`, {
    method: 'DELETE',
  });
}

/**
 * Delete a specific message by ID.
 */
export async function deleteMessage(id: string): Promise<void> {
  await fetch(`${MAILPIT_URL}/api/v1/messages`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ IDs: [id] }),
  });
}

/**
 * Confirm email for a user by navigating to the confirmation link.
 */
export async function confirmEmail(page: Page, email: string): Promise<boolean> {
  const confirmationLink = await getConfirmationLink(email);

  if (!confirmationLink) {
    console.error(`No confirmation email found for ${email}`);
    return false;
  }

  await page.goto(confirmationLink);

  // Check if confirmation was successful
  const successMessage = page.locator('text=/email.*confirmed|confirmed.*email/i');
  return await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
}
