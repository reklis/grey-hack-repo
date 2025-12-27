import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for the post create/edit form.
 */
export class PostFormPage extends BasePage {
  /** Title input */
  readonly titleInput: Locator;

  /** Visibility select */
  readonly visibilitySelect: Locator;

  /** Category select */
  readonly categorySelect: Locator;

  /** Summary textarea */
  readonly summaryTextarea: Locator;

  /** Readme rich text editor */
  readonly readmeEditor: Locator;

  /** Submit button */
  readonly submitButton: Locator;

  /** Cancel link */
  readonly cancelLink: Locator;

  /** Error messages */
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);

    this.titleInput = page.locator('input[name="post[title]"]');
    this.visibilitySelect = page.locator('select[name="post[visibility]"]');
    this.categorySelect = page.locator('select[name="post[category_id]"]');
    this.summaryTextarea = page.locator('textarea[name="post[summary]"]');
    this.readmeEditor = page.locator('trix-editor, [data-attachments-target="editor"]');
    this.submitButton = page.locator('input[type="submit"]');
    this.cancelLink = page.locator('a:has-text("Cancel")');
    this.errorMessages = page.locator('.field-error, .text-red-400, #error_explanation');
  }

  /**
   * Navigate to the new post page.
   */
  async gotoNew(): Promise<void> {
    await this.navigateTo('/posts/new');
  }

  /**
   * Navigate to edit page for a post.
   */
  async gotoEdit(slug: string): Promise<void> {
    await this.navigateTo(`/posts/${slug}/edit`);
  }

  /**
   * Fill the post form with provided data.
   */
  async fillForm(data: {
    title?: string;
    visibility?: string;
    categoryId?: string;
    summary?: string;
    readme?: string;
  }): Promise<void> {
    if (data.title) {
      await this.titleInput.fill(data.title);
    }

    if (data.visibility) {
      await this.visibilitySelect.selectOption(data.visibility);
    }

    if (data.categoryId) {
      await this.categorySelect.selectOption(data.categoryId);
    }

    if (data.summary) {
      await this.summaryTextarea.fill(data.summary);
    }

    if (data.readme) {
      await this.readmeEditor.fill(data.readme);
    }
  }

  /**
   * Submit the form.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Create a new post with minimal required fields.
   */
  async createPost(title: string, summary: string): Promise<void> {
    await this.fillForm({ title, summary });
    await this.submit();
  }

  /**
   * Check if there are validation errors.
   */
  async hasErrors(): Promise<boolean> {
    return await this.errorMessages.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get error messages.
   */
  async getErrorMessages(): Promise<string[]> {
    if (await this.hasErrors()) {
      return await this.errorMessages.allTextContents();
    }
    return [];
  }

  /**
   * Cancel form and go back.
   */
  async cancel(): Promise<void> {
    await this.cancelLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Get current title value.
   */
  async getTitle(): Promise<string> {
    return await this.titleInput.inputValue();
  }

  /**
   * Get current visibility value.
   */
  async getVisibility(): Promise<string> {
    return await this.visibilitySelect.inputValue();
  }

  /**
   * Get available visibility options.
   */
  async getVisibilityOptions(): Promise<string[]> {
    const options = this.visibilitySelect.locator('option');
    return await options.allTextContents();
  }

  /**
   * Get available category options.
   */
  async getCategoryOptions(): Promise<string[]> {
    const options = this.categorySelect.locator('option');
    return await options.allTextContents();
  }
}
