// Ce composant permet d’ajouter et de retirer des heures de rappel locales.
// Il est utilisé par le formulaire Médicaments sans proposer de saisie au clavier.
// Il reçoit et retourne une liste d’heures HH:MM séparées par des virgules.
// Il ne programme aucune notification et ne conserve aucune donnée sensible.
// Les horaires sont déclarés par l’utilisateur sans conseil de prise ou de dosage.
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { useAppTheme } from '@/theme/use-app-theme';
import { formatLocalTime, parseLocalTime } from '../date-time';
import { parseReminderTimes } from '../schemas';

type ReminderTimesFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
};

export function ReminderTimesField({ label, value, onChange, error, helperText }: ReminderTimesFieldProps) {
  const { colors } = useAppTheme();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState(() => new Date());
  const times = parseReminderTimes(value);

  const openPicker = () => {
    setPickerValue(times.length ? parseLocalTime(times[times.length - 1]) : new Date());
    setIsPickerOpen(true);
  };

  // La liste reste unique et triée afin de garder une valeur stable pour le formulaire.
  const handlePickerChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setIsPickerOpen(false);
    if (event.type !== 'set' || !selectedTime) return;

    const nextTimes = [...new Set([...times, formatLocalTime(selectedTime)])].sort();
    onChange(nextTimes.join(', '));
  };

  const removeTime = (timeToRemove: string) => {
    onChange(times.filter((time) => time !== timeToRemove).join(', '));
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{label}</AppText>
      {times.length ? (
        <View accessibilityLabel="Heures de rappel ajoutées" style={styles.chips}>
          {times.map((time) => (
            <Pressable
              accessibilityHint="Retire cette heure de la liste."
              accessibilityLabel={`Supprimer le rappel de ${time}`}
              accessibilityRole="button"
              key={time}
              onPress={() => removeTime(time)}
              style={({ pressed }) => [styles.chip, { backgroundColor: colors.backgroundMuted, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}
            >
              <AppText variant="label">{time} · Retirer</AppText>
            </Pressable>
          ))}
        </View>
      ) : (
        <AppText color="textSecondary">Aucune heure ajoutée.</AppText>
      )}
      <Button label="Ajouter une heure" onPress={openPicker} variant="secondary" />
      {error ? <AppText variant="caption" color="sos">{error}</AppText> : helperText ? <AppText variant="caption" color="textSecondary">{helperText}</AppText> : null}
      {isPickerOpen ? <DateTimePicker is24Hour mode="time" onChange={handlePickerChange} value={pickerValue} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderRadius: radii.full, borderWidth: 1, justifyContent: 'center', minHeight: sizes.touchTarget, paddingHorizontal: spacing.md },
});
