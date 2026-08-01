import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { sizes } from '@/theme/sizes';
import { AppText } from './AppText';
import { TextField, type TextFieldProps } from './TextField';

type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'rightElement'>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

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
          <AppText variant="caption" color="textSecondary">{visible ? 'Masquer' : 'Afficher'}</AppText>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: { alignItems: 'center', justifyContent: 'center', minHeight: sizes.touchTarget, minWidth: sizes.touchTarget },
});
