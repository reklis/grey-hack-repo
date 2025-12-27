import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { FileTreeComponent } from '../components/file-tree.component';
import { ModalComponent } from '../components/modal.component';

/**
 * Page object for the build editor (post builds page).
 */
export class BuildEditorPage extends BasePage {
  /** Post title */
  readonly postTitle: Locator;

  /** Builds table */
  readonly buildsTable: Locator;

  /** Add build button */
  readonly addBuildButton: Locator;

  /** Publish post button */
  readonly publishPostButton: Locator;

  /** File tree component */
  readonly fileTree: FileTreeComponent;

  /** Modal component */
  readonly modal: ModalComponent;

  /** Import from string link */
  readonly importFromStringLink: Locator;

  constructor(page: Page) {
    super(page);

    this.postTitle = page.locator('h1.text-3xl');
    this.buildsTable = page.locator('#fileable-list');
    this.addBuildButton = page.locator('button:has-text("Add Build")');
    this.publishPostButton = page.locator('#publish-post');
    this.fileTree = new FileTreeComponent(page);
    this.modal = new ModalComponent(page);
    this.importFromStringLink = page.locator('a:has-text("import from string")');
  }

  /**
   * Navigate to the builds page for a post.
   */
  async goto(slug: string): Promise<void> {
    await this.navigateTo(`/posts/${slug}/builds`);
  }

  /**
   * Get all build rows from the table.
   */
  async getBuildRows(): Promise<Locator[]> {
    const rows = this.buildsTable.locator('tr');
    const count = await rows.count();
    const result: Locator[] = [];
    for (let i = 0; i < count; i++) {
      result.push(rows.nth(i));
    }
    return result;
  }

  /**
   * Get build count.
   */
  async getBuildCount(): Promise<number> {
    const rows = await this.getBuildRows();
    // Filter out header and footer rows
    return rows.length > 0 ? rows.length - 2 : 0;
  }

  /**
   * Add a new build.
   */
  async addBuild(): Promise<void> {
    await this.addBuildButton.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Click publish button for a build.
   */
  async publishBuild(buildId: string): Promise<void> {
    const publishButton = this.page.locator(`#publish-${buildId}`);
    await publishButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Click the edit button for a build.
   */
  async editBuild(buildId: string): Promise<void> {
    const editLink = this.page.locator(`a[href*="build_id=${buildId}"]`);
    await editLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Update a build name via reflex.
   */
  async updateBuildName(buildSignedId: string, newName: string): Promise<void> {
    const input = this.page.locator(`input[data-build-id="${buildSignedId}"]`);
    await input.fill(newName);
    // Wait for debounced reflex
    await this.waitHelpers.waitForDebouncedReflex();
  }

  /**
   * Clone a build.
   */
  async cloneBuild(buildSignedId: string): Promise<void> {
    const cloneButton = this.page.locator(
      `button[data-build-id="${buildSignedId}"]:has-text("clone")`
    );
    await cloneButton.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Delete a build.
   */
  async deleteBuild(buildId: string): Promise<void> {
    const deleteButton = this.page.locator(`a[href="/builds/${buildId}"][data-turbo-method="delete"]`);
    await deleteButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * View diff for a build.
   */
  async viewDiff(buildId: string): Promise<void> {
    const diffLink = this.page.locator(`a[href*="/builds/${buildId}/diff"]`);
    await diffLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Publish the post.
   */
  async publishPost(): Promise<void> {
    await this.publishPostButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if post can be published.
   */
  async canPublishPost(): Promise<boolean> {
    return await this.publishPostButton.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Open import from string modal.
   */
  async openImportModal(): Promise<void> {
    await this.importFromStringLink.click();
    await this.modal.waitForOpen();
  }

  /**
   * Import build from export string.
   */
  async importFromString(exportString: string): Promise<void> {
    await this.openImportModal();
    const textarea = this.page.locator('textarea[data-fileable-form-target="string"]');
    await textarea.fill(exportString);
    const importButton = this.page.locator('button[data-action="click->fileable-form#import_string"]');
    await importButton.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Check if a build is ready to publish.
   */
  async isBuildReadyToPublish(buildId: string): Promise<boolean> {
    const publishButton = this.page.locator(`#publish-${buildId}`);
    return await publishButton.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get error messages if any.
   */
  async getErrors(): Promise<string[]> {
    const errors = this.page.locator('.text-red-600, .text-red-400');
    return await errors.allTextContents();
  }
}
