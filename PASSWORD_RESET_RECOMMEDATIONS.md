# Password Reset Feature - Implementation Recommendations

## Overview
This document provides recommendations for implementing the Password Reset feature for authenticated users in the existing frontend application. The feature will be accessible from the profile icon/dropdown menu and allows users to change their password while logged in.

---

## Integration with Existing Application

### 1. Profile Menu Integration

#### Recommended Location
Add the "Change Password" option to the existing user profile dropdown menu, typically located in the top navigation bar (header).

#### Profile Menu Structure
```
Profile Menu Items:
├── My Profile
├── Change Password ← NEW
├── Settings
├── ─────────────
└── Logout
```

#### Implementation Location
- **Component**: Header/Navigation component (usually `Header.tsx`, `Navbar.tsx`, or `TopBar.tsx`)
- **Integration Point**: User profile dropdown menu
- **Trigger**: Click on profile icon/avatar → select "Change Password"

### 2. User Flow

```
User Flow:
1. User clicks profile icon/avatar in header
2. Dropdown menu appears
3. User clicks "Change Password"
4. Password Reset Dialog opens
5. User enters:
   - Current password
   - New password
   - Confirm new password
6. User clicks "Save Changes"
7. API request is sent
8. On success:
   - Success toast/notification appears
   - Dialog closes
   - Form is reset
9. On error:
   - Error message displays
   - User can correct and retry
```

---

## Component Architecture

### 1. Recommended Component Structure

```
components/
├── profile/
│   ├── profile-menu.tsx           (Profile dropdown menu)
│   ├── password-reset-dialog.tsx  (Password reset form dialog)
│   └── password-strength-indicator.tsx (Optional: password strength meter)
└── ui/                            (shadcn/ui components)
```

### 2. Component Responsibilities

#### ProfileMenu Component
- **Responsibility**: Render profile dropdown menu
- **Location**: Header/Navigation area
- **Features**:
  - User avatar/icon
  - Menu items (Profile, Change Password, Settings, Logout)
  - Opens PasswordResetDialog on "Change Password" click

#### PasswordResetDialog Component
- **Responsibility**: Password reset form in a dialog/modal
- **Features**:
  - Current password input
  - New password input
  - Confirm password input
  - Password visibility toggles
  - Form validation
  - API integration
  - Error handling
  - Success feedback

---

## API Integration

### 1. API Service Structure

#### Recommended Service Structure
```typescript
// services/authService.ts or services/passwordService.ts

interface PasswordResetRequest {
  current_password: string
  new_password: string
}

interface PasswordResetResponse {
  message: string
}

class AuthService {
  /**
   * Reset password for authenticated user
   */
  async resetPassword(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    const token = this.getAuthToken()
    
    const response = await fetch('/api/v1/auth/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to reset password')
    }

    return response.json()
  }

  private getAuthToken(): string {
    // Get token from localStorage, sessionStorage, or auth context
    return localStorage.getItem('token') || 
           sessionStorage.getItem('token') || 
           ''
  }
}

export const authService = new AuthService()
```

### 2. Error Handling Strategy

#### Error Types and Handling

```typescript
interface ApiError {
  detail: string
  status?: number
}

// In your component or service
try {
  await authService.resetPassword({
    current_password: formData.current_password,
    new_password: formData.new_password,
  })
  // Success handling
} catch (error) {
  if (error instanceof Error) {
    // Handle different error types
    if (error.message.includes('incorrect old password')) {
      // Set field error for current_password
      form.setError('current_password', {
        type: 'manual',
        message: 'Current password is incorrect',
      })
    } else if (error.message.includes('Not authenticated')) {
      // Redirect to login
      router.push('/login')
    } else {
      // Show generic error toast
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }
}
```

---

## State Management

### 1. Dialog State

#### Recommended Approach
Use local component state for dialog open/close:

```typescript
const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
```

#### Why Local State?
- Dialog is only relevant to the ProfileMenu component
- No need for global state management
- Simple and maintainable

### 2. Form State

#### Recommended Approach
Use `react-hook-form` with `zod` for validation:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const form = useForm({
  resolver: zodResolver(passwordResetSchema),
  defaultValues: {
    current_password: '',
    new_password: '',
    confirm_password: '',
  },
})
```

---

## User Experience Recommendations

### 1. Password Visibility Toggle

#### Implementation
- Add eye/eye-off icons to password inputs
- Toggle between `type="password"` and `type="text"`
- Provides better UX for password entry

### 2. Password Strength Indicator (Optional)

#### Benefits
- Guides users to create stronger passwords
- Real-time feedback on password quality
- Can be shown below new password field

#### Implementation
- Calculate strength based on:
  - Length (8+ characters)
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters
- Display as progress bar or text indicator

### 3. Success Feedback

#### Recommended Approach
- Show success toast/notification
- Close dialog automatically
- Clear form fields
- Optionally redirect or refresh user data

### 4. Error Feedback

#### Recommended Approach
- Show inline errors for form validation
- Show toast for API errors
- Highlight incorrect fields (e.g., wrong current password)
- Provide actionable error messages

---

## Security Recommendations

### 1. Token Management

#### Best Practices
- Store tokens securely (consider httpOnly cookies if possible)
- Handle token expiration gracefully
- Redirect to login if authentication fails
- Clear tokens on logout

### 2. Password Handling

#### Best Practices
- Never store passwords in component state unnecessarily
- Clear password fields after submission
- Use secure password input types
- Validate passwords client-side but trust server validation

### 3. Rate Limiting Considerations

#### Frontend Considerations
- Disable submit button during API call
- Prevent multiple simultaneous requests
- Show loading state to prevent duplicate submissions

---

## Accessibility Recommendations

### 1. Keyboard Navigation

#### Requirements
- Dialog closes on Escape key
- Tab navigation through form fields
- Enter key submits form
- Focus management (focus first field when dialog opens)

### 2. Screen Reader Support

#### Requirements
- Proper ARIA labels on inputs
- Error messages associated with fields
- Dialog role and aria-describedby
- Status announcements for success/error

### 3. Visual Accessibility

#### Requirements
- Sufficient color contrast
- Clear error indicators
- Visible focus indicators
- Readable font sizes

---

## Performance Optimization

### 1. Code Splitting

#### Recommendation
If the password reset dialog is heavy, consider lazy loading:

```typescript
const PasswordResetDialog = lazy(() => import('./password-reset-dialog'))

// In ProfileMenu
{passwordDialogOpen && (
  <Suspense fallback={<DialogSkeleton />}>
    <PasswordResetDialog
      open={passwordDialogOpen}
      onOpenChange={setPasswordDialogOpen}
    />
  </Suspense>
)}
```

### 2. Form Optimization

#### Recommendations
- Use `react-hook-form` for efficient re-renders
- Validate only on submit or blur (not on every keystroke for better performance)
- Debounce password strength calculations if implemented

---

## Testing Recommendations

### 1. Unit Tests

#### Test Cases
- Form validation logic
- Password strength calculation (if implemented)
- Error handling functions
- Form state management

### 2. Integration Tests

#### Test Cases
- Dialog open/close functionality
- Form submission flow
- API integration (with mocked API)
- Error handling scenarios
- Success flow

### 3. E2E Tests

#### Test Cases
```typescript
describe('Password Reset Flow', () => {
  it('should open password reset dialog from profile menu', () => {
    // Click profile icon
    // Click "Change Password"
    // Verify dialog is visible
  })

  it('should validate password requirements', () => {
    // Fill form with invalid passwords
    // Verify error messages
  })

  it('should reset password successfully', () => {
    // Fill form with valid passwords
    // Submit form
    // Verify success message
    // Verify dialog closes
  })

  it('should handle incorrect current password', () => {
    // Fill form with wrong current password
    // Submit form
    // Verify error message on current_password field
  })

  it('should handle password mismatch', () => {
    // Fill form with mismatched new and confirm passwords
    // Verify validation error
  })
})
```

---

## Internationalization (i18n) Considerations

### 1. Text Content

#### Recommended Approach
If your application supports multiple languages:

```typescript
// Use translation keys
<DialogTitle>{t('password.reset.title')}</DialogTitle>
<FormLabel>{t('password.reset.currentPassword')}</FormLabel>
<FormLabel>{t('password.reset.newPassword')}</FormLabel>
```

### 2. Error Messages

#### Recommended Approach
- Translate error messages
- Use translation keys for validation messages
- Consider locale-specific password requirements

---

## Mobile Responsiveness

### 1. Dialog Sizing

#### Recommendations
- Full-width on mobile devices
- Constrained width on desktop (max-width: 500px)
- Proper padding and spacing

### 2. Touch Targets

#### Recommendations
- Buttons and inputs should be at least 44x44px
- Adequate spacing between interactive elements
- Password visibility toggles should be easily tappable

---

## Integration Checklist

### Pre-Implementation
- [ ] Review existing profile menu implementation
- [ ] Identify header/navigation component location
- [ ] Check existing authentication token storage
- [ ] Verify API endpoint is accessible
- [ ] Review existing form validation patterns
- [ ] Check existing toast/notification system

### Implementation
- [ ] Install required shadcn/ui components
- [ ] Install react-hook-form and zod
- [ ] Create PasswordResetDialog component
- [ ] Integrate into ProfileMenu component
- [ ] Set up API service/integration
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Add success/error feedback
- [ ] Test on desktop browsers
- [ ] Test on mobile devices
- [ ] Test accessibility
- [ ] Test error scenarios

### Post-Implementation
- [ ] Code review
- [ ] User acceptance testing
- [ ] Documentation updates
- [ ] Update design system (if applicable)
- [ ] Monitor error logs
- [ ] Gather user feedback

---

## Troubleshooting Common Issues

### 1. Authentication Errors

#### Issue: "Not authenticated" error
**Solution**: 
- Check token storage location
- Verify token is included in Authorization header
- Check token expiration
- Redirect to login if token is invalid

### 2. CORS Issues

#### Issue: CORS errors when calling API
**Solution**:
- Verify API base URL is correct
- Check CORS configuration on backend
- Ensure credentials are included if using cookies

### 3. Form Validation Issues

#### Issue: Validation not working
**Solution**:
- Verify zod schema is correctly defined
- Check react-hook-form setup
- Ensure form fields are properly registered
- Check browser console for validation errors

### 4. Dialog Not Opening/Closing

#### Issue: Dialog state not updating
**Solution**:
- Verify state management is correct
- Check Dialog component props (open, onOpenChange)
- Ensure event handlers are properly bound
- Check for conflicting state updates

---

## Future Enhancements

### 1. Password Requirements

#### Potential Enhancements
- Configurable password requirements from backend
- Password history (prevent reusing recent passwords)
- Password expiration reminders

### 2. Two-Factor Authentication

#### Potential Integration
- Require 2FA code for password changes
- SMS or email verification step
- Security question verification

### 3. Password Strength Meter

#### Enhanced Implementation
- Real-time password strength calculation
- Visual progress indicator
- Suggestions for stronger passwords
- Integration with backend password policy

### 4. Activity Logging

#### Security Enhancement
- Log password change events
- Email notification on password change
- Session management after password change

---

## Related Documentation

- **API Documentation**: `PASSWORD_RESET_API_ROUTES.md`
- **UI Specifications**: `PASSWORD_RESET_UI_SPECIFICATIONS.md`
- **Authentication Flow**: Review existing auth documentation
- **Profile Management**: Review existing profile/user management features

---

## Support and Questions

For implementation questions or issues:
1. Review the API documentation for endpoint details
2. Check UI specifications for component structure
3. Review existing codebase patterns for consistency
4. Consult with backend team for API concerns
5. Consult with design team for UI/UX questions

