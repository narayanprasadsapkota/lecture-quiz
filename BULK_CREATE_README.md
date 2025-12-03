# Bulk Quiz Creation

## Overview

The bulk quiz creation feature allows you to create an entire quiz with all questions in a single API call by pasting JSON data.

## Accessing the Feature

1. Log in to the application
2. Click the **"Bulk Create"** button (purple button) on the home page
3. Paste your quiz JSON in the textarea
4. Click **"Create Quiz"**

## API Endpoint

**URL:** `/api/quizzes/bulk`  
**Method:** `POST`  
**Content-Type:** `application/json`

## JSON Format

```json
{
  "title": "Quiz Title (Required)",
  "description": "Quiz description (Optional)",
  "questions": [
    {
      "text": "Question text (Required)",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1 (Must match one of the options)",
      "explanation": "Explanation for the answer (Required)"
    }
  ]
}
```

## Validation Rules

### Quiz Level

- `title` is required
- `description` is optional
- At least one question is required

### Question Level

Each question must have:

- `text`: Question text (required)
- `options`: Array of exactly 4 options (required)
- `correctAnswer`: Must exactly match one of the options (required)
- `explanation`: Answer explanation (required)

## Example

```json
{
  "title": "OS: Function of Operating System",
  "description": "Quiz about operating system functions",
  "questions": [
    {
      "text": "What is the primary function of an operating system?",
      "options": [
        "Managing hardware resources",
        "Creating documents",
        "Browsing the internet",
        "Playing games"
      ],
      "correctAnswer": "Managing hardware resources",
      "explanation": "The OS manages hardware resources like CPU, memory, and devices."
    },
    {
      "text": "Which is NOT a type of operating system?",
      "options": [
        "Real-time OS",
        "Network OS",
        "Distributed OS",
        "Database OS"
      ],
      "correctAnswer": "Database OS",
      "explanation": "Database OS is not a type of operating system; databases are applications."
    }
  ]
}
```

## Error Handling

The API will return appropriate error messages if:

- JSON is malformed
- Required fields are missing
- Questions don't have exactly 4 options
- `correctAnswer` doesn't match any of the options
- Any validation rule is violated

## Response

### Success (201 Created)

```json
{
  "quiz": {
    "id": 1,
    "title": "OS: Function of Operating System",
    "description": "Quiz about operating system functions",
    "userId": 1,
    "createdAt": "2025-12-03T13:00:00.000Z"
  },
  "questions": [
    {
      "id": 1,
      "quizId": 1,
      "text": "What is the primary function of an operating system?",
      "options": [...],
      "correctAnswer": "Managing hardware resources",
      "explanation": "The OS manages hardware resources...",
      "createdAt": "2025-12-03T13:00:00.000Z"
    }
  ],
  "message": "Quiz created successfully with 2 questions"
}
```

### Error (400/500)

```json
{
  "error": "Error message describing what went wrong"
}
```

## Tips

- Use the "Load Example" button to see a properly formatted JSON
- Validate your JSON before submitting (the form will show syntax errors)
- Make sure `correctAnswer` exactly matches one of the options
- All questions must have exactly 4 options
