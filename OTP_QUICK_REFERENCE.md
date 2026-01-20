# 🔐 OTP System - Quick Reference Guide

## URLs Reference

### Registration Flow URLs
| Step | URL | Method | Description |
|------|-----|--------|-------------|
| 1 | `/auth/register` | GET | Registration form page |
| 2 | `/auth/register` | POST | Submit registration (generates OTP) |
| 3 | `/auth/verify-otp` | GET | OTP verification form |
| 4 | `/auth/verify-otp-registration` | POST | Verify OTP for registration |
| 5 | `/dashboard` | GET | Auto-redirect after success |

### Forgot Password Flow URLs
| Step | URL | Method | Description |
|------|-----|--------|-------------|
| 1 | `/auth/forgot-password` | GET | Forgot password form |
| 2 | `/auth/forgot-password` | POST | Request password reset (generates OTP) |
| 3 | `/auth/verify-otp` | GET | OTP verification form |
| 4 | `/auth/verify-otp-reset` | POST | Verify OTP for password reset |
| 5 | `/auth/reset-password` | GET | Password reset form |
| 6 | `/auth/reset-password` | POST | Submit new password |
| 7 | `/auth/login` | GET | Login page (with success message) |

### Additional Endpoints
| URL | Method | Description |
|-----|--------|-------------|
| `/auth/resend-otp` | POST | Resend OTP (JSON API) |
| `/auth/login` | GET | Login form |
| `/auth/login` | POST | Login |
| `/auth/logout` | GET | Logout |

---

## 🎯 Form Parameters

### Registration Form (POST /auth/register)
```
username: string (required)
email: string (required, unique)
password: string (required, min 6 chars)
confirmPassword: string (required, must match password)
fullName: string (optional)
phone: string (optional)
role: string (default: 'user')
```

### OTP Verification (POST /auth/verify-otp-registration)
```
email: string (required)
otp: string (required, 6 digits)
```

### Forgot Password (POST /auth/forgot-password)
```
email: string (required, must exist in database)
```

### OTP Verification for Reset (POST /auth/verify-otp-reset)
```
email: string (required)
otp: string (required, 6 digits)
```

### Reset Password (POST /auth/reset-password)
```
email: string (required)
newPassword: string (required, min 6 chars)
confirmPassword: string (required, must match newPassword)
```

### Resend OTP (POST /auth/resend-otp - JSON)
```json
{
  "email": "user@example.com",
  "type": "registration" or "reset"
}
```

---

## 📊 Response Status Codes

### Success Responses
- **200 OK** - Page rendered successfully
- **302 Found** - Redirect after successful action
- **200 OK + JSON** - JSON response for AJAX requests

### Error Responses
- **400 Bad Request** - Invalid form input
- **401 Unauthorized** - Invalid OTP
- **429 Too Many Requests** - Rate limited
- **500 Internal Server Error** - Database/server error

---

## 🎨 Error Messages

### Validation Errors
```
- "Email already exists"
- "Username already exists"
- "Passwords do not match"
- "Password must be at least 6 characters"
- "Database error"
```

### OTP Errors
```
- "OTP not found or expired"
- "OTP expired"
- "Invalid OTP"
```

### Password Reset Errors
```
- "Session expired. Please register again."
- "Error processing password"
- "Error updating password"
```

---

## 🔄 Session Management

### Session Created At
1. **Registration:** After OTP verification & account creation
2. **Login:** After email/password validation
3. **Reset:** Not created during reset (email stored in session instead)

### Session Destroyed At
1. **Logout:** User clicks logout
2. **Inactivity:** Session timeout (configured in server)
3. **After Reset:** Session cleared and user redirected to login

### Session Variables
```javascript
req.session.user = {
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  role: "user",
  full_name: "John Doe"
}

// During registration (temporary):
req.session.pendingRegistration = { ... }

// During password reset (temporary):
req.session.resetEmail = "john@example.com"
```

---

## 💡 OTP Logic

### Generation
```javascript
OTP = Random number between 100000 and 999999
Example: 654321
```

### Storage
```javascript
otpStore.set(email, {
  otp: "654321",
  expiryTime: Date.now() + 600000  // 10 minutes
})
```

### Verification
1. Check if OTP exists for email
2. Check if not expired
3. Check if OTP matches
4. Delete OTP from storage
5. Return result

### Expiry
```
Valid for: 10 minutes
Auto-deleted: After verification or expiry
```

---

## 🔐 Password Hashing

### Process
```javascript
1. User enters password: "Password123!"
2. Salt rounds: 10
3. Hashed: $2a$10$....(bcryptjs hash)
4. Stored in database
5. On login: bcrypt.compare(userInput, storedHash)
```

### Validation Rules
- Minimum length: 6 characters
- Server-side validation: ✓
- Client-side validation: ✓
- Strength meter: Shows in reset password page

---

## 📱 Mobile Responsiveness

### Breakpoints
- **Desktop:** > 768px (full layout)
- **Tablet:** 481px - 768px (adjusted spacing)
- **Mobile:** < 480px (stacked layout)

### Mobile Features
- Touch-friendly buttons (minimum 44px)
- Large input fields (easy to tap)
- Auto-focus between OTP inputs
- No horizontal scrolling
- Readable font sizes

---

## 🧪 Test Credentials

### For Registration Testing
```
Username: testuser
Email: test@example.com
Password: Test@1234
Full Name: Test User
Phone: 9876543210
```

### OTP (Check Console)
```
Look for: 📧 OTP for test@example.com: XXXXXX
```

### For Login Testing (after registration)
```
Email: test@example.com
Password: Test@1234
```

---

## 📊 Database Impact

### No New Tables Required
Uses existing `users` table only

### Query Used for Password Reset
```sql
UPDATE users SET password = ? WHERE email = ?
```

---

## 🎯 Email Flow (Production Ready)

### Console Output (Development)
```
📧 OTP for user@example.com: 123456
```

### Real Email (Production - Configure in .env)
```
From: noreply@eventpro.com
To: user@example.com
Subject: Your OTP for EventPro
Body: Your OTP is: 123456
      This OTP is valid for 10 minutes.
```

---

## 🔄 State Machine Diagrams

### Registration States
```
[Start] 
  ↓
[Registration Form] → [Validation Failed] → Error
  ↓
[Validation Passed]
  ↓
[OTP Generated & Sent]
  ↓
[Verify OTP Page]
  ↓
[OTP Entry]
  ↓
[OTP Invalid] → Retry
  ↓
[OTP Valid]
  ↓
[Account Created]
  ↓
[Auto Login]
  ↓
[Dashboard]
  ↓
[End]
```

### Password Reset States
```
[Start]
  ↓
[Forgot Password Page]
  ↓
[Email Entry]
  ↓
[OTP Generated & Sent]
  ↓
[Verify OTP Page]
  ↓
[OTP Entry]
  ↓
[OTP Invalid] → Retry
  ↓
[OTP Valid]
  ↓
[Reset Password Page]
  ↓
[Password Entry]
  ↓
[Password Updated in DB]
  ↓
[Redirect to Login]
  ↓
[End]
```

---

## 📈 Metrics to Track

### Registration
- Total registrations
- OTP sent count
- OTP verification failures
- Average registration time

### Password Reset
- Reset requests
- OTP verification failures
- Successful resets
- Average reset time

### Security
- Failed OTP attempts
- Rate-limited requests
- Session timeouts

---

## 🚨 Error Handling

### Client-Side
- Form validation (HTML5)
- Real-time feedback
- Error message display
- Success messages

### Server-Side
- Input validation
- Database error handling
- OTP expiry checking
- Session validation

### User Feedback
- Clear error messages
- Success notifications
- Helpful hints
- Back buttons for recovery

---

## 🎓 Learning Resources

### About OTP
- Two-factor authentication basics
- One-time password generation
- OTP security best practices
- Rate limiting strategies

### About Security
- Password hashing with bcryptjs
- Session management
- CSRF protection
- Input validation

---

## 🔧 Configuration

### File Locations
```
Controllers: /controllers/authController.js
Routes: /routes/auth.js
Views: /views/pages/
  - verify-otp.ejs
  - forgot-password.ejs
  - reset-password.ejs
  - login.ejs (modified)
```

### Default Values
```
OTP Length: 6 digits
OTP Validity: 10 minutes
Resend Delay: 60 seconds
Password Min Length: 6 characters
Login Lock Time: 15 minutes
Max Login Attempts: 5
```

---

## 📞 Quick Help

### How to test OTP?
1. Register or request password reset
2. Check server console for OTP
3. Enter 6-digit code
4. Verify account is created/password reset

### How to resend OTP?
1. Click "Resend OTP" button
2. Wait 60 seconds after resend
3. Check console for new OTP

### How to debug?
1. Check browser console (F12)
2. Check server console for logs
3. Check database for user creation
4. Look for OTP in server output

---

## ✅ Verification Checklist

- [ ] Registration OTP works
- [ ] Password reset OTP works
- [ ] OTP expires correctly
- [ ] Error messages display
- [ ] Resend OTP works
- [ ] Mobile is responsive
- [ ] Database updates correctly
- [ ] Session works properly

---

## 🎉 You're All Set!

Everything is configured and ready to use. Start testing with:

```bash
npm start
```

Then visit: `http://localhost:3000/auth/register`

**Happy Testing! 🚀**
