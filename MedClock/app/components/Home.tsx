// src/screens/Home.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const Home = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { nome } = route.params || {};

  return (
    <View style={styles.container}>
      <Text>Bem-vindo, {nome}!</Text>
      <Button title="Logout" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default Home;
