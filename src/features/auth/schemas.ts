// Schémas Zod des formulaires d’authentification et de changement de mot de passe.
import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Saisissez une adresse e-mail valide.').max(254);
const password = z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.').max(128);

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Saisissez votre mot de passe.'),
});

export const signUpSchema = z
  .object({
    email,
    password,
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Les mots de passe doivent être identiques.',
  });

export const passwordResetRequestSchema = z.object({ email });

export const updatePasswordSchema = z
  .object({
    password,
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Les mots de passe doivent être identiques.',
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type PasswordResetRequestValues = z.infer<typeof passwordResetRequestSchema>;
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
