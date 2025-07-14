import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { firebase } from '../FirebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export default function EventDetailsScreen({ route }) {
  const { eventId } = route.params;
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingEventIds, setTogglingEventIds] = useState([]);

  useEffect(() => {
    // Real-time listener for the specific event
    const eventUnsubscribe = firebase
      .firestore()
      .collection('events')
      .doc(eventId)
      .onSnapshot(
        (eventDoc) => {
          if (!eventDoc.exists) {
            Alert.alert('Erro', 'Evento não encontrado.');
            setLoading(false);
            return;
          }
          
          const eventData = { id: eventDoc.id, ...eventDoc.data() };
          
          // Real-time listener for user data
          const userUnsubscribe = firebase
            .firestore()
            .collection('users')
            .doc(user.uid)
            .onSnapshot(
              (userDoc) => {
                const userData = userDoc.data() || {
                  favorites: [],
                  participations: [],
                };

                // Enrich event with real-time user status
                const enrichedEvent = {
                  ...eventData,
                  participating: eventData.participants?.includes(user.uid) || false,
                  favorited: userData.favorites?.includes(eventId) || false,
                };

                setEvents([enrichedEvent]);
                setLoading(false);
              },
              (error) => {
                Alert.alert('Erro', error.message);
                setLoading(false);
              }
            );

          // Store user unsubscribe function to clean up later
          return () => userUnsubscribe();
        },
        (error) => {
          Alert.alert('Erro', error.message);
          setLoading(false);
        }
      );

    // Cleanup function
    return () => eventUnsubscribe();
  }, [eventId, user.uid]);

  const toggleParticipation = async (targetEventId) => {
    setTogglingEventIds((ids) => [...ids, targetEventId]);
    const eventRef = firebase
      .firestore()
      .collection('events')
      .doc(targetEventId);
    const userRef = firebase.firestore().collection('users').doc(user.uid);

    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        const userDoc = await transaction.get(userRef);

        if (!eventDoc.exists) throw new Error('Evento não encontrado');
        if (!userDoc.exists) throw new Error('Utilizador não encontrado');

        const eventData = eventDoc.data();
        const userData = userDoc.data();

        let participants = eventData.participants || [];
        let participations = userData.participations || [];

        if (participants.includes(user.uid)) {
          // Remove participation
          participants = participants.filter((uid) => uid !== user.uid);
          participations = participations.filter((id) => id !== targetEventId);
        } else {
          // Add participation
          if (user.uid.trim() !== "" && !participants.includes(user.uid)) {
            participants.push(user.uid);
            participations.push(targetEventId);
          }
        }

        transaction.update(eventRef, { participants });
        transaction.update(userRef, { participations });
      });

      // No need to manually update state - real-time listeners will handle it!
    } catch (error) {
      Alert.alert('Erro', error.message || error.toString());
    }
    setTogglingEventIds((ids) => ids.filter((id) => id !== targetEventId));
  };

  const toggleFavorite = async (targetEventId) => {
    setTogglingEventIds((ids) => [...ids, targetEventId]);
    const userRef = firebase.firestore().collection('users').doc(user.uid);

    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error('Utilizador não encontrado');

        let favorites = userDoc.data().favorites || [];

        if (favorites.includes(targetEventId)) {
          favorites = favorites.filter((id) => id !== targetEventId);
        } else {
          favorites.push(targetEventId);
        }

        transaction.update(userRef, { favorites });
      });

      // No need to manually update state - real-time listeners will handle it!
    } catch (error) {
      Alert.alert('Erro', error.message || error.toString());
    }
    setTogglingEventIds((ids) => ids.filter((id) => id !== targetEventId));
  };

  if (loading || events.length === 0) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const formattedDate = item.datetime?.toDate
          ? item.datetime.toDate().toLocaleString()
          : 'Data inválida';

        const isToggling = togglingEventIds.includes(item.id);

        return (
          <View style={{ padding: 15 }}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: '100%', height: 200, marginBottom: 10 }}
              />
            ) : null}

            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
              {item.title}
            </Text>
            <Text>{item.description}</Text>
            <Text>Local: {item.location || 'Não informado'}</Text>
            <Text>Data/Hora: {formattedDate}</Text>

            {/* Filter out empty or invalid participants before counting */}
            <Text>
              Total de Participantes:{' '}
              {item.participants?.filter((p) => p && p.trim() !== '').length || 0}
            </Text>

            <View style={{ marginTop: 15 }}>
              <Button
                title={
                  item.participating ? 'Cancelar Participação' : 'Participar'
                }
                onPress={() => toggleParticipation(item.id)}
                disabled={isToggling}
              />
            </View>

            <View style={{ marginTop: 10 }}>
              <Button
                title={
                  item.favorited
                    ? 'Remover dos Favoritos'
                    : 'Adicionar aos Favoritos'
                }
                onPress={() => toggleFavorite(item.id)}
                disabled={isToggling}
              />
            </View>
          </View>
        );
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}