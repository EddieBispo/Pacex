import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { auth, firestore } from '../firebaseConfig';
import { doc, setDoc, collection, getDocs, query, where, getDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { calculateMedSchedule } from '../utils/calculateMedSchedule';

const HomeScreen = ({ navigation }: any) => {
  const [medName, setMedName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [interval, setInterval] = useState('');
  const [duration, setDuration] = useState('');
  const [medications, setMedications] = useState<any[]>([]);
  const [selectedMed, setSelectedMed] = useState<string>('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState<{ name: string; id: string } | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Usuário não autenticado.');
          return;
        }
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await signOut(auth);
          setError('Usuário não encontrado. Redirecionando para o login...');
        } else {
          setUserData({ name: userDoc.data()?.name, id: user.uid });
          fetchMedications();
        }
      } catch (error: any) {
        setError('Erro ao carregar dados do usuário: ' + error.message);
      }
    };

    checkUser();
  }, []);

  const fetchMedications = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const medsQuery = query(collection(firestore, 'medications'), where('userId', '==', userId));
        const querySnapshot = await getDocs(medsQuery);
        const meds = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMedications(meds);
      }
    } catch (error: any) {
      setError('Erro ao carregar medicamentos: ' + error.message);
    }
  };

  const handleAddMedication = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const userId = user.uid;
      await setDoc(doc(firestore, 'medications', userId + Date.now()), {
        name: medName,
        startTime,
        interval,
        duration,
        userId,
      });

      setMedName('');
      setStartTime('');
      setInterval('');
      setDuration('');
      setShowForm(false);
      fetchMedications();
    } catch (error: any) {
      setError('Erro ao adicionar medicamento: ' + error.message);
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      await deleteDoc(doc(firestore, 'medications', medicationId));
      fetchMedications();
    } catch (error: any) {
      setError('Erro ao excluir medicamento: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error: any) {
      setError('Erro ao fazer logout: ' + error.message);
    }
  };

  const toggleExpandCard = (medId: string, startTime: string, interval: number, duration: number) => {
    // Se o cartão está expandido, colapsar, se não, expandir e calcular os horários
    if (expandedCard === medId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(medId);
    }
  };

  const renderMedication = ({ item }: any) => {
    const isExpanded = expandedCard === item.id;
    const schedule = isExpanded
      ? calculateMedSchedule(item.startTime, parseInt(item.interval), parseInt(item.duration))
      : [];

    return (
      <TouchableOpacity onPress={() => toggleExpandCard(item.id, item.startTime, item.interval, item.duration)}>
        <View style={styles.medCard}>
          <Text>Nome: {item.name}</Text>
          <Text>Horário de Início: {item.startTime}</Text>
          <Text>Intervalo: {item.interval}</Text>
          <Text>Duração: {item.duration}</Text>

          {isExpanded && (
            <View style={styles.scheduleContainer}>
              <Text style={styles.scheduleTitle}>Horários:</Text>
              {schedule.map((time, index) => (
                <Text key={index} style={styles.scheduleItem}>
                  {time}
                </Text>
              ))}
            </View>
          )}

          <Button title="Excluir" onPress={() => handleDeleteMedication(item.id)} />
        </View>
      </TouchableOpacity>
    );
  };

  const filteredMedications = selectedMed === '' || selectedMed === 'todos'
    ? medications
    : medications.filter(med => med.id === selectedMed);

  return (
    <View style={styles.container}>
      <Button title="Adicionar Medicamento" onPress={() => setShowForm(true)} />
      <Button title="Conta" onPress={() => navigation.navigate('Account')} />
      <Button title="Logout" onPress={handleLogout} color="red" />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text>Filtrar medicamentos:</Text>
      <Picker
        selectedValue={selectedMed}
        onValueChange={(itemValue) => setSelectedMed(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Todos" value="todos" />
        {medications.map((med) => (
          <Picker.Item key={med.id} label={med.name} value={med.id} />
        ))}
      </Picker>

      <FlatList data={filteredMedications} renderItem={renderMedication} keyExtractor={(item) => item.id} />

      <Modal transparent={true} animationType="slide" visible={showForm} onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.card}>
            <TextInput
              placeholder="Nome do Medicamento"
              value={medName}
              onChangeText={setMedName}
              style={styles.input}
            />
            <TextInput
              placeholder="Horário de Início"
              value={startTime}
              onChangeText={setStartTime}
              style={styles.input}
            />
            <TextInput placeholder="Intervalo" value={interval} onChangeText={setInterval} style={styles.input} />
            <TextInput placeholder="Duração" value={duration} onChangeText={setDuration} style={styles.input} />
            <Button title="Salvar Medicamento" onPress={handleAddMedication} />
            <Button title="Fechar" onPress={() => setShowForm(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  medCard: {
    backgroundColor: '#f1f1f1',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    width: '80%',
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginVertical: 10,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  scheduleContainer: {
    marginTop: 10,
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
  },
  scheduleTitle: {
    fontWeight: 'bold',
  },
  scheduleItem: {
    paddingVertical: 4,
  },
});

export default HomeScreen;
