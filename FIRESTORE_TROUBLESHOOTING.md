# Firestore Connection Troubleshooting

## Current Issue: 400 Bad Request Errors

You're experiencing `400 (Bad Request)` errors when trying to connect to Firestore. This is most commonly caused by **Firestore Security Rules** blocking access.

## Most Likely Cause: Firestore Security Rules

The error messages show that Firestore is rejecting the connection attempts. This typically happens when:

1. **Security Rules are too restrictive** - The default rules might not allow read/write access
2. **Rules require authentication** - But authentication isn't properly configured
3. **API Key restrictions** - The Firebase API key has HTTP referrer restrictions

## How to Fix

### Step 1: Check Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **financeiro-mhf**
3. Navigate to **Firestore Database** → **Rules** tab
4. Check your current rules

### Step 2: Update Security Rules

For **development/testing**, use these rules (WARNING: These allow all authenticated users to read/write):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write all documents
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For **production**, use more specific rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }

    // Allow authenticated users to read and write categories
    match /categories/{categoryId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Check API Key Restrictions

1. In Firebase Console, go to **Project Settings** (gear icon) → **General** tab
2. Scroll down to **Your apps** section
3. Find the Web App configuration
4. Click on **SDK setup and configuration**
5. Go to Google Cloud Console → **APIs & Services** → **Credentials**
6. Find your **Browser key (or API key)**
7. Check **Application restrictions**:
   - If set to "HTTP referrers", make sure your development domain is listed (e.g., `localhost:*`, `127.0.0.1:*`)
   - For development, you can temporarily set to "None" (not recommended for production)

### Step 4: Verify Authentication is Working

Check the browser console for logs like:
```
[Firestore] Setting up listeners for authenticated user: <user-id>
```

If you don't see this log, authentication might not be working properly.

### Step 5: Check Firestore Database Exists

1. In Firebase Console, go to **Firestore Database**
2. Verify that the database exists and is in **Native mode** (not Datastore mode)
3. Create the database if it doesn't exist:
   - Click **Create database**
   - Choose **Start in production mode** (you'll update rules after)
   - Select a location (e.g., `us-central`)

### Step 6: Create Initial Collections

If the database is empty, create these collections manually:
1. **transactions** - Add a test document
2. **categories** - Add a test document

Example category document:
```json
{
  "name": "Alimentação",
  "type": "expense"
}
```

## Testing the Fix

After making changes:

1. **Clear browser cache** and reload
2. **Check browser console** for:
   - `[Firestore] Setting up listeners` - Connection attempt
   - `[Firestore] Transactions loaded: X` - Success!
   - Any error codes (permission-denied, unavailable, etc.)

## Common Error Codes

- `permission-denied` → Security rules blocking access
- `unavailable` → Network or server issues
- `unauthenticated` → User not logged in properly
- `not-found` → Collection or database doesn't exist

## Still Having Issues?

1. Check browser console for detailed error messages
2. Verify Firebase project billing is enabled (required for Firestore)
3. Check Firebase Status page: https://status.firebase.google.com/
4. Review authentication flow - make sure users can log in

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Quickstart Guide](https://firebase.google.com/docs/firestore/quickstart)
- [Common Firestore Errors](https://firebase.google.com/docs/reference/js/firestore_#firestoreerrorcode)
