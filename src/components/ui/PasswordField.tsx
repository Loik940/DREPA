// Champ de mot de passe partagé par les formulaires de l’application.
// La valeur reste masquée par défaut pour protéger sa saisie.
// Le bouton permet d’afficher ou de masquer temporairement la valeur.
// Son icône Android indique clairement l’action qui sera exécutée.
// Les lecteurs d’écran reçoivent aussi un libellé complet et l’état courant.
import { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { sizes } from '@/theme/sizes';
import { useAppTheme } from '@/theme/use-app-theme';
import { TextField, type TextFieldProps } from './TextField';

type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'rightElement'>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const { colors } = useAppTheme();

  // Le bouton expose son rôle, son action et son état aux lecteurs d’écran.
  return (
    <TextField
      {...props}
      label={props.label}
      autoCapitalize="none"
      secureTextEntry={!visible}
      rightElement={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          accessibilityState={{ expanded: visible }}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={styles.toggle}
        >
          <SymbolView
            name={{ android: visible ? 'visibility_off' : 'visibility' }}
            size={sizes.icon}
            tintColor={colors.textSecondary}
          />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: { alignItems: 'center', height: sizes.touchTarget, justifyContent: 'center', width: sizes.touchTarget },
});
