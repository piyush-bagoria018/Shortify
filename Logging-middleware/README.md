# Simple Logging Middleware

A basic logging system that sends logs to a server API. Perfect for learning backend development!

## What it does

- ✅ Logs messages to console and remote server
- ✅ Tracks HTTP requests and responses  
- ✅ Handles errors properly
- ✅ Hides sensitive data like passwords

## How to use

### 1. Install the package
```bash
npm install node-fetch
```

### 2. Basic logging
```javascript
import logger from './utils/logger.js';

// Log different types of messages
logger.info('controller', 'User signed up successfully');
logger.error('db', 'Could not connect to database');
logger.warn('auth', 'Invalid login attempt');
```

### 3. Add to Express app
```javascript
import { requestLogger, errorHandler } from './middleware/logging.js';

// Add request logging
app.use(requestLogger);

// Your routes go here
app.use('/api/users', userRoutes);

// Add error handling (must be last)
app.use(errorHandler);
```

### 4. Log database operations
```javascript
import { logDatabase } from './middleware/logging.js';

// Log successful database operations
logDatabase('create', 'users', { email: 'user@example.com' });

// Log database errors
logDatabase('update', 'users', null, new Error('Connection failed'));
```

### 5. Log authentication events
```javascript
import { logAuth } from './middleware/logging.js';

// Log successful login
logAuth('login', 'user@example.com', true);

// Log failed login
logAuth('login', 'user@example.com', false, 'Wrong password');
```

## Valid log types

**Levels:** debug, info, warn, error, fatal

**Components:**
- Backend: controller, db, service, handler, route, auth, middleware, utils
- Frontend: api, auth, middleware, utils

## Example output

```
[2024-01-15T10:30:00.123Z] BACKEND/controller: User registration started
[2024-01-15T10:30:00.456Z] BACKEND/db: User created successfully
✓ Log sent to server: abc123-def456-789
```

That's it! Simple logging for your backend application.