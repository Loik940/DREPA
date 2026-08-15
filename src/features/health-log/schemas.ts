// Schéma Zod d’une entrée Journal partielle, avec date contrôlée et champs médicaux déclaratifs.
import { z } from 'zod';

// Contrats Zod : ils contrôlent la forme des données déclarées, sans valider ni interpréter leur sens médical.
const optionalText = (max: number) => z.string().trim().max(max, `Maximum ${max} caractères.`).optional();

export const healthLogSchema = z.object({
  pain_level: z.number().int().min(0).max(10).nullable(),
  pain_location: optionalText(120),
  temperature: z
    .string()
    .trim()
    .max(5)
    .refine((value) => value === '' || /^\d{1,2}([.,]\d)?$/.test(value), 'Saisis une température valide.')
    .refine((value) => {
      if (!value) return true;
      const temperature = Number(value.replace(',', '.'));
      return temperature >= 25 && temperature <= 45;
    }, 'La température déclarée doit être comprise entre 25 et 45 °C.'),
  hydration_level: z.enum(['low', 'medium', 'good']).nullable(),
  fatigue_level: z.number().int().min(0).max(10).nullable(),
  symptoms: z.array(z.string().min(1).max(80)).max(12),
  possible_triggers: z.array(z.string().min(1).max(80)).max(12),
  medication_taken: z.boolean().nullable(),
  notes: optionalText(2000),
  recorded_at: z
    .string()
    .datetime({ offset: true })
    .optional()
    .refine((value) => !value || new Date(value).getTime() <= Date.now(), 'La date ne peut pas être dans le futur.'),
});

export type HealthLogValues = z.infer<typeof healthLogSchema>;

export const healthLogDefaults: HealthLogValues = {
  pain_level: null,
  pain_location: '',
  temperature: '',
  hydration_level: null,
  fatigue_level: null,
  symptoms: [],
  possible_triggers: [],
  medication_taken: null,
  notes: '',
};
