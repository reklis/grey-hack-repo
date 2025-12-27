import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { CommentsBoxComponent } from '../components/comments-box.component';

/**
 * Page object for guild pages (create, view, edit).
 */
export class GuildPage extends BasePage {
  /** Guild name input */
  readonly nameInput: Locator;

  /** Description textarea */
  readonly descriptionTextarea: Locator;

  /** Tag input */
  readonly tagInput: Locator;

  /** Alignment select */
  readonly alignmentSelect: Locator;

  /** Registration info input */
  readonly registrationInfoInput: Locator;

  /** Submit button */
  readonly submitButton: Locator;

  /** Guild name display (on view page) */
  readonly guildName: Locator;

  /** Guild tag display */
  readonly guildTag: Locator;

  /** Announcements section */
  readonly announcementsSection: Locator;

  /** Announcement message input */
  readonly announcementInput: Locator;

  /** Create announcement button */
  readonly createAnnouncementButton: Locator;

  /** Edit link */
  readonly editLink: Locator;

  /** Manager link */
  readonly managerLink: Locator;

  /** Comments component */
  readonly comments: CommentsBoxComponent;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.locator('input[name="guild[name]"]');
    this.descriptionTextarea = page.locator('textarea[name="guild[description]"]');
    this.tagInput = page.locator('input[name="guild[tag]"]');
    this.alignmentSelect = page.locator('select[name="guild[alignment]"]');
    this.registrationInfoInput = page.locator('input[name="guild[registration_info]"]');
    this.submitButton = page.locator('input[type="submit"]');
    this.guildName = page.locator('.font-semibold.text-lg');
    this.guildTag = page.locator('[data-guild-tag]');
    this.announcementsSection = page.locator('h1:has-text("Announcements")');
    this.announcementInput = page.locator('input[name="announcement[message]"], textbox[name="message"]');
    this.createAnnouncementButton = page.locator('button:has-text("Create Announcement")');
    this.editLink = page.locator('a[href$="/edit"]');
    this.managerLink = page.locator('a[href*="/manager"]');
    this.comments = new CommentsBoxComponent(page);
  }

  /**
   * Navigate to the new guild page.
   */
  async gotoNew(): Promise<void> {
    await this.navigateTo('/guilds/new');
  }

  /**
   * Navigate to view a guild by slug.
   */
  async gotoShow(slug: string): Promise<void> {
    await this.navigateTo(`/guilds/${slug}`);
  }

  /**
   * Navigate to edit a guild by slug.
   */
  async gotoEdit(slug: string): Promise<void> {
    await this.navigateTo(`/guilds/${slug}/edit`);
  }

  /**
   * Navigate to guilds list.
   */
  async gotoList(): Promise<void> {
    await this.navigateTo('/guilds');
  }

  /**
   * Navigate to guild manager.
   */
  async gotoManager(slug: string): Promise<void> {
    await this.navigateTo(`/guilds/${slug}/manager`);
  }

  /**
   * Fill the guild form.
   */
  async fillForm(data: {
    name: string;
    description: string;
    tag: string;
    alignment?: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.descriptionTextarea.fill(data.description);
    await this.tagInput.fill(data.tag);

    if (data.alignment) {
      await this.alignmentSelect.selectOption(data.alignment);
    }
  }

  /**
   * Submit the guild form.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Create a new guild.
   */
  async createGuild(name: string, description: string, tag: string, alignment = 'grey'): Promise<void> {
    await this.fillForm({ name, description, tag, alignment });
    await this.submit();
  }

  /**
   * Get the guild name.
   */
  async getName(): Promise<string> {
    const text = await this.guildName.textContent();
    return text?.trim() || '';
  }

  /**
   * Create an announcement.
   */
  async createAnnouncement(message: string): Promise<void> {
    await this.announcementInput.fill(message);
    await this.createAnnouncementButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Get announcement count.
   */
  async getAnnouncementCount(): Promise<number> {
    const announcements = this.page.locator('[id^="announcement_"]');
    return await announcements.count();
  }

  /**
   * Navigate to edit page.
   */
  async goToEdit(): Promise<void> {
    await this.editLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Navigate to manager page.
   */
  async goToManager(): Promise<void> {
    await this.managerLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if user can edit (is owner).
   */
  async canEdit(): Promise<boolean> {
    return await this.editLink.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if user can manage (is owner).
   */
  async canManage(): Promise<boolean> {
    return await this.managerLink.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get available alignment options.
   */
  async getAlignmentOptions(): Promise<string[]> {
    const options = this.alignmentSelect.locator('option');
    return await options.allTextContents();
  }
}
