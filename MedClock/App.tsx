// src/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AccountScreen from './src/screens/AccountScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          gestureEnabled: false, // Desabilita gestos de navegação (como o swipe para voltar)
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Login',
            headerLeft: () => null, // Remove o botão de voltar
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Cadastro' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '', // Título vazio para a tela Home
            headerLeft: () => null, // Remove o botão de voltar
            gestureEnabled: false, // Desabilita os gestos de voltar
          }}
        />
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={{ title: 'Conta' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
