import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../components/Login';
import Cadastrar from '../components/Cadastrar';
import Home from '../components/Home';

const Stack = createStackNavigator();


export default function HomeScreen() {
  return (

      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastrar" component={Cadastrar} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>

  );
}

