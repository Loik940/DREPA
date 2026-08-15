// Cet écran affiche le détail privé d’un traitement déclaré par l’utilisateur.
// Il charge le traitement avec son identifiant, user_id et la protection RLS.
// Il permet de modifier, arrêter, réactiver ou supprimer ce traitement.
// Les actions destructives demandent une confirmation avant toute écriture.
// Il restitue les données saisies sans recommandation ni interprétation médicale.
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { parseLocalDate } from '@/features/medications/date-time';
import { MedicationDataError } from '@/features/medications/errors';
import { useDeleteMedicationMutation, useSetMedicationActiveMutation } from '@/features/medications/mutations';
import { useMedicationDetailQuery } from '@/features/medications/queries';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

export default function MedicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const query = useMedicationDetailQuery(user?.id, id);
  const activeMutation = useSetMedicationActiveMutation(user?.id, id);
  const deleteMutation = useDeleteMedicationMutation(user?.id, id);
  const actionLockRef = useRef(false);

  // Le verrou partagé refuse une seconde action avant que React actualise les états de chargement.
  const handleMedicationAction = async (actionFn: () => Promise<unknown>) => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      await actionFn();
    } catch {
      // TanStack Query conserve l’erreur pour les messages déjà affichés par l’écran.
    } finally {
      actionLockRef.current = false;
    }
  };

  // L’arrêt conserve le traitement mais désactive ses rappels après confirmation.
  const confirmStop = () => {
    Alert.alert(
      'Désactiver ce traitement dans DRÉPA ?',
      'Cette action ne modifie pas la prescription. Seuls les rappels DRÉPA seront désactivés et les informations resteront visibles.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Désactiver dans DRÉPA', style: 'destructive', onPress: () => void handleMedicationAction(() => activeMutation.mutateAsync(false)) },
      ],
    );
  };

  // La suppression attend la réussite en base avant de revenir à la liste.
  const confirmDelete = () => {
    Alert.alert(
      'Supprimer ce traitement ?',
      'Le traitement, ses rappels et ses prises déclarées seront supprimés définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => void handleMedicationAction(async () => {
            await deleteMutation.mutateAsync();
            router.replace('/(app)/(tabs)/medications');
          }),
        },
      ],
    );
  };

  if (query.isPending) return <LoadingState message="Chargement du traitement..." />;
  if (query.isError) {
    const notFound = query.error instanceof MedicationDataError && query.error.kind === 'not_found';
    return <ErrorState title={notFound ? 'Traitement introuvable' : undefined} description={query.error.message} onRetry={notFound ? undefined : () => void query.refetch()} />;
  }

  const { medication, reminders } = query.data;
  const isMutating = activeMutation.isPending || deleteMutation.isPending;

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">{medication.name}</AppText>
        <AppText color="textSecondary">{medication.is_active ? 'Traitement actif' : 'Traitement arrêté'}</AppText>
      </View>
      <StatusBanner message="Ces informations viennent de ta saisie et ne constituent pas une recommandation médicale." />

      <Card>
        <View style={styles.section}>
          <DetailRow label="Dosage déclaré" value={medication.dosage} />
          <DetailRow label="Fréquence déclarée" value={medication.frequency} />
          <DetailRow label="Date de début" value={dateFormatter.format(parseLocalDate(medication.start_date))} />
          <DetailRow label="Date de fin" value={medication.end_date ? dateFormatter.format(parseLocalDate(medication.end_date)) : 'Non renseignée'} />
        </View>
      </Card>

      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Horaires de rappel</AppText>
          <AppText color={reminders.length ? 'textPrimary' : 'textSecondary'}>
            {reminders.length ? reminders.map((reminder) => reminder.reminder_time.slice(0, 5)).join(', ') : 'Aucun horaire renseigné.'}
          </AppText>
        </View>
      </Card>

      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Notes personnelles</AppText>
          <AppText color={medication.notes ? 'textPrimary' : 'textSecondary'}>{medication.notes ?? 'Aucune note renseignée.'}</AppText>
        </View>
      </Card>

      {activeMutation.isError ? <StatusBanner tone="error" message={activeMutation.error.message} /> : null}
      {deleteMutation.isError ? <StatusBanner tone="error" message={deleteMutation.error.message} /> : null}
      <Button label="Modifier" disabled={isMutating} onPress={() => router.push(`/(app)/medication/${id}/edit` as Href)} />
      <Button
        label={medication.is_active ? 'Désactiver dans DRÉPA' : 'Réactiver dans DRÉPA'}
        variant="secondary"
        loading={activeMutation.isPending}
        disabled={deleteMutation.isPending}
        onPress={medication.is_active ? confirmStop : () => void handleMedicationAction(() => activeMutation.mutateAsync(true))}
      />
      <Button label="Supprimer" variant="danger" loading={deleteMutation.isPending} disabled={activeMutation.isPending} onPress={confirmDelete} />
      <Button label="Retour aux traitements" variant="ghost" disabled={isMutating} onPress={() => router.replace('/(app)/(tabs)/medications')} />
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

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  header: { gap: spacing.sm },
  section: { gap: spacing.md },
  row: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, justifyContent: 'space-between' },
  value: { flex: 1, minWidth: 160, textAlign: 'right' },
});
