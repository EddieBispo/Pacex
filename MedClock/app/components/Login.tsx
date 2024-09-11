// src/screens/Login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    const usuariosExistentes = await AsyncStorage.getItem('usuarios');
    const usuarios = usuariosExistentes ? JSON.parse(usuariosExistentes) : [];

    const usuarioValido = usuarios.find((user: any) => user.email === email && user.senha === senha);

    if (usuarioValido) {
      navigation.navigate('Home', { nome: usuarioValido.nome });
    } else {
      alert('E-mail ou senha inválidos!');
    }
  };

  return (
    <View style={styles.container}>
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

      <Button title="Login" onPress={handleLogin} />

      <TouchableOpacity onPress={() => navigation.navigate('Cadastrar')}>
        <Text style={styles.link}>Não tem conta? Cadastrar-se</Text>
      </TouchableOpacity>
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
  link: {
    color: 'blue',
    marginTop: 10,
  },
});

export default Login;
