// src/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AccountScreen from './src/screens/AccountScreen'; // Importa a nova tela

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Login' }} // Definir o título da tela
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Cadastro' }} // Definir o título da tela
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Início' }} // Definir o título da tela
        />
        <Stack.Screen 
          name="Account" 
          component={AccountScreen} 
          options={{ title: 'Conta' }} // Definir o título da tela
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
