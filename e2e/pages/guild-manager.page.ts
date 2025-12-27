import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for the guild manager page.
 */
export class GuildManagerPage extends BasePage {
  /** Members list */
  readonly membersList: Locator;

  /** Pending invites list */
  readonly invitesList: Locator;

  /** Invite user input */
  readonly inviteInput: Locator;

  /** Send invite button */
  readonly sendInviteButton: Locator;

  constructor(page: Page) {
    super(page);

    this.membersList = page.locator('[data-members-list], .members-list');
    this.invitesList = page.locator('[data-invites-list], .invites-list');
    this.inviteInput = page.locator('input[name="invite[name]"]');
    this.sendInviteButton = page.locator('input[type="submit"][value*="Send"], button:has-text("Send")');
  }

  /**
   * Navigate to the guild manager page.
   */
  async goto(slug: string): Promise<void> {
    await this.navigateTo(`/guilds/${slug}/manager`);
  }

  /**
   * Send an invite to a user.
   */
  async sendInvite(username: string): Promise<void> {
    await this.inviteInput.fill(username);
    await this.sendInviteButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Cancel a pending invite via reflex.
   */
  async cancelInvite(inviteId: string): Promise<void> {
    const cancelButton = this.page.locator(
      `button[data-reflex*="cancel_invite"][data-invite-id="${inviteId}"]`
    );
    await cancelButton.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Kick a member via reflex.
   */
  async kickMember(userId: string): Promise<void> {
    const kickButton = this.page.locator(
      `button[data-reflex*="kick_player"][data-user-id="${userId}"]`
    );
    await kickButton.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Get member count.
   */
  async getMemberCount(): Promise<number> {
    const members = this.membersList.locator('[data-member-id]');
    return await members.count();
  }

  /**
   * Get pending invite count.
   */
  async getPendingInviteCount(): Promise<number> {
    const invites = this.invitesList.locator('[data-invite-id]');
    return await invites.count();
  }

  /**
   * Check if a user is in the members list.
   */
  async hasMember(username: string): Promise<boolean> {
    const member = this.membersList.locator(`text="${username}"`);
    return await member.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if there is a pending invite for a user.
   */
  async hasPendingInvite(username: string): Promise<boolean> {
    const invite = this.invitesList.locator(`text="${username}"`);
    return await invite.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get all member names.
   */
  async getMemberNames(): Promise<string[]> {
    const members = this.membersList.locator('[data-member-name]');
    return await members.allTextContents();
  }

  /**
   * Get all pending invite usernames.
   */
  async getPendingInviteNames(): Promise<string[]> {
    const invites = this.invitesList.locator('[data-invite-name]');
    return await invites.allTextContents();
  }

  /**
   * Check if invite input is visible (can send invites).
   */
  async canSendInvites(): Promise<boolean> {
    return await this.inviteInput.isVisible({ timeout: 1000 }).catch(() => false);
  }
}
