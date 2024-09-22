// src/screens/AccountScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { auth, firestore } from '../firebaseConfig';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const AccountScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email || '');
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData({ name: userDoc.data()?.name, email: user.email || '' });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleChangeEmail = async () => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.updateEmail(newEmail);
      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { email: newEmail });
      setEmail(newEmail);
      setNewEmail('');
      alert('Email atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar email:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.updatePassword(newPassword);
      setNewPassword('');
      alert('Senha atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      await deleteDoc(userDocRef);
      await auth.currentUser.delete();
      alert('Conta excluída com sucesso!');
      signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
    }
  };

  return (
    <View style={styles.container}>
      {userData && (
        <View style={styles.card}>
          <Text>Nome: {userData.name}</Text>
          <Text>Email: {userData.email}</Text>
          <Text>Senha: {'*'.repeat(password.length)}</Text>
        </View>
      )}

      <TextInput
        placeholder="Novo Email"
        value={newEmail}
        onChangeText={setNewEmail}
        style={styles.input}
      />
      <Button title="Alterar Email" onPress={handleChangeEmail} />

      <TextInput
        placeholder="Nova Senha"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Alterar Senha" onPress={handleChangePassword} />

      <Button title="Excluir Conta" onPress={handleDeleteAccount} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default AccountScreen;
