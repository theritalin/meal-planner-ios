import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Platform} from 'react-native';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases,
} from 'react-native-iap';

// Premium ürün ID'si - Sadece iOS
const premiumProductId = 'com.bsck.mealplanner';

export const PremiumContext = createContext();

export const PremiumProvider = ({children}) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState(null);
  const [purchasePending, setPurchasePending] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    initializeIAP();

    return () => {
      // Bağlantıyı kapat
      endConnection();
    };
  }, []);

  const initializeIAP = async () => {
    try {
      // IAP bağlantısını başlat
      await initConnection();

      // Ürün bilgilerini al
      const products = await getProducts([premiumProductId]);
      if (products.length > 0) {
        setProductDetails(products[0]);
      }

      // Satın alma dinleyicileri
      const purchaseUpdateSubscription = purchaseUpdatedListener(
        async purchase => {
          // Satın alma işlemini tamamla
          if (purchase) {
            try {
              await finishTransaction(purchase);
              // Premium durumunu güncelle
              await AsyncStorage.setItem('isPremium', 'true');
              setIsPremium(true);
              setPurchasePending(false);
              Alert.alert(
                'Başarılı',
                'Premium özellikler etkinleştirildi. Artık reklamlar gösterilmeyecek!',
              );
            } catch (error) {
              console.log('Satın alma tamamlama hatası:', error);
              setPurchasePending(false);
            }
          }
        },
      );

      const purchaseErrorSubscription = purchaseErrorListener(error => {
        console.log('Satın alma hatası:', error);
        setPurchasePending(false);
        Alert.alert(
          'Hata',
          'Satın alma işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        );
      });

      // Abonelikleri temizle
      return () => {
        purchaseUpdateSubscription.remove();
        purchaseErrorSubscription.remove();
      };
    } catch (error) {
      console.log('IAP başlatma hatası:', error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const storedPremium = await AsyncStorage.getItem('isPremium');
      if (storedPremium === 'true') {
        setIsPremium(true);
      }
    } catch (error) {
      console.log('Premium kontrol hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchasePremium = async () => {
    try {
      setPurchasePending(true);

      // Sadece iOS için satın alma
      if (Platform.OS === 'ios') {
        // Gerçek satın alma işlemini başlat
        await requestPurchase(premiumProductId);
      } else {
        // Simülasyon (geliştirme ortamında test için)
        simulatePurchase();
      }

      return true;
    } catch (error) {
      console.log('Satın alma hatası:', error);
      setPurchasePending(false);
      Alert.alert(
        'Hata',
        'Satın alma işlemi başlatılamadı. Lütfen daha sonra tekrar deneyin.',
      );
      return false;
    }
  };

  const restorePurchases = async () => {
    try {
      // Mevcut satın almaları getir
      const purchases = await getAvailablePurchases();

      if (purchases && purchases.length > 0) {
        // Premium satın alımı bul
        const premiumPurchase = purchases.find(
          purchase => purchase.productId === premiumProductId,
        );

        if (premiumPurchase) {
          // Premium durumunu güncelle
          await AsyncStorage.setItem('isPremium', 'true');
          setIsPremium(true);
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.log('Satın almaları geri yükleme hatası:', error);
      throw error;
    }
  };

  const simulatePurchase = () => {
    Alert.alert(
      'Satın alma simülasyonu',
      "Bu bir test satın almasıdır. Gerçek uygulamada App Store'a bağlanılarak ödeme gerçekleştirilir.",
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: () => setPurchasePending(false),
        },
        {
          text: "Premium'a Yükselt",
          onPress: async () => {
            await AsyncStorage.setItem('isPremium', 'true');
            setIsPremium(true);
            setPurchasePending(false);
            Alert.alert(
              'Başarılı',
              'Premium özellikler etkinleştirildi. Artık reklamlar gösterilmeyecek!',
            );
          },
        },
      ],
    );
  };

  const clearPremiumStatus = async () => {
    try {
      await AsyncStorage.setItem('isPremium', 'false');
      setIsPremium(false);
      Alert.alert(
        'Başarılı',
        'Premium durumu sıfırlandı. Reklamlar tekrar gösterilecek.',
      );
      return true;
    } catch (error) {
      console.log('Premium durumu sıfırlama hatası:', error);
      Alert.alert('Hata', 'Premium durumu sıfırlanırken bir hata oluştu.');
      return false;
    }
  };

  const value = {
    isPremium,
    loading,
    purchasePremium,
    purchasePending,
    restorePurchases,
    clearPremiumStatus,
    premiumPrice: productDetails ? productDetails.localizedPrice : '$2.99',
  };

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);
