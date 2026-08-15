// Champ de mot de passe partagé par les formulaires de l’application.
// La valeur reste masquée par défaut pour protéger sa saisie.
// Le bouton permet d’afficher ou de masquer temporairement la valeur.
// Son icône Android indique clairement l’action qui sera exécutée.
// Les lecteurs d’écran reçoivent aussi un libellé complet et l’état courant.
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { sizes } from '@/theme/sizes';
import { TextField, type TextFieldProps } from './TextField';
import { VisibilityIcon } from './VisibilityIcon';

type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'rightElement'>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

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
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={styles.toggle}
        >
          <VisibilityIcon hidden={visible} />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: { alignItems: 'center', height: sizes.touchTarget, justifyContent: 'center', width: sizes.touchTarget },
});
