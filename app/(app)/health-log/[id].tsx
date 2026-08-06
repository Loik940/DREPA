// Détail d’une entrée : affiche, modifie ou supprime une entrée appartenant à l’utilisateur courant.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { useDeleteHealthLogMutation } from '@/features/health-log/mutations';
import { getChoiceLabel, hydrationChoices, symptomChoices, triggerChoices } from '@/features/health-log/options';
import { useHealthLogQuery } from '@/features/health-log/queries';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

export default function HealthLogDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const query = useHealthLogQuery(user?.id, id);
  const deleteMutation = useDeleteHealthLogMutation(user?.id, id);

  const confirmDelete = () => {
    Alert.alert(
      'Supprimer cette entrée ?',
      'Cette action est définitive.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            void deleteMutation.mutateAsync().then(() => router.replace('/(app)/(tabs)/journal')).catch(() => undefined);
          },
        },
      ],
    );
  };

  if (query.isPending) return <LoadingState message="Chargement de l’entrée..." />;
  if (query.isError) return <ErrorState description={query.error.message} onRetry={() => void query.refetch()} />;
  if (!query.data) return <ErrorState description="Cette entrée est introuvable." />;

  const entry = query.data;
  const recordedAt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(entry.recorded_at));

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Entrée du journal</AppText>
        <AppText color="textSecondary">{recordedAt}</AppText>
      </View>

      <StatusBanner message="Cette entrée est déclarative et ne constitue pas une interprétation médicale." />

      <Card>
        <View style={styles.section}>
          <DetailRow label="Douleur" value={entry.pain_level === null ? 'Non renseignée' : `${entry.pain_level} / 10`} />
          <DetailRow label="Localisation" value={entry.pain_location ?? 'Non renseignée'} />
          <DetailRow label="Fatigue" value={entry.fatigue_level === null ? 'Non renseignée' : `${entry.fatigue_level} / 10`} />
          <DetailRow label="Hydratation" value={entry.hydration_level ? getChoiceLabel(hydrationChoices, entry.hydration_level) : 'Non renseignée'} />
          <DetailRow label="Température" value={entry.temperature === null ? 'Non renseignée' : `${entry.temperature} °C`} />
          <DetailRow label="Médicaments pris" value={entry.medication_taken === null ? 'Non renseigné' : entry.medication_taken ? 'Oui' : 'Non'} />
        </View>
      </Card>

      <DetailList title="Symptômes déclarés" values={entry.symptoms?.map((value) => getChoiceLabel(symptomChoices, value)) ?? []} />
      <DetailList title="Facteurs possibles" values={entry.possible_triggers?.map((value) => getChoiceLabel(triggerChoices, value)) ?? []} />

      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Notes</AppText>
          <AppText color={entry.notes ? 'textPrimary' : 'textSecondary'}>{entry.notes ?? 'Aucune note renseignée.'}</AppText>
        </View>
      </Card>

      {deleteMutation.isError && <AppText color="sos">{deleteMutation.error.message}</AppText>}
      <Button label="Modifier" onPress={() => router.push({ pathname: '/(app)/health-entry', params: { id } })} />
      <Button label="Supprimer" variant="danger" loading={deleteMutation.isPending} onPress={confirmDelete} />
      <Button label="Retour au journal" variant="ghost" onPress={() => router.replace('/(app)/(tabs)/journal')} />
    </ScreenContainer>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText color="textSecondary">{label}</AppText>
      <AppText style={styles.value}>{value}</AppText>
    </View>
  );
}

function DetailList({ title, values }: { title: string; values: string[] }) {
  return (
    <Card>
      <View style={styles.section}>
        <AppText variant="sectionTitle">{title}</AppText>
        <AppText color={values.length ? 'textPrimary' : 'textSecondary'}>{values.length ? values.join(', ') : 'Aucune information renseignée.'}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  header: { gap: spacing.sm },
  section: { gap: spacing.md },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.lg, justifyContent: 'space-between' },
  value: { flex: 1, textAlign: 'right' },
});
