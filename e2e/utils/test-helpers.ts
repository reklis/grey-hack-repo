/**
 * Generate a unique ID with optional prefix.
 * Useful for creating unique test data.
 */
export function uniqueId(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate a unique email address for testing.
 */
export function uniqueEmail(): string {
  return `test_${uniqueId()}@e2e.test`;
}

/**
 * Generate a unique username for testing.
 * Keeps it short to fit username length constraints.
 */
export function uniqueUsername(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `user_${timestamp}${random}`.substring(0, 20);
}

/**
 * Generate a unique post title for testing.
 */
export function uniquePostTitle(): string {
  const random = Math.random().toString(36).substring(2, 10);
  return `Test Post ${random}`;
}

/**
 * Generate a unique guild name for testing.
 * Keeps it within guild name length constraints (3-32 chars).
 */
export function uniqueGuildName(): string {
  const timestamp = Date.now().toString(36);
  return `Guild_${timestamp}`.substring(0, 20);
}

/**
 * Generate a unique gist name for testing.
 * Max 32 characters for gist names.
 */
export function uniqueGistName(): string {
  const random = Math.random().toString(36).substring(2, 10);
  return `gist_${random}`;
}

/**
 * Generate a unique guild tag (3 characters).
 */
export function uniqueGuildTag(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let tag = '';
  for (let i = 0; i < 3; i++) {
    tag += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return tag;
}

/**
 * Generate sample GreyScript code for testing.
 */
export function sampleScriptContent(variant: 'basic' | 'utility' | 'complex' = 'basic'): string {
  switch (variant) {
    case 'basic':
      return `// Sample GreyScript - ${uniqueId()}
print("Hello, GreyHack!")
user_input = user_input("Enter your name: ")
print("Hello, " + user_input)`;

    case 'utility':
      return `// Utility functions - ${uniqueId()}
get_lib = function(path)
    return include_lib(path)
end function

log = function(message)
    print("[LOG] " + message)
end function`;

    case 'complex':
      return `// Complex script - ${uniqueId()}
// Network scanner utility

scan_network = function(ip_range)
    results = []
    for ip in ip_range
        if is_reachable(ip) then
            results.push(ip)
        end if
    end for
    return results
end function

main = function()
    targets = scan_network(["192.168.1.1", "192.168.1.2"])
    for target in targets
        print("Found: " + target)
    end for
end function

main()`;
  }
}

/**
 * Sleep for a specified number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function until it succeeds or max retries reached.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}
