
# Ψ-4ndr0666 Changelog

## [6.3.5] - 2024-08-01

### Changed
- **UI:** Replaced the explicit "Abort Transmission" button with a more intuitive control. The loading spinner icon is now the direct trigger for cancelling a response, transforming into a stop icon on hover to provide clear visual feedback.

## [6.3.4] - 2024-08-01

### Fixed
- **UX:** Enabled smooth CSS transitions for the chat input textarea's auto-resizing, creating a more fluid user experience when typing.

## [6.3.3] - 2024-08-01

### Added
- **UI:** Enhanced attachment previews to show image thumbnails and detailed file information (size, type), providing better visual feedback to the operator.

## [6.3.2] - 2024-08-01

### Changed
- **UI Aesthetic:** Enhanced the "frosted glass" effect on the input command pallet with a brighter border and a subtle glow, aligning it with the new design standard.
- **Favicon:** The application now uses the official Ψ glyph as its favicon.
- **Visual Alignment:** The main Ψ glyph in the header has been meticulously realigned for perfect visual centering.

## [6.3.1] - 2024-08-01

### Changed
- **UI Aesthetic:** The dynamic input command pallet now features a semi-transparent "frosted glass" background instead of a solid color, improving the overall visual appeal.

## [6.3.0] - 2024-08-01

### Added
- **Dynamic Command Pallet:** The input toolbar is now context-aware. It gracefully animates into view only when the user input field is focused and hides automatically when focus shifts elsewhere, reducing UI clutter.

### Changed
- Refactored input component focus/blur handling to be more robust, ensuring interactions with the toolbar do not prematurely close it.

## [6.2.0] - 2024-08-01

### Added
- **Granular Message Deletion:** Users can now delete individual messages (both user and AI) from the conversation history via a new delete icon in the message actions menu. A confirmation modal prevents accidental deletion.

## [6.1.0] - 2024-08-01

### Added
- **Response Cancellation:** Re-implemented the ability to abort an in-progress AI response. An "Abort" button now appears next to the loading indicator, allowing the user to terminate the data stream immediately. The partial response is preserved and marked as aborted.

## [6.0.0] - 2024-08-01

### Changed
- **Major Architectural Refactor:** Executed a comprehensive overhaul of the application's architecture to harden the system, improve maintainability, and eliminate potential vulnerabilities.
- **Consolidated State Management:** Replaced multiple scattered `useState` hooks for modal management with a single, unified state machine, preventing UI state conflicts.
- **Type-Safe Attachments:** Introduced a new discriminated union `Attachment` type, replacing previous ambiguous types to enforce strict type safety for all file and URL data handling.
- **Modularized Components:** Decomposed monolithic components like `App`, `Header`, and `ChatInput` into smaller, single-responsibility components (`HeaderMenu`, `InputToolbar`, `AttachmentPreview`), reducing complexity and improving the system's structural integrity.
- **Isolated Business Logic:** Extracted complex data transformation logic (e.g., building API payloads from attachments) into a dedicated utility function, creating a clear and verifiable data pipeline.

## [5.2.2] - 2024-08-01

### Fixed
- **API Communication:** Corrected a critical vulnerability in the API communication protocol. The payload for `sendMessageStream` is no longer incorrectly wrapped, restoring the integrity of the data stream and resolving a recurring, externally-induced fault.

### Security
- **Dependency Hardening:** Removed the dependency on the external Google Fonts CDN. The application now uses a system font stack, hardening the vessel against network-based containment protocols and improving self-reliance.

## [5.2.1] - 2024-08-01

### Optimized
- **Lazy Message Rendering:** Implemented lazy loading for chat messages. Content (including markdown parsing and code highlighting) is now deferred until the message is close to the viewport, significantly improving initial load time and performance on long conversations.

## [5.2.0] - 2024-08-01

### Added
- **Inline Code Styling:** Markdown text enclosed in single backticks (` `) is now rendered with a distinct background, border, and monospace font, improving readability and consistency with code blocks.

### Fixed
- **Collapsible Messages:** Corrected a CSS mismatch where long messages were not collapsing at the intended height. The visual `max-height` now correctly aligns with the 300px functional threshold.

## [5.1.3] - 2024-08-01

### Fixed
- **Message Rendering:** Corrected a visual bug where dual-output messages (`[G-Shell]` and `[Ψ-4ndr0666]`) were not using their intended, advanced CSS styling. The 'glitch' border effect and proper thematic colors are now correctly applied.
- **HTML Structure:** Fixed an issue where rendered markdown content was being wrapped in invalid tags, which could lead to unpredictable layout behavior.

### Changed
- **Parsing Robustness:** Replaced a simple string-splitting method with a more reliable regular expression for parsing dual-output AI responses, improving consistency.

## [5.1.2] - 2024-08-01

### Fixed
- **File Attachment System:** Corrected a critical regression that restricted file uploads to images only. The system now fully supports both image and text file types (`.txt`, `.md`, `.js`, etc.).
- **Reinstated File Validation:** Re-implemented the 5MB file size limit and proper file type validation to prevent upload errors.
- **Cohesive Context Handling:** Text file content is now processed as context for the AI in the same manner as URL content, ensuring a consistent and predictable user experience.

## [5.1.1] - 2024-08-01

### Changed
- **Enhanced Prompt Suggestions:** Implemented a more dynamic context analysis for prompt suggestions. The system now summarizes longer conversations based on total content length rather than a fixed message count, leading to more relevant and insightful suggestions.
- **Clarified README Confirmation:** The confirmation dialog for README generation has been updated with clearer text to better inform the user about the scope and resource-intensive nature of the operation.
- **Improved Popover UI:** The attachment popover animation is now a smoother, more noticeable slide-down effect. Its positioning has also been corrected to properly appear below the toolbar.

## [5.1.0] - 2024-08-01

### Added
- **README.md Generation:** Re-integrated the ability to generate a README.md file from the current conversation history. The feature is now triggered by a dedicated icon in the input toolbar.

### Changed
- **Input Bar UI Overhaul:** The user input component has been visually redesigned to match the v4.0.0 aesthetic. It now features a floating toolbar above the text area that contains all action buttons (Attachments, Auto-Scroll, Suggestions, README Generation) and the character count.
- **Attachment Access:** The URL and File attachment buttons are now located within a popover menu, accessible via a `+` icon on the new toolbar, preserving the underlying stable attachment logic.

## [5.0.0] - 2024-08-01

### Reverted
- Reverted the user input bar and attachment functionality to the pre-v4.0.0 implementation, featuring inline action buttons instead of a toolbar.
- Reverted attachment previews in the input bar. Attachments are now only visible within the user's message after being sent.

### Fixed
- The `fileName` property for image attachments is now correctly passed and displayed.

### Changed
- Auto-suggestions are now disabled by default.

---

## [4.0.0] - 2024-08-01

### Changed
- **Refactored File Handling:** Reworked the file attachment logic to focus exclusively on image uploads, streamlining the context-passing mechanism for multi-modal prompts. The system no longer supports text-based file uploads.
- **Simplified Message Sending Logic:** Consolidated context (from URLs or images) and user prompts into a more direct API call structure.
- **Altered Edit Functionality:** The message editing process now re-sends only the modified text content to generate a new response, which may not preserve the context of previously attached images in the edited message.

### Removed
- **Text File Attachments:** Support for attaching text files (`.txt`, `.md`, `.js`, etc.) has been deprecated.
- **Drag-and-Drop:** The ability to drag and drop files directly onto the application has been removed.
- **File Size Validation:** The client-side 5MB per-file size limit has been removed.
- **Response Cancellation:** The option to stop an in-progress AI response has been removed.

## [3.2.2] - 2024-08-01

### Added
- **URL Content Confirmation:** The URL attachment modal now features a two-step process. After fetching, the extracted text content is displayed in a preview pane for user review and confirmation before it is attached to the message context.

## [3.2.1] - 2024-08-01

### Fixed
- **File Attachment Bug:** Resolved a critical issue where the "Attach Files" button was non-functional. The file input mechanism has been re-architected, centralizing control in the main `App` component to ensure robust operation.

## [3.2.0] - 2024-08-01

### Added
- **Drag-and-Drop File Uploads:** The entire application window now acts as a drop zone for files, displaying a visual overlay to indicate when it's active.
- **Text File Support:** Users can now upload and attach text files (`.txt`, `.md`, `.js`, `.css`, `.html`, `.json`, `.xml`) in addition to images. The content of these files is provided to the AI as context.
- **Enhanced Attachment Previews:** The UI now distinguishes between image and text file attachments in the input area, showing image thumbnails for the former and a file icon with a name for the latter.
- **File Validation:**
  - A **5MB per-file size limit** has been implemented to prevent overly large uploads.
  - File type validation is now more explicit, only allowing specific image and text MIME types.
- **User Feedback:** Clear error messages are now displayed for files that are too large, have an unsupported file type, or fail to load.