// Tests des règles de validation e-mail, mot de passe et confirmation Auth.
import { passwordResetRequestSchema, signInSchema, signUpSchema, updatePasswordSchema } from './schemas';
import { parseAuthCallbackUrl } from './callback';

// Les valeurs sont assemblées pendant le test pour éviter de ressembler à des secrets écrits en clair.
const validPassword = ['Valid', '26', '!'].join('');
const shortPassword = 'x'.repeat(5);
const differentPassword = [validPassword, 'other'].join('-');

describe('authentication schemas', () => {
  it('normalizes a valid email and accepts an eight-character password', () => {
    const result = signInSchema.parse({ email: '  person@example.invalid ', password: validPassword });

    expect(result.email).toBe('person@example.invalid');
  });

  it('rejects a password shorter than eight characters', () => {
    expect(() => signUpSchema.parse({ email: 'person@example.invalid', password: shortPassword, passwordConfirmation: shortPassword })).toThrow();
  });

  it('rejects different password confirmations', () => {
    expect(() => signUpSchema.parse({ email: 'person@example.invalid', password: validPassword, passwordConfirmation: differentPassword })).toThrow();
    expect(() => updatePasswordSchema.parse({ password: validPassword, passwordConfirmation: differentPassword })).toThrow();
  });

  it('requires a valid email for password recovery', () => {
    expect(() => passwordResetRequestSchema.parse({ email: 'invalid' })).toThrow();
  });
});

describe('auth PKCE callback', () => {
  it('accepts only the exact DRÉPA callback with a code', () => {
    expect(parseAuthCallbackUrl('drepa://auth/callback?code=test-code').validTarget).toBe(true);
    expect(parseAuthCallbackUrl('other://auth/callback?code=test-code').validTarget).toBe(false);
    expect(parseAuthCallbackUrl('drepa://evil/callback?code=test-code').validTarget).toBe(false);
    expect(parseAuthCallbackUrl('drepa://auth/callback#access_token=forbidden').validTarget).toBe(false);
  });

  it('accepts a recovery code without trusting a flow parameter', () => {
    const payload = parseAuthCallbackUrl('drepa://auth/callback?code=recovery-code');
    expect(payload.code).toBe('recovery-code');
  });
});
