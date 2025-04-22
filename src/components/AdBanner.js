import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {usePremium} from '../context/PremiumContext';

// Eğer uygulama çalışırken AdMob kullanılabilirse
let BannerAd, BannerAdSize, TestIds;
try {
  // Dinamik import yöntemi
  const GoogleMobileAds = require('react-native-google-mobile-ads');
  BannerAd = GoogleMobileAds.BannerAd;
  BannerAdSize = GoogleMobileAds.BannerAdSize;
  TestIds = GoogleMobileAds.TestIds;
} catch (error) {
  console.error('AdMob modülü yüklenemedi:', error);
}

export const AdBanner = () => {
  const {isPremium} = usePremium();

  if (isPremium) {
    return null;
  }

  // AdMob yüklenemediyse geçici reklam alanını göster
  if (!BannerAd) {
    return (
      <View style={styles.container}>
        <Text style={styles.adText}>Reklam Alanı</Text>
      </View>
    );
  }

  // AdMob kullanılabiliyorsa gerçek reklamı göster
  const adUnitId =
    Platform.OS === 'ios'
      ? 'ca-app-pub-8721131084537312/9867212731'
      : TestIds.BANNER;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    width: '100%',
  },
  adText: {
    color: '#888',
    fontSize: 12,
  },
});
