import React, {useContext, useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import {usePremium} from '../context/PremiumContext';
import {useLanguage} from '../context/LanguageContext';
import Icon from 'react-native-vector-icons/Feather';
import {colors} from '../constants/colors';
import {AdBanner} from '../components/AdBanner';
import LinearGradient from 'react-native-linear-gradient';

const PremiumFeature = ({title, description, iconName}) => {
  return (
    <View style={styles.featureContainer}>
      <View style={styles.featureIconContainer}>
        <Icon name={iconName} size={32} color="#FFD700" />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
};

const PremiumScreen = () => {
  const {translate} = useLanguage();
  const {
    isPremium,
    purchasePremium,
    restorePurchases,
    premiumPrice,
    purchasePending,
  } = usePremium();
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    try {
      await purchasePremium();
    } catch (error) {
      Alert.alert(translate('error'), translate('purchaseError'), [
        {text: translate('ok')},
      ]);
      console.error('Purchase error:', error);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const restored = await restorePurchases();
      setRestoring(false);

      if (!restored) {
        Alert.alert(translate('error'), translate('restoreError'), [
          {text: translate('ok')},
        ]);
      }
    } catch (error) {
      setRestoring(false);
      Alert.alert(translate('error'), translate('restoreError'), [
        {text: translate('ok')},
      ]);
      console.error('Restore error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <LinearGradient
          colors={['#5B86E5', '#36D1DC']}
          style={styles.headerContainer}>
          <Icon name="crown" size={70} color="#FFD700" />
          <Text style={styles.headerTitle}>{translate('premiumTitle')}</Text>
          {isPremium ? (
            <View style={styles.premiumStatusContainer}>
              <Icon name="check-circle" size={80} color="#4CAF50" />
              <Text style={styles.premiumStatusText}>
                {translate('premiumActive')}
              </Text>
            </View>
          ) : (
            <Text style={styles.headerSubtitle}>
              {translate('unlockPremium')}
            </Text>
          )}
        </LinearGradient>

        <View style={styles.featuresContainer}>
          <PremiumFeature
            title={translate('noAdsTitle')}
            description={translate('noAdsDescription')}
            iconName="eye"
          />
          <PremiumFeature
            title={translate('pdfExportTitle')}
            description={translate('pdfExportDescription')}
            iconName="file-text"
          />
          <PremiumFeature
            title={translate('advancedFiltersTitle')}
            description={translate('advancedFiltersDescription')}
            iconName="list"
          />
          <PremiumFeature
            title={translate('prioritySupport')}
            description={translate('prioritySupportDescription')}
            iconName="headphones"
          />
        </View>

        {isPremium ? (
          <View style={styles.premiumActiveContainer}>
            <Icon name="check-circle" size={80} color={colors.success} />
            <Text style={styles.premiumActiveText}>
              {translate('premiumActive')}
            </Text>
          </View>
        ) : (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
              disabled={purchasePending}>
              {purchasePending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.purchaseButtonText}>
                    {translate('upgradeNow')} - {premiumPrice}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={restoring}>
              {restoring ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.restoreButtonText}>
                  {translate('restorePurchases')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {!isPremium && <AdBanner />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  premiumStatusContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  premiumStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  featuresContainer: {
    padding: 20,
    marginTop: 10,
  },
  featureContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(91, 134, 229, 0.1)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.text,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    paddingVertical: 10,
  },
  restoreButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  premiumActiveContainer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  premiumActiveText: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.success,
  },
});

export default PremiumScreen;
