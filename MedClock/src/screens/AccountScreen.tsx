import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const AccountScreen = ({ navigation }: any) => {
  const [userData, setUserData] = useState<{ name: string; email: string; photoURL: string | null } | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData({
              name: userDoc.data()?.name || 'Usuário',
              email: userDoc.data()?.email || user.email || 'sem e-mail',
              photoURL: user.photoURL || null,
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        }
      };

      fetchUserData();
    } else {
      navigation.navigate('Login');
    }
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login'); // Redireciona para a tela de Login após o logout
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    }
  };

  const handleEditAccount = () => {
    navigation.navigate('EditAccount'); // Roteia para a tela de edição da conta
  };

  return (
    <View style={styles.container}>
      {userData ? (
        <View style={styles.userInfo}>
          <View style={styles.profileContainer}>
            {userData.photoURL ? (
              <Image source={{ uri: userData.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImageFallback}>
                <Text style={styles.profileImageText}>{userData.name[0]}</Text>
              </View>
            )}
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>Carregando dados do usuário...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileImageFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImageText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AccountScreen;
