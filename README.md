# Dutch Postal Code Copier

A Chrome extension that automatically detects Dutch postal codes on webpages and adds a copy functionality.

## Features

- Automatically detects Dutch postal codes (format: 4 digits + space + 2 letters, e.g., "3144 CB")
- Highlights detected postal codes with a subtle yellow background
- Shows a copy button when hovering over a postal code
- Visual feedback when a postal code is copied
- Works on Dutch websites by default, with option to enable on all websites
- Optimized performance with batch processing
- Observes DOM changes to detect postal codes in dynamically loaded content

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store (link to be added)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now be installed and active

## Usage

1. Visit any Dutch website containing postal codes
2. The extension will automatically detect and highlight postal codes
3. Hover over a highlighted postal code to reveal the copy button
4. Click the copy button to copy the postal code to your clipboard
5. A green checkmark will briefly appear to confirm the copy action

## Settings

You can customize the extension's behavior by clicking on the extension icon in your toolbar:

- **Enable on all websites**: By default, the extension only runs on Dutch websites (*.nl domains). Enable this option to run the extension on all websites.
- **Use performance mode**: When enabled, the extension uses batch processing to reduce the impact on page performance. Disable for immediate processing (may cause lag on large pages).

## Notes

- The extension only detects properly formatted Dutch postal codes (4 digits + space + 2 letters)
- It does not modify form fields or text inputs
- Postal codes inside scripts or style tags are ignored
- Performance settings help balance detection speed vs. browser performance

## Troubleshooting

If the extension is making pages slow:
- Keep "Performance mode" enabled
- Disable "Enable on all websites" if you're not browsing Dutch content
- For very large pages, try refreshing with the extension disabled

## Future Improvements

- Add keyboard shortcut for copying selected postal codes
- Add options to customize highlight color
- Add ability to disable the extension for specific websites
- Implement postal code validation against official Dutch postal code database

## License

MIT

## Credits

Created by PostalCopy