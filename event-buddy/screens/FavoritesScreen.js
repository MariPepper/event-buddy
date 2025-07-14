import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  View,
} from 'react-native';
import { firebase } from '../FirebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export default function FavoritesScreen({ navigation }) {
  const { user } = useAuth();
  const [favoritesEvents, setFavoritesEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(async (userDoc) => {
        setLoading(true);

        const favorites = userDoc.data()?.favorites || [];

        if (favorites.length === 0) {
          setFavoritesEvents([]);
          setLoading(false);
          return;
        }

        const eventsPromises = favorites.map((id) =>
          firebase.firestore().collection('events').doc(id).get()
        );
        const eventsDocs = await Promise.all(eventsPromises);
        const events = eventsDocs
          .filter((doc) => doc.exists)
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        // Fetch user data once to check participation and favorited status
        const userSnap = await firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .get();
        const userData = userSnap.data() || {
          favorites: [],
          participations: [],
        };

        const enrichedEvents = events.map((event) => ({
          ...event,
          favorited: userData.favorites?.includes(event.id) || false,
          participating: event.participants?.includes(user.uid) || false,
        }));

        setFavoritesEvents(enrichedEvents);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user.uid]);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );
  }

  if (favoritesEvents.length === 0) {
    return (
      <View style={{ padding: 15 }}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Nenhum evento nos favoritos.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favoritesEvents}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const formattedDate = item.datetime?.toDate
          ? item.datetime.toDate().toLocaleString()
          : 'Data inválida';

        return (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('EventDetails', { eventId: item.id })
            }
            activeOpacity={0.8}>
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: '100%', height: 200, marginBottom: 10 }}
                />
              ) : null}

              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                {item.title}
              </Text>
              <Text>{formattedDate}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
