/**
 * Static test data for E2E tests.
 * Contains sample data for posts, gists, guilds, scripts, etc.
 */

export const testData = {
  /**
   * Post test data.
   */
  posts: {
    valid: {
      title: 'Test Script Collection',
      summary: 'A collection of test scripts for automation',
      visibility: 'public',
      readme: 'This is a test readme with instructions for using the scripts.',
    },
    minimal: {
      title: 'Minimal Post',
      summary: 'Brief summary for a minimal post',
    },
    private: {
      title: 'Private Post',
      summary: 'This post should not be visible to others',
      visibility: 'private',
    },
    notListed: {
      title: 'Unlisted Post',
      summary: 'This post is not listed but accessible via URL',
      visibility: 'not_listed',
    },
  },

  /**
   * Gist test data.
   */
  gists: {
    authenticated: {
      name: 'test-gist',
      description: 'A test gist for E2E testing with multiple scripts',
      anonymous: false,
    },
    anonymous: {
      name: 'anonymous-gist',
      description: 'An anonymous gist that anyone can create',
      anonymous: true,
    },
    minimal: {
      name: 'minimal-gist',
      description: 'A minimal gist',
    },
  },

  /**
   * Guild test data.
   */
  guilds: {
    valid: {
      name: 'TestGuild',
      description: 'A test guild for E2E testing purposes',
      tag: 'TG',
      alignment: 'grey',
    },
    white: {
      name: 'WhiteHatGuild',
      description: 'A white hat guild for ethical hackers',
      tag: 'WHG',
      alignment: 'white',
    },
    black: {
      name: 'BlackHatGuild',
      description: 'A black hat guild for the dark side',
      tag: 'BHG',
      alignment: 'black',
    },
  },

  /**
   * Script content samples.
   */
  scripts: {
    sample: {
      name: 'main.src',
      content: `// Sample GreyScript
print("Hello, GreyHack!")
user_input = user_input("Enter your name: ")
print("Hello, " + user_input)`,
    },
    utility: {
      name: 'utils.src',
      content: `// Utility functions
get_lib = function(path)
    return include_lib(path)
end function

log = function(message)
    print("[LOG] " + message)
end function`,
    },
    networkScanner: {
      name: 'scanner.src',
      content: `// Network Scanner
scan_ports = function(ip)
    ports = [21, 22, 80, 443, 3306]
    open_ports = []
    for port in ports
        if is_port_open(ip, port) then
            open_ports.push(port)
        end if
    end for
    return open_ports
end function`,
    },
    passwordCracker: {
      name: 'cracker.src',
      content: `// Password Cracker Utility
crack = function(hash, wordlist)
    for word in wordlist
        if md5(word) == hash then
            return word
        end if
    end for
    return null
end function`,
    },
  },

  /**
   * Folder test data.
   */
  folders: {
    lib: {
      name: 'lib',
    },
    src: {
      name: 'src',
    },
    utils: {
      name: 'utils',
    },
  },

  /**
   * Comment test data.
   */
  comments: {
    valid: {
      content: 'This is a test comment for the E2E test suite.',
    },
    reply: {
      content: 'This is a reply to the previous comment.',
    },
    long: {
      content: 'This is a longer comment that contains more detailed feedback about the script. The code looks good, but I have a few suggestions for improvement. First, consider adding error handling for edge cases. Second, the variable naming could be more descriptive.',
    },
  },

  /**
   * Announcement test data.
   */
  announcements: {
    valid: {
      message: 'Test announcement message for guild members.',
    },
    welcome: {
      message: 'Welcome to our guild! Check out our latest scripts and feel free to share your own.',
    },
    update: {
      message: 'We have updated our guild rules. Please review the changes in the description.',
    },
  },

  /**
   * Build test data.
   */
  builds: {
    initial: {
      name: 'v1.0.0',
    },
    updated: {
      name: 'v1.1.0',
    },
    beta: {
      name: 'v2.0.0-beta',
    },
  },

  /**
   * Category names (should match seeded categories).
   */
  categories: [
    'Hacking Tools',
    'Utilities',
    'Games',
    'Libraries',
    'Templates',
  ],
};

/**
 * Export string for testing the import/export functionality.
 * This is a valid compressed export string from GreyParser.
 */
export const sampleExportString = 'eyJuYW1lIjoidGVzdCIsInNjcmlwdHMiOlt7Im5hbWUiOiJtYWluLnNyYyIsImNvbnRlbnQiOiJwcmludChcIkhlbGxvXCIpIn1dfQ==';
