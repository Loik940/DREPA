// Normalisation pure du payload Journal avant son envoi à Supabase.
import type { HealthLogValues } from './schemas';

function optionalValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function buildHealthLogPayload(values: HealthLogValues) {
  const normalizedTemperature = values.temperature.trim().replace(',', '.');
  return {
    pain_level: values.pain_level,
    pain_location: optionalValue(values.pain_location),
    temperature: normalizedTemperature ? Number(normalizedTemperature) : null,
    hydration_level: values.hydration_level,
    fatigue_level: values.fatigue_level,
    symptoms: values.symptoms.length ? values.symptoms : null,
    possible_triggers: values.possible_triggers.length ? values.possible_triggers : null,
    medication_taken: values.medication_taken,
    notes: optionalValue(values.notes),
    ...(values.recorded_at ? { recorded_at: values.recorded_at } : {}),
  };
}
