// Tests des règles de validation e-mail, mot de passe et confirmation Auth.
import { passwordResetRequestSchema, signInSchema, signUpSchema, updatePasswordSchema } from './schemas';

describe('authentication schemas', () => {
  it('normalizes a valid email and accepts an eight-character password', () => {
    const result = signInSchema.parse({ email: '  person@example.invalid ', password: 'password' });

    expect(result.email).toBe('person@example.invalid');
  });

  it('rejects a password shorter than eight characters', () => {
    expect(() => signUpSchema.parse({ email: 'person@example.invalid', password: 'short', passwordConfirmation: 'short' })).toThrow();
  });

  it('rejects different password confirmations', () => {
    expect(() => signUpSchema.parse({ email: 'person@example.invalid', password: 'password', passwordConfirmation: 'different' })).toThrow();
    expect(() => updatePasswordSchema.parse({ password: 'password', passwordConfirmation: 'different' })).toThrow();
  });

  it('requires a valid email for password recovery', () => {
    expect(() => passwordResetRequestSchema.parse({ email: 'invalid' })).toThrow();
  });
});
