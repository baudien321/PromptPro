# Team Collaboration Tools Implementation Plan

This document tracks the step-by-step implementation of team collaboration features as defined in the MVP requirements.

## Progress Tracking

- [x] Create implementation plan
- [x] Update Team Model and Roles
- [x] Team Prompt Visibility and Access Control
- [x] Comment System Permissions
- [x] Create Team Prompt Listing
- [x] User Interface Updates
- [ ] Testing and Documentation

## MVP Role System

### Role Capabilities

| Role          | Capabilities                                                                         |
|---------------|--------------------------------------------------------------------------------------|
| **Admin/Owner** | • Manage team settings<br>• Invite/remove members<br>• Create/edit/delete any prompt<br>• Control team visibility |
| **Member**    | • View all team prompts<br>• Create new prompts<br>• Edit their own prompts<br>• Comment on any prompt            |

## Implementation Details

### 1. Update Team Model and Roles

**Status: Completed**

The current model already has `owner`, `admin`, and `member` roles, which aligns with our requirements.

#### Tasks:
- [x] Confirm role mapping:
  - `owner` and `admin` → Admin/Owner permissions 
  - `member` → Member permissions
- [x] Document role capabilities in a central place for reference

#### Implementation Notes:
* Current model in `models/team.js` already defines roles as `owner`, `admin`, and `member`
* Created `lib/permissions.js` as the central reference for role capabilities
* Implemented utility functions for permission checks:
  - `hasCapability()` - Check if a user has a specific capability
  - `canManagePrompt()` - Check if a user can view/edit/delete a prompt
  - `canManageTeam()` - Check if a user can manage team settings
  - `canInviteMembers()` - Check if a user can invite team members
  - `canRemoveMembers()` - Check if a user can remove team members

### 2. Team Prompt Visibility and Access Control

**Status: Completed**

Implemented team-based access control for prompts, allowing team members to view all team prompts but restricting edit permissions based on roles.

#### Tasks:
- [x] Update `pages/api/prompts/[id].js` to implement team-based access control:
  - Team members can view all team prompts
  - Admin/Owner can edit/delete any prompt
  - Members can only edit their own prompts
- [x] Update `pages/api/prompts/index.js` to filter prompts based on team membership
- [x] Update prompt creation to support team association

#### Implementation Notes:
* Updated `getPrompt` in `[id].js` to check visibility and team membership for non-public prompts
* Updated `updatePrompt` and `deletePrompt` to use the role-based permission system
* Added team membership verification for team prompts in `getPrompts`
* Added filtering based on visibility and team membership in prompt listing
* Added validation for team membership when creating a team prompt

### 3. Comment System Permissions

**Status: Completed**

Implemented team-based access control for comments on prompts, ensuring proper permission checks for viewing, adding, updating, and deleting comments.

#### Tasks:
- [x] Update `pages/api/prompts/[id]/comments.js` to check team membership
- [x] Create single comment API endpoint for updating/deleting comments
- [x] Enforce proper permissions for comment operations based on team roles

#### Implementation Notes:
* Updated comments API to check team membership when accessing comments for a team prompt
* Created a new API endpoint `pages/api/comments/[id].js` for updating and deleting individual comments
* Implemented permission checks to ensure only comment authors can edit their comments
* Implemented permission checks to ensure team admins can delete any comment on their team prompts
* Added teamId to comments for team prompts to better track comment ownership

### 4. Create Team Prompt Listing

**Status: Completed**

Implemented an API endpoint and frontend page to list all prompts for a specific team, only accessible to team members.

#### Tasks:
- [x] Create a new API endpoint to list all team prompts
- [x] Implement frontend component to display team prompts

#### Implementation Notes:
* Created `pages/api/teams/[id]/prompts.js` to list team prompts.
* Updated `pages/teams/[id].js` to fetch and display prompts using `PromptCard`.
* Passed `team` and `session` data to `PromptCard` for permission checks.
* Added basic error handling for prompt fetching.

### 5. User Interface Updates

**Status: Completed**

Implemented updates to the user interface to support team collaboration features, ensuring a seamless user experience for team-based prompt management.

#### Tasks:
- [x] Update prompt creation/editing form:
  - [x] Add visibility selection (public, private, team)
  - [x] Add team dropdown when 'team' visibility is selected
  - [x] Show appropriate validation messages for team selection
- [x] Create team prompt listing page:
  - [x] Design team dashboard layout with prompt listing
  - [x] Implement filtering and sorting options (Basic list implemented)
  - [x] Show role-appropriate action buttons (edit/delete) based on permissions (Via `PromptCard`)
- [x] Update prompt detail view:
  - [x] Display team information for team prompts
  - [x] Show user's role in the team (Indirectly via permissions)
  - [x] Conditionally render edit/delete buttons based on permissions
- [x] Add comment UI components:
  - [x] Comment listing with author information (Via `Comments` component)
  - [x] Comment form with proper validation (Via `Comments` component)
  - [x] Edit/delete options for comment authors and team admins (Via `Comments` component and API)

#### Implementation Notes:
* Updated `components/PromptEditor.js` to handle team visibility and selection.
* Updated `components/PromptCard.js` to use `canManagePrompt` for action buttons.
* Updated `pages/teams/[id].js` to use the correct API and pass data to `PromptCard`.
* Integrated `components/Comments.js` into `pages/prompts/[id].js`, passing necessary props.

#### UI Component Structure:
* `components/prompts/PromptForm.js` - Update to include team selection
* `components/teams/TeamPromptList.js` - Implemented within `pages/teams/[id].js`
* `components/prompts/PromptDetail.js` - Update to show team information
* `components/comments/CommentSection.js` - Integrated into `pages/prompts/[id].js`

### 6. Testing and Documentation

**Status: Not Started**

Create comprehensive tests and documentation for the team collaboration features to ensure reliability and maintainability.

#### Tasks:
- [ ] Unit Testing:
  - [ ] Test permission utility functions
  - [ ] Test API endpoints with different user roles
  - [ ] Test frontend components with mocked data (`PromptCard`, `PromptEditor`, `Comments`)
- [ ] Integration Testing:
  - [ ] Test end-to-end team creation and prompt sharing
  - [ ] Test comment system with different user permissions
  - [ ] Test team member management and role changes
- [ ] Documentation:
  - [ ] Update API documentation with new endpoints
  - [ ] Document role-based permissions system
  - [ ] Create user guide for team collaboration features
  - [ ] Update code comments for clarity

#### Implementation Notes:
* Use Jest for unit testing
* Use Cypress for integration testing
* Create comprehensive API documentation using Swagger/OpenAPI
* Update README with team collaboration feature overview
* Document edge cases and error handling approaches

#### Test Cases:
* Test viewing/editing/deleting prompts with different user roles
* Test creating/editing/deleting comments with different user roles
* Test team member invitation and role changes
* Test prompt visibility filters in listing pages
* Test permission-based UI rendering (showing/hiding action buttons)

## Summary of Backend Implementation

We have successfully implemented the backend functionality for team collaboration in the PromptPro application. The implementation follows the MVP role system requirements with the following key features:

1. **Role-Based Permission System:**
   * Created a central permissions utility that defines role capabilities
   * Implemented helper functions to check user permissions based on roles
   * Mapped existing roles (`owner`, `admin`, `member`) to the required MVP permissions

2. **Team Prompt Management:**
   * Implemented visibility controls for prompts (public, private, team)
   * Added team-based access control for viewing, editing, and deleting prompts
   * Created a dedicated endpoint for listing team prompts

3. **Comment System with Permissions:**
   * Updated the comment system to respect team membership and roles
   * Allowed team members to comment on any team prompt
   * Implemented permission checks for editing and deleting comments

The backend implementation is now complete and ready for the frontend development phase. The next steps involve updating the user interface to leverage these new APIs and provide a seamless team collaboration experience for users.

## Next Steps

After completing the remaining tasks, we should consider the following future enhancements:

1. **Activity Feed:**
   * Implement a team activity feed showing recent actions
   * Track prompt creation, editing, and comment activities
   * Allow filtering by activity type and user

2. **Team Analytics:**
   * Track team prompt usage and success rates
   * Provide insights on team collaboration efficiency
   * Generate reports for team admins

3. **Advanced Permission System:**
   * Add more granular permission controls
   * Implement custom roles with specific capabilities
   * Allow per-prompt permission overrides

These enhancements will build upon the solid foundation we've established with the MVP implementation. 