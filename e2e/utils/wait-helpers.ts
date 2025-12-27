import { Page } from '@playwright/test';

/**
 * Helper class for waiting on async operations in the Grey Repo app.
 * Handles Turbo Drive, StimulusReflex, and CableReady operations.
 */
export class WaitHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for Turbo Drive navigation to complete.
   * Turbo Drive uses data-turbo-preview during page transitions.
   */
  async waitForTurbo(timeout = 10000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        // Check that Turbo is not in a loading state
        return !document.documentElement.hasAttribute('data-turbo-preview') &&
               !document.body.classList.contains('turbo-loading');
      },
      { timeout }
    );
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for StimulusReflex morph operations to complete.
   * StimulusReflex adds data-reflex-pending during operations.
   */
  async waitForReflex(timeout = 5000): Promise<void> {
    // Wait for any pending reflexes to complete
    await this.page.waitForFunction(
      () => {
        const pending = document.querySelectorAll('[data-reflex-pending]');
        return pending.length === 0;
      },
      { timeout }
    ).catch(() => {
      // Ignore timeout - reflex may have already completed
    });

    // Small delay for DOM reconciliation after morph
    await this.page.waitForTimeout(100);
  }

  /**
   * Wait for CableReady DOM updates to complete.
   * CableReady operations are typically fast but need ActionCable round-trip.
   */
  async waitForCableReady(timeout = 3000): Promise<void> {
    // CableReady operations complete quickly, but need time for ActionCable
    await this.page.waitForTimeout(300);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for a specific Turbo Frame to finish loading.
   * @param frameId - The ID of the turbo-frame element
   */
  async waitForTurboFrame(frameId: string, timeout = 10000): Promise<void> {
    await this.page.waitForSelector(
      `turbo-frame#${frameId}:not([busy])`,
      { timeout }
    );
  }

  /**
   * Wait for debounced input reflex to trigger.
   * StimulusReflex inputs are often debounced (default 300ms).
   * @param debounceMs - The debounce delay in milliseconds
   */
  async waitForDebouncedReflex(debounceMs = 300): Promise<void> {
    // Wait for debounce delay plus some buffer
    await this.page.waitForTimeout(debounceMs + 100);
    await this.waitForReflex();
  }

  /**
   * Wait for ActionCable WebSocket connection to establish.
   * Returns true if connected, false if timeout.
   */
  async waitForActionCable(timeout = 5000): Promise<boolean> {
    return await this.page.evaluate((timeoutMs) => {
      return new Promise<boolean>((resolve) => {
        const checkConnection = () => {
          // Check if ActionCable consumer is connected
          // @ts-ignore - ActionCable global
          if (typeof window.App !== 'undefined' && window.App.cable) {
            // @ts-ignore
            return window.App.cable.connection.isOpen();
          }
          return false;
        };

        if (checkConnection()) {
          resolve(true);
          return;
        }

        // Poll for connection
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 100;
          if (checkConnection()) {
            clearInterval(interval);
            resolve(true);
          } else if (elapsed >= timeoutMs) {
            clearInterval(interval);
            resolve(false);
          }
        }, 100);
      });
    }, timeout);
  }

  /**
   * Wait for page to be fully loaded and interactive.
   * Combines multiple wait strategies for reliability.
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    await this.waitForTurbo();
  }

  /**
   * Wait for an element to appear and be visible.
   * @param selector - CSS selector for the element
   */
  async waitForElement(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Wait for an element to be removed from DOM.
   * @param selector - CSS selector for the element
   */
  async waitForElementRemoved(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'detached', timeout });
  }
}
