// Tests des règles de validation e-mail, mot de passe et confirmation Auth.
import { passwordResetRequestSchema, signInSchema, signUpSchema, updatePasswordSchema } from './schemas';

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
