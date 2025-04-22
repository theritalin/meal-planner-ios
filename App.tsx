/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddMealScreen from './src/screens/AddMealScreen';
import EditMealScreen from './src/screens/EditMealScreen';
import MealDetailScreen from './src/screens/MealDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import {MealProvider} from './src/context/MealContext';
import {LanguageProvider} from './src/context/LanguageContext';
import {PremiumProvider} from './src/context/PremiumContext';
import mobileAds from 'react-native-google-mobile-ads';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  // Google AdMob başlatma
  useEffect(() => {
    // İlk kez başlatılıyor
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        // Başlatma başarılı
        console.log('AdMob başarıyla başlatıldı', adapterStatuses);
      })
      .catch(error => {
        // Başlatma hatası
        console.error('AdMob başlatma hatası:', error);
      });
  }, []);

  return (
    <LanguageProvider>
      <PremiumProvider>
        <MealProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddMeal"
                component={AddMealScreen}
                options={{title: 'Yemek Ekle'}}
              />
              <Stack.Screen
                name="EditMeal"
                component={EditMealScreen}
                options={{title: 'Yemek Düzenle'}}
              />
              <Stack.Screen
                name="MealDetail"
                component={MealDetailScreen}
                options={{title: 'Yemek Detayı'}}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{title: 'Profil'}}
              />
              <Stack.Screen
                name="Premium"
                component={PremiumScreen}
                options={{title: 'Premium'}}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </MealProvider>
      </PremiumProvider>
    </LanguageProvider>
  );
}

export default App;
