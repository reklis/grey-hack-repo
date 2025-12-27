import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Component for interacting with the file tree in build editor.
 * Handles adding, selecting, and navigating files and folders.
 */
export class FileTreeComponent {
  readonly page: Page;
  readonly waitHelpers: WaitHelpers;

  /** Root container of the file tree */
  readonly root: Locator;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);
    this.root = page.locator('[id$="_file_tree"], #build-explorer');
  }

  /**
   * Add a new script to the current fileable.
   */
  async addScript(fileableSignedId: string): Promise<void> {
    const addButton = this.page.locator(
      `button[data-reflex="click->FileableForm::Reflex#add_script"][data-fileable-id="${fileableSignedId}"]`
    );
    await addButton.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Add a new folder to the current fileable.
   */
  async addFolder(fileableSignedId: string): Promise<void> {
    const addButton = this.page.locator(
      `button[data-reflex="click->FileableForm::Reflex#add_folder"][data-fileable-id="${fileableSignedId}"]`
    );
    await addButton.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Select a file in the tree by name.
   */
  async selectFile(fileName: string): Promise<void> {
    const fileLink = this.root.locator(`a:has-text("${fileName}"), button:has-text("${fileName}")`);
    await fileLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Expand or collapse a folder.
   */
  async toggleFolder(folderName: string): Promise<void> {
    const folder = this.root.locator(`text="${folderName}"`);
    await folder.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Check if a file exists in the tree.
   */
  async hasFile(fileName: string): Promise<boolean> {
    const file = this.root.locator(`text="${fileName}"`);
    return await file.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if a folder exists in the tree.
   */
  async hasFolder(folderName: string): Promise<boolean> {
    const folder = this.root.locator(`text="${folderName}"`);
    return await folder.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get all file names in the tree.
   */
  async getFileNames(): Promise<string[]> {
    const files = this.root.locator('[data-file-name]');
    const count = await files.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await files.nth(i).getAttribute('data-file-name');
      if (name) names.push(name);
    }
    return names;
  }

  /**
   * Get the "Add script" button for a fileable.
   */
  getAddScriptButton(fileableSignedId: string): Locator {
    return this.page.locator(
      `button[data-reflex="click->FileableForm::Reflex#add_script"][data-fileable-id="${fileableSignedId}"]`
    );
  }

  /**
   * Get the "Add folder" button for a fileable.
   */
  getAddFolderButton(fileableSignedId: string): Locator {
    return this.page.locator(
      `button[data-reflex="click->FileableForm::Reflex#add_folder"][data-fileable-id="${fileableSignedId}"]`
    );
  }

  /**
   * Check if the file tree is visible.
   */
  async isVisible(): Promise<boolean> {
    return await this.root.isVisible({ timeout: 1000 }).catch(() => false);
  }
}
