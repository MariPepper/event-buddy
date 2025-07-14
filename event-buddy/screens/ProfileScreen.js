import React from 'react';
import { View, Text, Button, SafeAreaView, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { firebase } from '../FirebaseConfig';

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await firebase.auth().signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 15 }}>
        <Text style={{ marginBottom: 10 }}>Email: {user.email}</Text>
        <Text style={{ marginBottom: 20 }}>UID: {user.uid}</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
