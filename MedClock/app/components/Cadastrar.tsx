// src/screens/Cadastrar.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cadastrar = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation<any>();

  const handleCadastrar = async () => {
    const usuariosExistentes = await AsyncStorage.getItem('usuarios');
    const usuarios = usuariosExistentes ? JSON.parse(usuariosExistentes) : [];

    const usuarioExistente = usuarios.find((user: any) => user.email === email);
    if (usuarioExistente) {
      alert('E-mail já cadastrado!');
      return;
    }

    const novoUsuario = { id: usuarios.length + 1, nome, email, senha };
    usuarios.push(novoUsuario);
    await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert('Usuário cadastrado com sucesso!');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text>Nome:</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />

      <Text>Email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text>Senha:</Text>
      <TextInput
        value={senha}
        onChangeText={setSenha}
        style={styles.input}
        secureTextEntry
      />

      <Button title="Cadastrar" onPress={handleCadastrar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
});

export default Cadastrar;
