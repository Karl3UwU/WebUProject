const fs = require('fs');
const path = require('path');

function loadEnv(options = {}) {
    const dotenvPath = options.path || path.resolve(process.cwd(), '.env');
    const encoding = options.encoding || 'utf8';
    const debug = options.debug || false;

    if (debug) {
        console.log(`[dotenv-custom] Loading environment variables from: ${dotenvPath}`);
    }

    try {
        const envFileContent = fs.readFileSync(dotenvPath, { encoding });
        const lines = envFileContent.split('\n');
        const parsed = {};

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Ignore comments and empty lines
            if (trimmedLine.startsWith('#') || trimmedLine === '') {
                continue;
            }

            // Regex to match KEY=VALUE, handling optional quotes around VALUE
            // It captures:
            // 1. The key (anything before the first '=')
            // 2. The value (anything after the first '=', optionally quoted)
            //    - If quoted, it captures the content inside the quotes.
            //    - If not quoted, it captures up to an inline comment (#) or end of line.
            const match = trimmedLine.match(/^([^=]+)=(.*)$/);

            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();

                // Remove surrounding quotes (single or double) from the value
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length - 1);
                }
                
                // Strip inline comments if not part of a quoted string.
                // This is a simplification; real dotenv is more robust here.
                // If the original value (before quote stripping) wasn't quoted,
                // and there's a '#', consider it a comment.
                const originalValue = match[2].trim();
                if (!(originalValue.startsWith('"') && originalValue.endsWith('"')) &&
                    !(originalValue.startsWith("'") && originalValue.endsWith("'"))) {
                    const commentStartIndex = value.indexOf('#');
                    if (commentStartIndex !== -1) {
                        value = value.substring(0, commentStartIndex).trim();
                    }
                }


                // By default, do NOT overwrite existing process.env variables
                if (!process.env.hasOwnProperty(key)) {
                    process.env[key] = value;
                    parsed[key] = value;
                    if (debug) console.log(`[dotenv-custom] Set: ${key}=${value}`);
                } else if (debug) {
                    console.log(`[dotenv-custom] Skipped (already set): ${key}`);
                }
            } else if (debug) {
                console.log(`[dotenv-custom] Malformed line (skipped): ${trimmedLine}`);
            }
        }
        return { parsed };
    } catch (err) {
        if (err.code === 'ENOENT') {
            if (debug) console.log(`[dotenv-custom] .env file not found at ${dotenvPath}. No variables loaded.`);
        } else {
            if (debug) console.error(`[dotenv-custom] Error loading .env file:`, err);
        }
        return { error: err };
    }
}

// Expose the loadEnv function
module.exports = { loadEnv };