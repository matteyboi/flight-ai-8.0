# Placeholder for React frontend
# Run: npx create-react-app .
# Add components for syllabus, lesson generation, and progress tracking


## Features
- Modern UI with responsive layout and accessible navigation
- Avatar upload and profile display
- Lesson history tracking with notes and task restoration
- Error boundaries for user-friendly error handling
- Keyboard and screen reader accessibility (aria-labels, tabIndex, focus styles)

## Running the App
A minimal React + Vite scaffold is available at `frontend/react-app`. To run it:

```bash
cd frontend/react-app
npm install
npm run dev
```

Set `VITE_API_BASE` in a `.env` file in `frontend/react-app` if your backend runs at a non-default URL.

## Troubleshooting
- If panels fail to load, error boundaries will display a user-friendly message.
- For accessibility, all interactive elements are keyboard navigable and labeled.
- For layout issues, check styles.css for responsive media queries.

## Contributing
- Refactor inline styles to CSS classes for maintainability.
- Add accessibility improvements (aria-labels, tabIndex, focus styles).
- Use error boundaries for robust error handling.
