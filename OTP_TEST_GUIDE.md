# OTP System - Quick Test Guide

## 🚀 Quick Start Testing

### Test OTP Registration

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Navigate to registration:**
   - Go to: `http://localhost:3000/auth/register`

3. **Fill the registration form:**
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Password123!`
   - Confirm Password: `Password123!`
   - Full Name: `Test User`
   - Phone: `1234567890`

4. **Check console for OTP:**
   - Look at terminal/console where server is running
   - You'll see: `📧 OTP for test@example.com: XXXXXX` (6 digits)

5. **Enter OTP:**
   - Copy the 6-digit OTP from console
   - Enter it in the OTP verification page (one digit per box)
   - OTP boxes auto-advance as you type

6. **Account Created!**
   - You'll be automatically logged in
   - Redirected to dashboard

---

### Test Forgot Password

1. **Go to login page:**
   - `http://localhost:3000/auth/login`

2. **Click "Forgot Password?"**
   - Go to: `http://localhost:3000/auth/forgot-password`

3. **Enter email:**
   - Use an existing user's email (e.g., `test@example.com`)

4. **Check console for OTP:**
   - Terminal shows: `📧 OTP for test@example.com: XXXXXX`

5. **Enter OTP:**
   - Enter the 6-digit code from console

6. **Reset Password:**
   - Enter new password: `NewPassword123!`
   - Confirm: `NewPassword123!`
   - See password strength indicator (should be green for strong)

7. **Password Updated!**
   - Redirected to login
   - Test login with new password

---

## 📋 Test Cases Checklist

### Registration Flow
- [ ] Register with valid data
- [ ] OTP appears in console
- [ ] OTP verification page loads
- [ ] Can enter 6-digit OTP
- [ ] Account created and logged in
- [ ] Error when OTP is wrong
- [ ] Can resend OTP (60-second delay)
- [ ] Email validation works
- [ ] Duplicate email shows error
- [ ] Password validation (min 6 chars)
- [ ] Passwords match validation

### Forgot Password Flow
- [ ] Go to forgot password page
- [ ] Enter valid email
- [ ] OTP sent (shown in console)
- [ ] OTP verification page loads
- [ ] Enter correct OTP
- [ ] Reset password page loads
- [ ] Password strength meter works
- [ ] Can enter new password
- [ ] Passwords match validation
- [ ] Password updated successfully
- [ ] Can login with new password
- [ ] Invalid OTP shows error
- [ ] Expired OTP shows error

### OTP Features
- [ ] OTP is 6 digits
- [ ] Auto-focus between input boxes
- [ ] Resend OTP button works
- [ ] 60-second timer on resend
- [ ] OTP expires after 10 minutes
- [ ] Email display shows correct email
- [ ] Back button works
- [ ] Responsive on mobile

### Edge Cases
- [ ] Non-existent email on forgot password
- [ ] Multiple OTP requests
- [ ] Entering OTP too slowly (after expiry)
- [ ] Refreshing page during OTP process
- [ ] Invalid email format
- [ ] Empty form fields
- [ ] Special characters in password

---

## 🐛 Debugging

### Check Console Output
```
✓ Server running on port 3000
📧 OTP for user@example.com: 123456
```

### Check Browser Console
- F12 → Console tab
- Look for any JavaScript errors
- Network tab to see API calls

### Common Issues

**Issue:** OTP not showing
- **Solution:** Check server console (not browser console)
- **Location:** Terminal where `npm start` runs

**Issue:** Session expired
- **Solution:** OTP valid for 10 minutes, registration flow valid for session duration
- **Action:** Start over from registration/forgot password

**Issue:** Can't enter OTP
- **Solution:** Make sure inputs are empty before typing
- **Tip:** Only numeric input accepted

**Issue:** Password reset not working
- **Solution:** Check if `req.session.resetEmail` exists
- **Action:** Go back to forgot password page

---

## 📊 OTP Test Values

Use these for quick testing:

| Field | Value |
|-------|-------|
| Username | `testuser123` |
| Email | `test@example.com` |
| Password | `Test@1234` |
| Phone | `9876543210` |
| Full Name | `Test User` |

---

## 🔍 Verification Points

### After Registration
```
✓ User created in database
✓ Session contains user data
✓ Redirected to /dashboard
✓ User profile shows correct info
✓ Can access protected routes
```

### After Password Reset
```
✓ Password updated in database
✓ Old password doesn't work
✓ New password works
✓ Can login successfully
✓ Session starts fresh
```

---

## 📱 Mobile Testing

1. **Resize browser:**
   - F12 → Toggle device toolbar
   - Select iPhone/Android device

2. **Test OTP inputs:**
   - Should be touch-friendly
   - Font size readable
   - Buttons clickable
   - Auto-advance works on mobile keyboard

3. **Test responsiveness:**
   - All forms visible
   - No horizontal scroll
   - Readable on small screens

---

## 🎯 Expected Behavior

### During Registration
```
User Input → Validation → OTP Generated → Email Sent → Verify Page
    ↓
OTP Entry → Validation → Account Created → Auto Login → Dashboard
```

### During Password Reset
```
Email Input → Validation → OTP Generated → Email Sent → Verify Page
    ↓
OTP Entry → Validation → Reset Page → Password Update → Login
```

---

## 💡 Pro Tips

1. **Speed up testing:**
   - Copy OTP directly from console
   - Paste all 6 digits quickly
   - Use Resend for fresh OTP

2. **Debug OTP storage:**
   - Set breakpoint in verifyOTP method
   - Check otpStore.get(email)
   - Verify expiry time calculation

3. **Test edge cases:**
   - Wait 10 minutes for OTP expiry
   - Enter wrong OTP multiple times
   - Send multiple resend requests
   - Test concurrent registrations

---

## ✅ Success Criteria

All tests pass when:
- ✓ OTP generates and displays
- ✓ User can enter all 6 digits
- ✓ OTP verification works
- ✓ Account creation succeeds
- ✓ User can login with new password
- ✓ Password reset works
- ✓ UI is responsive
- ✓ Error messages display correctly

---

## 🎉 Ready to Test!

Everything is set up. Start your server and test the OTP flow!

```bash
npm start
# Then visit http://localhost:3000/auth/register
```

Enjoy testing the new OTP authentication system! 🔐
