// Informations de consentement : présente les règles produit consultables avant toute acceptation.
// Leur version suit les identifiants enregistrés en base et doit encore recevoir une validation juridique externe.
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { legalVersions } from '@/constants/legal-versions';
import { spacing } from '@/theme/spacing';

export default function LegalScreen() {
  const router = useRouter();

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Informations et consentements</AppText>
        <AppText color="textSecondary">Lis ces informations avant de donner ou renouveler ton accord.</AppText>
      </View>
      <LegalSection
        title="Utilisation de DRÉPA"
        version={legalVersions.terms}
        lines={[
          'DRÉPA est un outil personnel d’organisation, de suivi déclaré et de soutien communautaire.',
          'L’application ne fournit aucun diagnostic, prescription, modification de dosage ou service officiel d’urgence.',
          'Tu restes responsable de contacter un professionnel de santé ou les urgences adaptées lorsque la situation le nécessite.',
        ]}
      />
      <LegalSection
        title="Confidentialité"
        version={legalVersions.privacy}
        lines={[
          'Le profil, le journal et les traitements sont privés et associés au compte authentifié.',
          'Les notifications restent génériques et les écrans privés bloquent les captures Android.',
          'Tu peux modifier tes informations, retirer tes consentements ou supprimer définitivement ton compte depuis le Profil.',
        ]}
      />
      <LegalSection
        title="Charte communautaire"
        version={legalVersions.communityGuidelines}
        lines={[
          'Les publications ne remplacent jamais l’avis d’un professionnel de santé.',
          'Ne publie pas d’identité, contact, dossier médical ou autre information personnelle permettant de reconnaître quelqu’un.',
          'Les conseils dangereux, le harcèlement et les contenus trompeurs peuvent être signalés puis modérés humainement.',
        ]}
      />
      <AppText variant="caption" color="textSecondary">Ces informations produit doivent être relues et validées juridiquement avant une diffusion publique.</AppText>
      <Button label="Retour" variant="secondary" onPress={() => router.back()} />
    </ScreenContainer>
  );
}

function LegalSection({ title, version, lines }: { title: string; version: string; lines: string[] }) {
  return (
    <Card>
      <View style={styles.section}>
        <AppText variant="sectionTitle">{title}</AppText>
        <AppText variant="caption" color="brand">Version {version}</AppText>
        {lines.map((line) => <AppText color="textSecondary" key={line}>• {line}</AppText>)}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  header: { gap: spacing.sm },
  section: { gap: spacing.md },
});
