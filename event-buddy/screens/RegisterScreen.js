import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  TextInput,
  Text,
  Button,
  Alert,
} from 'react-native';
import { firebase } from '../FirebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await firebase.firestore().collection('users').doc(cred.user.uid).set({
        favorites: [],
        participations: [],
      });
      Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
      // Opcional: navegar para outra tela
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 20, textAlign: 'center' }}>
          Registar
        </Text>

        <Text>Email:</Text>
        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginBottom: 15,
            paddingHorizontal: 10,
          }}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCompleteType="email"
        />

        <Text>Password:</Text>
        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginBottom: 15,
            paddingHorizontal: 10,
          }}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCompleteType="password"
        />

        <Button title="Registar" onPress={handleRegister} />

        <View style={{ height: 10 }} />

        <Button title="Voltar para Login" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}