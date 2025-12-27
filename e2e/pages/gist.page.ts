import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for gist pages (create, view, edit).
 */
export class GistPage extends BasePage {
  /** Gist name input */
  readonly nameInput: Locator;

  /** Description textarea */
  readonly descriptionTextarea: Locator;

  /** Anonymous checkbox */
  readonly anonymousCheckbox: Locator;

  /** Add file button */
  readonly addFileButton: Locator;

  /** Submit button */
  readonly submitButton: Locator;

  /** Gist title (on view page) */
  readonly gistTitle: Locator;

  /** Gist description (on view page) */
  readonly gistDescription: Locator;

  /** Edit link */
  readonly editLink: Locator;

  /** Delete button */
  readonly deleteButton: Locator;

  /** Scripts list */
  readonly scriptsList: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.locator('input[name="gist[name]"]');
    this.descriptionTextarea = page.locator('textarea[name="gist[description]"]');
    this.anonymousCheckbox = page.getByRole('checkbox', { name: 'Anonymous?' });
    this.addFileButton = page.locator('button:has-text("Add file")');
    this.submitButton = page.locator('input[type="submit"]');
    this.gistTitle = page.locator('.text-3xl.font-semibold');
    this.gistDescription = page.locator('.text-beaver-300.text-center');
    this.editLink = page.locator('a[href$="/edit"]');
    this.deleteButton = page.locator('button:has-text("Delete"), a:has-text("Delete")');
    this.scriptsList = page.locator('[data-script-name]');
  }

  /**
   * Navigate to the new gist page.
   */
  async gotoNew(): Promise<void> {
    await this.navigateTo('/gists/new');
  }

  /**
   * Navigate to view a gist by slug.
   */
  async gotoShow(slug: string): Promise<void> {
    await this.navigateTo(`/gists/${slug}`);
  }

  /**
   * Navigate to edit a gist by slug.
   */
  async gotoEdit(slug: string): Promise<void> {
    await this.navigateTo(`/gists/${slug}/edit`);
  }

  /**
   * Navigate to gists list.
   */
  async gotoList(): Promise<void> {
    await this.navigateTo('/gists');
  }

  /**
   * Fill the gist form.
   */
  async fillForm(data: {
    name: string;
    description: string;
    anonymous?: boolean;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.descriptionTextarea.fill(data.description);

    if (data.anonymous !== undefined) {
      if (data.anonymous) {
        await this.anonymousCheckbox.check();
      } else {
        await this.anonymousCheckbox.uncheck();
      }
    }
  }

  /**
   * Add a script to the gist.
   * Note: The textarea is hidden by CodeJar which creates a contenteditable .code-editor div
   */
  async addScript(name: string, content: string, index = 0): Promise<void> {
    // Add more script fields if needed
    const currentCount = await this.page.locator('input[name*="[scripts_attributes]"][name*="[name]"]').count();
    for (let i = currentCount; i <= index; i++) {
      await this.addFileButton.click();
      await this.page.waitForTimeout(200);
    }

    const scriptNameInput = this.page.locator('input[name*="[scripts_attributes]"][name*="[name]"]').nth(index);
    // CodeJar replaces the textarea with a contenteditable div
    const codeEditor = this.page.locator('.code-editor').nth(index);

    await scriptNameInput.fill(name);

    // Type into the CodeJar contenteditable div
    await codeEditor.click();
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.type(content);
  }

  /**
   * Submit the gist form.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Create a gist with a single script.
   */
  async createGist(name: string, description: string, scriptName: string, scriptContent: string, anonymous = false): Promise<void> {
    await this.fillForm({ name, description, anonymous });
    await this.addScript(scriptName, scriptContent);
    await this.submit();
  }

  /**
   * Get the gist title.
   */
  async getTitle(): Promise<string> {
    const text = await this.gistTitle.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the gist description.
   */
  async getDescription(): Promise<string> {
    const text = await this.gistDescription.textContent();
    return text?.trim() || '';
  }

  /**
   * Get number of scripts in the gist.
   */
  async getScriptCount(): Promise<number> {
    return await this.scriptsList.count();
  }

  /**
   * Navigate to edit page.
   */
  async goToEdit(): Promise<void> {
    await this.editLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if user can edit (edit link visible).
   */
  async canEdit(): Promise<boolean> {
    return await this.editLink.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if anonymous warning is shown.
   */
  async hasAnonymousWarning(): Promise<boolean> {
    const warning = this.page.locator('text=/not logged|anonymous/i');
    return await warning.isVisible({ timeout: 1000 }).catch(() => false);
  }
}
