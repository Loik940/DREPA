import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const profileSchema = z.object({
  first_name: z.string().trim().min(1, 'Saisissez un prénom ou un pseudonyme.').max(80),
  country: z.string().trim().min(1, 'Saisissez votre pays.').max(80),
  full_name: optionalText(160),
  date_of_birth: optionalText(10),
  drepanocytosis_type: optionalText(80),
  city: optionalText(80),
  blood_group: optionalText(20),
  allergies: optionalText(500),
  care_center: optionalText(160),
  doctor_name: optionalText(160),
  doctor_phone: optionalText(40),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const consentSchema = z.object({
  termsAccepted: z.boolean().refine(Boolean, 'Acceptez les conditions générales.'),
  privacyAccepted: z.boolean().refine(Boolean, 'Acceptez la politique de confidentialité.'),
  communityAccepted: z.boolean().refine(Boolean, 'Acceptez la charte communautaire.'),
});

export type ConsentValues = z.infer<typeof consentSchema>;
