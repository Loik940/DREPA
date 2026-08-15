// Schémas Zod des formulaires d’authentification et de changement de mot de passe.
import { z } from 'zod';

// Ces règles Zod normalisent les saisies et limitent leur taille avant toute opération d'authentification.
const email = z.string().trim().toLowerCase().email('Saisissez une adresse e-mail valide.').max(254);
const password = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
  .max(128)
  .regex(/[a-z]/, 'Ajoute au moins une lettre minuscule.')
  .regex(/[A-Z]/, 'Ajoute au moins une lettre majuscule.')
  .regex(/\d/, 'Ajoute au moins un chiffre.');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Saisissez votre mot de passe.').max(128),
});

export const signUpSchema = z
  .object({
    email,
    password,
    passwordConfirmation: z.string(),
  })
  // La confirmation évite d'enregistrer un mot de passe différent de celui voulu par la personne.
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
