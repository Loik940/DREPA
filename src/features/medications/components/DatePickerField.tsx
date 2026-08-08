// Ce composant affiche un champ de date cohérent avec le design system DRÉPA.
// Il est utilisé par le formulaire Médicaments pour choisir une date sans clavier.
// Il reçoit et retourne uniquement une date locale sous la forme AAAA-MM-JJ.
// Il ne stocke aucune donnée, ne fait aucun appel réseau et n’expose aucun secret.
// Il facilite l’organisation d’un traitement sans fournir de conseil ou de décision médicale.
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { useAppTheme } from '@/theme/use-app-theme';
import { formatLocalDate, parseLocalDate } from '../date-time';

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minimumDate?: string;
  allowClear?: boolean;
  error?: string;
  helperText?: string;
};

const frenchDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function DatePickerField({ label, value, onChange, minimumDate, allowClear = false, error, helperText }: DatePickerFieldProps) {
  const { colors } = useAppTheme();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerValue = value ? parseLocalDate(value) : minimumDate ? parseLocalDate(minimumDate) : new Date();
  const displayedValue = value ? frenchDateFormatter.format(parseLocalDate(value)) : 'Sélectionner une date';

  // Android envoie aussi un événement quand la boîte est fermée sans sélection.
  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setIsPickerOpen(false);
    if (event.type === 'set' && selectedDate) onChange(formatLocalDate(selectedDate));
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{label}</AppText>
      <Pressable
        accessibilityHint="Ouvre le calendrier sans afficher le clavier."
        accessibilityLabel={`${label}, ${displayedValue}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: isPickerOpen }}
        onPress={() => setIsPickerOpen(true)}
        style={({ pressed }) => [
          styles.field,
          { backgroundColor: colors.backgroundSurface, borderColor: error ? colors.sos : colors.border, opacity: pressed ? 0.82 : 1 },
        ]}
      >
        <AppText color={value ? 'textPrimary' : 'textSecondary'}>{displayedValue}</AppText>
      </Pressable>
      {allowClear && value ? <Button accessibilityLabel={`Effacer ${label.toLowerCase()}`} label="Effacer" onPress={() => onChange('')} variant="ghost" style={styles.clearButton} /> : null}
      {error ? <AppText variant="caption" color="sos">{error}</AppText> : helperText ? <AppText variant="caption" color="textSecondary">{helperText}</AppText> : null}
      {isPickerOpen ? (
        <DateTimePicker
          display="calendar"
          minimumDate={minimumDate ? parseLocalDate(minimumDate) : undefined}
          mode="date"
          onChange={handlePickerChange}
          value={pickerValue}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  field: { borderRadius: radii.md, borderWidth: 1, justifyContent: 'center', minHeight: sizes.inputHeight, paddingHorizontal: spacing.lg },
  clearButton: { alignSelf: 'flex-start', minHeight: sizes.touchTarget, paddingHorizontal: spacing.md },
});
