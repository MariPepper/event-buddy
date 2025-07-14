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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 20, textAlign: 'center' }}>
          Entrar
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

        <Button title="Entrar" onPress={handleLogin} />

        <View style={{ height: 10 }} />

        <Button title="Registar" onPress={() => navigation.navigate('Register')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}