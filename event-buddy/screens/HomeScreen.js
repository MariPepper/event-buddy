import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { firebase } from '../FirebaseConfig';

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase.firestore()
      .collection('events')
      .orderBy('datetime')
      .onSnapshot(
        snapshot => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEvents(list);
          setLoading(false);
        },
        error => {
          console.error(error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}>
          <View style={{ flexDirection: 'row', margin: 10, borderBottomWidth: 1, borderColor: '#ddd' }}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={{ width: 100, height: 80 }} />
            ) : null}
            <View style={{ flex: 1, paddingLeft: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text>
                {item.datetime?.toDate
                  ? item.datetime.toDate().toLocaleString()
                  : 'Data inválida'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}