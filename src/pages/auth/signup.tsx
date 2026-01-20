import { useState, FormEvent } from 'react';
import { signupWithInvitation, validateInvitationCode } from '@/lib/supabase';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  invitationCode?: string;
  general?: string;
}

export default function InvitationSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!invitationCode) {
      newErrors.invitationCode = 'Invitation code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCodeBlur = async () => {
    if (!invitationCode) return;

    const result = await validateInvitationCode(invitationCode);
    setIsCodeValid(result.success);
    if (!result.success) {
      setErrors(prev => ({ ...prev, invitationCode: result.error }));
    } else {
      setErrors(prev => ({ ...prev, invitationCode: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signupWithInvitation({
        email,
        password,
        invitationCode,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-card success">
          <h1>Account Created!</h1>
          <p>Please check your email to verify your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Join the Game</h1>
        <p className="subtitle">Invitation-only access</p>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-banner">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="invitationCode">Invitation Code</label>
            <input
              id="invitationCode"
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
              onBlur={handleCodeBlur}
              placeholder="XXXX-XXXX-XXXX"
              className={isCodeValid === true ? 'valid' : isCodeValid === false ? 'invalid' : ''}
              disabled={isLoading}
            />
            {errors.invitationCode && (
              <span className="error">{errors.invitationCode}</span>
            )}
            {isCodeValid && (
              <span className="success-text">Valid invitation code</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              disabled={isLoading}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" disabled={isLoading || isCodeValid === false}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="footer-text">
          Already have an account? <a href="/auth/login">Sign in</a>
        </p>
      </div>

      <style jsx>{`
        .signup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }

        .signup-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .signup-card.success {
          text-align: center;
        }

        h1 {
          color: #fff;
          margin: 0 0 8px;
          font-size: 28px;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 32px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
          font-size: 14px;
        }

        input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 16px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        input:focus {
          outline: none;
          border-color: #6366f1;
        }

        input.valid {
          border-color: #22c55e;
        }

        input.invalid {
          border-color: #ef4444;
        }

        input:disabled {
          opacity: 0.6;
        }

        .error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .success-text {
          color: #22c55e;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }

        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .footer-text {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 24px;
          font-size: 14px;
        }

        .footer-text a {
          color: #6366f1;
          text-decoration: none;
        }

        .footer-text a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
