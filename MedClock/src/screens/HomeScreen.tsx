import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, FlatList, StyleSheet, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { auth, firestore } from '../firebaseConfig';
import { doc, setDoc, collection, getDocs, query, where, getDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { calculateMedSchedule } from '../utils/calculateMedSchedule';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async () => {
    if (!medName || !startTime || !interval || !duration) {
      setError('Todos os campos precisam ser preenchidos');
      return;
    }

    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedication = (medicationId: string) => {
    Alert.alert(
      'Confirmação de exclusão',
      'Você tem certeza que deseja excluir este medicamento?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancelado'),
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, 'medications', medicationId));
              fetchMedications();
            } catch (error: any) {
              setError('Erro ao excluir medicamento: ' + error.message);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const toggleExpandCard = (medId: string, startTime: string, interval: number, duration: number) => {
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
          <Text style={styles.medCardTitle}>Nome: {item.name}</Text>
          <Text style={styles.medCardText}>Horário de Início: {item.startTime}</Text>
          <Text style={styles.medCardText}>Intervalo: {item.interval}</Text>
          <Text style={styles.medCardText}>Duração: {item.duration}</Text>

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

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMedication(item.id)}
          >
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredMedications = selectedMed === '' || selectedMed === 'todos'
    ? medications
    : medications.filter(med => med.id === selectedMed);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{userData?.name}</Text>
        <Button title="Conta" onPress={() => navigation.navigate('Account')} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.filterText}>Filtrar medicamentos:</Text>
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

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList data={filteredMedications} renderItem={renderMedication} keyExtractor={(item) => item.id} />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
        <Icon name="add" size={40} color="#fff" />
      </TouchableOpacity>

      <Modal transparent={true} animationType="fade" visible={showForm} onRequestClose={() => setShowForm(false)}>
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
            <TouchableOpacity style={styles.saveButton} onPress={handleAddMedication}>
              <Text style={styles.saveButtonText}>Salvar Medicamento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowForm(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterText: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  medCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  medCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  medCardText: {
    fontSize: 14,
    marginBottom: 4,
  },
  scheduleContainer: {
    marginTop: 10,
  },
  scheduleTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  scheduleItem: {
    fontSize: 14,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    padding: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6200EE',
    borderRadius: 50,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    width: '80%',
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    paddingLeft: 10,
  },
  saveButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: 'gray',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
});

export default HomeScreen;
