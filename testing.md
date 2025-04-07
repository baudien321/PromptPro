# PromptPro MVP Testing Plan

This document outlines the testing strategy for the PromptPro MVP, focusing on core features, usability, and potential edge cases based on the specifications in `MVP.md`.

## Testing Environment

*   **Browsers:** Latest Chrome, Firefox, Edge (Specify versions if needed)
*   **Environment:** Local development, Staging (if applicable)
*   **Accounts:** Prepare test accounts with different roles (Owner, Admin, Member) and subscription plans (Free, Pro).

## Testing Tools

*   **Manual:** Browser Developer Tools (Console, Network), Direct Database Inspection (optional)
*   **Automated:**
    *   **Unit Tests:** Jest / Vitest (for helper functions, validators)
    *   **Integration Tests:** Jest / Vitest / Supertest (for API endpoint logic, database interactions, permissions)
    *   **End-to-End (E2E) Tests:** Playwright / Cypress (for simulating user flows in the browser)

---

## Testing Areas

### 1. Core Prompt Management (Library & CRUD)

*   **Test Objective:** Verify users can create, view, update, and delete prompts within the correct context (personal/team).
*   **Manual Test Steps:**
    1.  [x] Log in.
    2.  [x] Navigate to "Create Prompt" page/modal.
    3.  Fill in required fields (Title, Content) and optional fields (Description).
    4.  Save the prompt (initially as Private).
    5.  Verify prompt appears in "My Prompts" list.
    6.  Click the prompt to view details.
    7.  Edit the prompt (change title, content, description).
    8.  Save changes and verify updates.
    9.  Delete the prompt and confirm removal from the list.
*   **Automated Test Ideas:**
    *   **API:** POST `/api/prompts`, check 201 response & data. GET `/api/prompts` / `/api/prompts/[id]`, check 200 & data. PUT `/api/prompts/[id]`, check 200 & updated data. DELETE `/api/prompts/[id]`, check 200/204. GET again, check 404.
    *   **E2E:** Simulate the full manual flow above.
*   **Edge Cases/Negative Tests:**
    *   Create prompt with empty title/content (expect validation error).
    *   Create prompt with excessively long title/content/description (expect validation/truncation).
    *   Attempt to view/edit/delete a prompt belonging to another user (expect 403/404).
    *   Attempt to access non-existent prompt ID (expect 404).
    *   Special characters in fields.

### 2. Team Workspaces & Prompt Association

*   **Test Objective:** Verify users can create teams, manage members (basic add for MVP), and associate prompts with teams.
*   **Manual Test Steps:**
    1.  Log in.
    2.  Navigate to Team Management.
    3.  Create a new team (Name, Description).
    4.  Verify team appears in list.
    5.  (If member management UI exists) Invite/add another test user to the team.
    6.  Create a new prompt, set Visibility to "Team", select the created team.
    7.  Save the prompt.
    8.  Verify the prompt is associated with the team (e.g., visible in a team view or has team indicator).
    9.  Log in as the *other* team member, verify they can see the team prompt.
    10. Log in as a non-member, verify they *cannot* see the team prompt.
    11. Edit the prompt, change visibility back to Private/Public, verify team association is removed/changed.
*   **Automated Test Ideas:**
    *   **API:** Test Team CRUD endpoints (`/api/teams`, `/api/teams/[id]/members`). Test prompt creation with `teamId`. Test GET `/api/prompts` with team filters and different user tokens.
    *   **E2E:** Simulate team creation, prompt creation with team visibility, checking visibility across different user accounts.
*   **Edge Cases/Negative Tests:**
    *   Create team with empty name.
    *   Create prompt with visibility "Team" but no team selected (expect validation error).
    *   Attempt to add a prompt to a team the user isn't part of (expect 403).
    *   Attempt non-owner actions on team settings (expect 403).

### 3. Tagging & Search

*   **Test Objective:** Verify users can add/remove tags to prompts and use search/filter functionality.
*   **Manual Test Steps:**
    1.  Create/Edit a prompt.
    2.  Add multiple tags (e.g., "marketing", "test", "api").
    3.  Verify tags are displayed.
    4.  Remove a tag.
    5.  Save and verify tags persist.
    6.  Use the search bar: search by title, content keyword, tag.
    7.  Verify search results are relevant.
    8.  (If tag filter UI exists) Click a tag, verify list filters correctly.
*   **Automated Test Ideas:**
    *   **API:** Test prompt creation/update with `tags` array. Test GET `/api/prompts` with `tags` and `q` query parameters.
    *   **E2E:** Simulate adding/removing tags, typing in search bar, verifying filtered results.
*   **Edge Cases/Negative Tests:**
    *   Add duplicate tags (expect only one to be saved).
    *   Add tags with special characters/spaces (check handling).
    *   Search for non-existent terms/tags (expect empty results/message).
    *   Search combining multiple filters (if supported).

### 4. Cross-Model Compatibility & Templates

*   **Test Objective:** Ensure users can mark prompts for specific AI platforms and apply basic templates.
*   **Manual Test Steps:**
    1.  Create/Edit a prompt.
    2.  In Advanced Options, select one or more platforms (e.g., ChatGPT, Claude).
    3.  Save and verify compatibility is displayed/stored.
    4.  Edit prompt again.
    5.  Select a template from the dropdown.
    6.  Verify the prompt content area is updated with the template text.
    7.  Save and verify.
*   **Automated Test Ideas:**
    *   **API:** Test prompt creation/update with `platformCompatibility` array.
    *   **E2E:** Simulate selecting platform checkboxes, selecting template dropdown, verifying content change.
*   **Edge Cases/Negative Tests:**
    *   Select no platforms.
    *   Select all platforms.
    *   Apply template to a prompt that already has content (verify overwrite behaviour).

### 5. Role-Based Access Control (RBAC)

*   **Test Objective:** Verify permissions for Owner, Admin, and Member roles within teams.
*   **Manual Test Steps:** (Requires test accounts with different roles in the *same* team)
    1.  **Owner:** Verify can manage team settings, invite/remove members (if UI exists), change roles, edit/delete *any* team prompt.
    2.  **Admin:** Verify *same* permissions as Owner (based on MVP spec).
    3.  **Member:** Verify *cannot* manage team settings, invite/remove, change roles. Verify can view team prompts, create team prompts, edit/delete *only their own* team prompts. Verify cannot edit/delete other members' team prompts.
    4.  Check UI elements visibility (e.g., delete button on prompts, team settings access) based on role.
*   **Automated Test Ideas:**
    *   **API (Integration):** Crucial for RBAC. Make API calls (e.g., PUT `/api/prompts/[team_prompt_id]`, DELETE `/api/teams/[id]/members/[member_id]`) using tokens for Owner, Admin, Member roles. Assert expected success (200) or failure (403) status codes.
    *   **E2E:** Log in as each role, attempt restricted actions, verify UI limitations and API responses.
*   **Edge Cases/Negative Tests:**
    *   Owner attempting to remove themselves (or last owner).
    *   Admin attempting actions only owner should do (if any divergence from spec later).
    *   User trying to access team resources after being removed.
    *   Changing a user's role and immediately testing their new permissions.

### 6. Basic Performance Tracking (Analytics/Success Flag)

*   **Test Objective:** Check if basic usage metrics are captured and the 'Effective' flag works.
*   **Manual Test Steps:**
    1.  Use a prompt (e.g., copy its content).
    2.  Check if usage count increases (may require checking Analytics page or DB).
    3.  View a prompt, find the 'Effective' flag/toggle.
    4.  Toggle it on/off.
    5.  Refresh/revisit, verify the state persists.
    6.  Navigate to the basic Analytics Dashboard (if UI exists), check for aggregated data (most used prompts etc.).
*   **Automated Test Ideas:**
    *   **API:** Call prompt usage increment endpoint, then GET prompt and check `usageCount`. Call endpoint to toggle `isEffective`, then GET prompt and check field value.
    *   **Integration:** Simulate usage, then query analytics data endpoint/DB.
*   **Edge Cases/Negative Tests:**
    *   Toggling flag rapidly.
    *   Checking analytics page with no usage data.

### 7. Team Collaboration (Comments)

*   **Test Objective:** Verify users can add and view comments on prompts.
*   **Manual Test Steps:**
    1.  View a prompt.
    2.  Find the comment section.
    3.  Add a comment.
    4.  Verify the comment appears with username/timestamp.
    5.  Add multiple comments.
    6.  Log in as another user (with access to the prompt), view the prompt, verify comments are visible.
*   **Automated Test Ideas:**
    *   **API:** POST comment to `/api/prompts/[id]/comments`. GET comments for a prompt.
    *   **E2E:** Simulate viewing prompt, typing and submitting comment, verifying display.
*   **Edge Cases/Negative Tests:**
    *   Submitting an empty comment.
    *   Submitting very long comments or comments with markdown/HTML (check sanitization/display).
    *   Attempting to comment on a prompt they cannot view.

### 8. Export & Audit Logs

*   **Test Objective:** Verify JSON export works and critical actions are logged.
*   **Manual Test Steps:**
    1.  Find the 'Export Prompts' button/feature.
    2.  Trigger the export.
    3.  Verify a JSON file is downloaded.
    4.  Inspect the JSON file for correct structure and data.
    5.  Perform critical actions (log in, create/delete prompt, create/update team).
    6.  Navigate to the Audit Log viewer (Admin only).
    7.  Verify the actions performed are listed with relevant details (user, action, target, timestamp).
*   **Automated Test Ideas:**
    *   **API:** Call export endpoint, validate response `Content-Type` and data structure. Call critical action APIs (e.g., POST prompt), then call audit log API (or query DB) to verify log entry creation.
*   **Edge Cases/Negative Tests:**
    *   Exporting when there are no prompts.
    *   Checking audit logs immediately after action (allow for minor delay).
    *   Filtering audit logs (if supported).

### 9. Paywall & Usage Limits

*   **Test Objective:** Ensure prompt limits are enforced based on user/team plan and Stripe integration works for upgrades.
*   **Manual Test Steps:**
    1.  **Free User:** Create personal prompts up to the limit (e.g., 10). Attempt to create one more. Verify error message/block.
    2.  **Free Team:** Create team prompts up to the team limit. Attempt one more. Verify error/block.
    3.  **Upgrade Flow:** Find the 'Upgrade' button/link. Initiate checkout (using Stripe test mode). Complete payment.
    4.  Verify plan status updates in UI/billing section.
    5.  Verify prompt limits are increased/removed for the upgraded user/team.
    6.  Visit Stripe portal link (if available) to manage subscription.
*   **Automated Test Ideas:**
    *   **API (Integration):** Simulate creating prompts via API until limit is reached, assert error on next attempt. Mock Stripe webhook or API call to simulate plan change, then re-test limit enforcement via API.
    *   **E2E:** Difficult to fully automate Stripe flow without extensive mocking, but can test UI elements leading up to checkout and check plan status display after simulated upgrade.
*   **Edge Cases/Negative Tests:**
    *   Hitting the limit exactly.
    *   Concurrent requests trying to create prompts when near the limit.
    *   Handling failed Stripe payments/webhooks.
    *   Checking limits immediately after upgrade (allow for propagation).

### 10. General UI/UX & Error Handling

*   **Test Objective:** Ensure general usability, responsiveness, and graceful error handling.
*   **Manual Test Steps:**
    *   Test on different screen sizes (Desktop, Tablet, Mobile).
    *   Check for consistent styling and layout.
    *   Verify all links and buttons work as expected.
    *   Check form validation messages are clear and helpful.
    *   Look for JavaScript errors in the browser console.
    *   Test loading states (spinners, disabled buttons) during API calls.
    *   Test browser back/forward navigation.
    *   Log out and log back in.
*   **Automated Test Ideas:**
    *   **E2E:** Basic navigation tests, checking for console errors during flows.
    *   **Visual Regression Testing:** Tools like Percy or Chromatic to catch unintended UI changes.
    *   **Accessibility Checks:** Tools like Axe integrated into E2E tests.
*   **Edge Cases/Negative Tests:**
    *   Simulate network errors during API calls (using browser dev tools or test framework features).
    *   Attempting to navigate to invalid URLs.
    *   Refreshing the page during multi-step forms.

---

**Note:** This plan should be treated as a living document and updated as features evolve or bugs are found. 