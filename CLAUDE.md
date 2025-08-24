# Project Overview
This document outlines the complete architectural design for the Classified Ads Platform built with Laravel + React.js. The architecture is designed to be robust, scalable, and maintainable, following modern best practices while adhering to the specified technology stack. The platform is a web-based application with a decoupled frontend and backend, communicating via a RESTful API.

# Development Principles for React.js
- **Component-based architecture:** Design and implement features as reusable React components.
- **Concurrent rendering:** Leverage React's concurrent features for efficient UI updates.
- **State management:** Utilize React's built-in state management (useState, useContext) or Redux for more complex state.
- **Code style:** Adhere to ES Modules (import/export) and destructure imports.
- **Testing:** Prioritize unit and integration tests for key components and functionalities.

## Workflow Guidelines
- **Batch component creation:** When creating multiple related components, aim to do so in a single interaction with Claude.
- **Concurrent operations:** For operations like state setup or testing, ensure all related tasks are batched and executed concurrently.
- **Typechecking:** Run typechecks (e.g., `npx tsc --noEmit --skipLibCheck`) after significant code changes.
- **Performance:** Focus on optimizing React components and avoiding unnecessary re-renders.

## Specific Instructions for Claude
- **Component Creation:** When asked to create a new component, provide both the JSX and any associated styling or logic within a single response.
- **Feature Implementation:** Break down complex features into smaller, manageable sub-tasks and address them sequentially.
- **Debugging:** When encountering issues, prioritize providing clear error messages and relevant code snippets for faster resolution.

## Dependencies
- React
- Vite
- TailwindCSS
- Shadcn UI (for UI components like Card, Button, Input)
- Lucide React (for icons)
- Chart.js (for visualizations, if applicable)


# Development Principles for Laravel
## Coding Standards
- Adhere to PSR-2 and PSR-4 coding standards.
- Use meaningful variable and function names.
- Write clear and concise comments where necessary.
- Ensure all code is properly formatted (e.g., using Laravel Pint).

## Development Workflow
- Features should be developed on separate branches.
- Use `php artisan` commands for common tasks like migrations, seeding, and route listing.
- Run tests regularly to ensure code quality and prevent regressions.

## Specific Instructions for Claude
- When building new features, prioritize creating modular components within `app/Features/`.
- When refactoring, aim to improve code readability and maintainability without introducing breaking changes.
- Before making significant changes, always consider the impact on existing functionality and potential backward compatibility issues.
- If a task involves database interaction, remember to consider migrations and seeding.
- When asked to fix a bug, analyze the error logs and relevant code to identify the root cause before implementing a solution.
- Do not modify `.env` or production configuration files unless explicitly instructed and with extreme caution.
- When running `Bash` commands, always specify the full path to `php artisan` or `composer` if not already in the project root.