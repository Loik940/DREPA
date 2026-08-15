// Schémas Zod des champs de profil et des trois consentements obligatoires.
import { z } from 'zod';

// La validation Zod nettoie les textes et borne leur longueur sans interpréter les informations médicales déclarées.
const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalDate = z.string().trim().max(10).refine((value) => {
  if (!value) return true;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1])
    && date.getMonth() === Number(match[2]) - 1
    && date.getDate() === Number(match[3])
    && date <= new Date();
}, 'Saisissez une date valide au format AAAA-MM-JJ.').optional();

export const profileSchema = z.object({
  first_name: z.string().trim().min(1, 'Saisissez un prénom ou un pseudonyme.').max(80),
  country: z.string().trim().min(1, 'Saisissez votre pays.').max(80),
  full_name: optionalText(160),
  date_of_birth: optionalDate,
  drepanocytosis_type: optionalText(80),
  city: optionalText(80),
  blood_group: optionalText(20),
  allergies: optionalText(500),
  care_center: optionalText(160),
  doctor_name: optionalText(160),
  doctor_phone: optionalText(40),
});

export type ProfileValues = z.infer<typeof profileSchema>;

// Les trois accords sont obligatoires et sont validés ensemble avant l'enregistrement du consentement.
export const consentSchema = z.object({
  termsAccepted: z.boolean().refine(Boolean, 'Acceptez les conditions générales.'),
  privacyAccepted: z.boolean().refine(Boolean, 'Acceptez la politique de confidentialité.'),
  communityAccepted: z.boolean().refine(Boolean, 'Acceptez la charte communautaire.'),
});

export type ConsentValues = z.infer<typeof consentSchema>;
