// Permet de publier un message dans la communauté.
// Valide le contenu et l’acceptation de la charte localement.
// Utilise uniquement l’identité de la session authentifiée.
// N’envoie aucun pseudonyme depuis l’application mobile.
// Rappelle que les échanges ne remplacent pas un avis médical.
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, type Href } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { CheckboxRow } from '@/components/ui/CheckboxRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { communityCategoryLabels } from '@/features/community/categories';
import { CommunitySafetyBanner } from '@/features/community/components/CommunitySafetyBanner';
import { useCreatePostMutation } from '@/features/community/mutations';
import { postSchema, type PostValues } from '@/features/community/schemas';
import { SingleChoiceChips } from '@/features/health-log/components/ChoiceChips';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

const postDefaults: PostValues = {
  category: 'testimony',
  content: '',
  charterAccepted: false,
};

export default function NewCommunityPostScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreatePostMutation(user?.id);
  const publishLockRef = useRef(false);
  const { control, handleSubmit, setError, formState } = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: postDefaults,
  });
  const content = useWatch({ control, name: 'content' }) ?? '';
  const isPublishing = formState.isSubmitting || createMutation.isPending;

  // Le verrou est posé avant la promesse pour bloquer deux validations dans le même rendu.
  const onSubmit = async (values: PostValues) => {
    if (publishLockRef.current) return;
    publishLockRef.current = true;
    try {
      const post = await createMutation.mutateAsync(values);
      router.replace(`/(app)/community/${post.id}` as Href);
    } catch {
      setError('root', { message: 'La publication ne peut pas être envoyée pour le moment.' });
    } finally {
      publishLockRef.current = false;
    }
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <AppText variant="title">Nouvelle publication</AppText>
      <CommunitySafetyBanner />

      <View style={styles.fieldGroup}>
        <AppText variant="label">Catégorie</AppText>
        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <>
              <SingleChoiceChips
                choices={communityCategoryLabels}
                selected={field.value}
                onChange={(value) => {
                  if (value) field.onChange(value);
                }}
              />
              {fieldState.error?.message ? <AppText variant="caption" color="sos">{fieldState.error.message}</AppText> : null}
            </>
          )}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Controller
          control={control}
          name="content"
          render={({ field, fieldState }) => (
            <TextField
              label="Votre message"
              multiline
              maxLength={2000}
              numberOfLines={8}
              placeholder="Écrivez votre publication"
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              style={styles.textArea}
            />
          )}
        />
        <AppText accessibilityLiveRegion="polite" align="right" variant="caption" color="textSecondary">
          {content.length} / 2000 caractères
        </AppText>
      </View>

      <Controller
        control={control}
        name="charterAccepted"
        render={({ field, fieldState }) => (
          <CheckboxRow
            checked={field.value}
            label="J’accepte la charte de la communauté et je m’engage à respecter les autres membres."
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      {formState.errors.root?.message ? (
        <AppText accessibilityRole="alert" color="sos">{formState.errors.root.message}</AppText>
      ) : null}
      <Button
        label="Publier"
        disabled={isPublishing}
        loading={isPublishing}
        onPress={() => void handleSubmit(onSubmit)()}
      />
      <Button label="Annuler" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  fieldGroup: { gap: spacing.sm },
  textArea: { minHeight: 160, textAlignVertical: 'top' },
});
