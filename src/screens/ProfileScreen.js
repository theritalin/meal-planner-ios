import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import {useMeals} from '../context/MealContext';
import {useLanguage} from '../context/LanguageContext';
import {usePremium} from '../context/PremiumContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import {AdBanner} from '../components/AdBanner';

const ProfileScreen = ({navigation}) => {
  const {currentUser, logout, mealPlan, userMeals, getAllMeals} = useMeals();
  const {translate, language, changeLanguage, availableLanguages} =
    useLanguage();
  const {
    isPremium,
    purchasePremium,
    premiumPrice,
    restorePurchases,
    clearPremiumStatus,
  } = usePremium();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [pdfType, setPdfType] = useState(''); // 'mealplan' veya 'cookbook'

  useEffect(() => {
    if (!currentUser) {
      navigation.replace('Login');
    }
  }, [currentUser, navigation]);

  if (!currentUser) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(translate('logout'), translate('logoutConfirm'), [
      {text: translate('cancel'), style: 'cancel'},
      {
        text: translate('logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            navigation.replace('Login');
          } catch (error) {
            console.error('Çıkış yapma hatası:', error);
            Alert.alert(translate('error'), 'Çıkış yapılırken bir hata oluştu');
          }
        },
      },
    ]);
  };

  const handleLanguageChange = async newLanguage => {
    const success = await changeLanguage(newLanguage);
    setIsLanguageModalVisible(false);

    if (!success) {
      Alert.alert(
        translate('error'),
        'Dil değiştirilemedi. Lütfen tekrar deneyin.',
      );
    }
  };

  const handlePurchasePremium = async () => {
    try {
      setIsPurchasing(true);
      const success = await purchasePremium();

      if (success) {
        Alert.alert(
          translate('success'),
          translate('premiumSuccess') ||
            'Premium özellikler başarıyla aktif edildi!',
        );
      } else {
        Alert.alert(
          translate('error'),
          translate('premiumError') ||
            'Satın alma işlemi sırasında bir hata oluştu.',
        );
      }
    } catch (error) {
      console.error('Premium satın alma hatası:', error);
      Alert.alert(
        translate('error'),
        translate('premiumError') ||
          'Satın alma işlemi sırasında bir hata oluştu.',
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsRestoring(true);
      const restored = await restorePurchases();

      if (restored) {
        Alert.alert(
          translate('success'),
          translate('restoreSuccess') ||
            'Satın alımlar başarıyla geri yüklendi',
        );
      } else {
        Alert.alert(
          translate('info'),
          translate('noRestorablePurchases') ||
            'Geri yüklenecek satın alım bulunamadı',
        );
      }
    } catch (error) {
      console.error('Satın alım geri yükleme hatası:', error);
      Alert.alert(
        translate('error'),
        translate('restoreError') ||
          'Satın alımları geri yüklerken bir hata oluştu',
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearPremiumStatus = async () => {
    try {
      await clearPremiumStatus();
    } catch (error) {
      console.error('Premium durumu sıfırlama hatası:', error);
      Alert.alert(
        translate('error'),
        'Premium durumu sıfırlanırken bir hata oluştu',
      );
    }
  };

  // Haftalık yemek planı PDF'ini oluştur
  const generateMealPlanPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfType('mealplan');

      // Günleri ve yemek tiplerini dile göre ayarla
      const daysKey =
        language === 'en'
          ? [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ]
          : [
              'Pazartesi',
              'Salı',
              'Çarşamba',
              'Perşembe',
              'Cuma',
              'Cumartesi',
              'Pazar',
            ];

      const daysMap = {
        Pazartesi: language === 'en' ? 'Monday' : 'Pazartesi',
        Salı: language === 'en' ? 'Tuesday' : 'Salı',
        Çarşamba: language === 'en' ? 'Wednesday' : 'Çarşamba',
        Perşembe: language === 'en' ? 'Thursday' : 'Perşembe',
        Cuma: language === 'en' ? 'Friday' : 'Cuma',
        Cumartesi: language === 'en' ? 'Saturday' : 'Cumartesi',
        Pazar: language === 'en' ? 'Sunday' : 'Pazar',
      };

      // Yemek tipleri
      const mealTypes = ['kahvaltı', 'öğle', 'akşam'];
      const mealTypeLabels = {
        kahvaltı: translate('mealTypeSimple.breakfast'),
        öğle: translate('mealTypeSimple.lunch'),
        akşam: translate('mealTypeSimple.dinner'),
      };

      // Tablo için HTML içeriği oluştur
      let tableRows = '';

      // Her gün için verileri ekle
      Object.keys(mealPlan).forEach(day => {
        const translatedDay = daysMap[day] || day;

        tableRows += `
          <tr>
            <td>${translatedDay}</td>
        `;

        // Her öğün için yemekleri ekle
        mealTypes.forEach(type => {
          const meals = mealPlan[day]?.[type] || [];
          const mealNames = meals.map(meal => meal.name).join(', ') || '-';

          tableRows += `<td>${mealNames}</td>`;
        });

        tableRows += `</tr>`;
      });

      // Alışveriş listesi için malzemeleri topla
      let shoppingListByDay = {};

      // Her gün için malzemeleri ekle
      Object.keys(mealPlan).forEach(day => {
        shoppingListByDay[day] = {};

        // Her öğün için yemekleri ve malzemeleri kontrol et
        mealTypes.forEach(type => {
          const meals = mealPlan[day]?.[type] || [];

          meals.forEach(meal => {
            if (meal.ingredients && Array.isArray(meal.ingredients)) {
              shoppingListByDay[day][meal.name] = meal.ingredients;
            }
          });
        });
      });

      // Alışveriş listesi HTML içeriği
      let shoppingListHTML = '';
      let dayCounter = 0;

      shoppingListHTML += `<div class="shopping-list-container">`;

      // Her gün için alışveriş listesi bölümü
      // 2 sütunlu görünüm için günleri gruplama
      const daysWithMeals = Object.keys(shoppingListByDay).filter(day => {
        const dayMeals = shoppingListByDay[day];
        return Object.keys(dayMeals).length > 0;
      });

      // İki sütun halinde günleri ekle
      for (let i = 0; i < daysWithMeals.length; i += 2) {
        shoppingListHTML += `<div class="shopping-row">`;

        // Sol sütun
        const leftDay = daysWithMeals[i];
        const translatedLeftDay = daysMap[leftDay] || leftDay;
        const leftDayMeals = shoppingListByDay[leftDay];

        shoppingListHTML += `
          <div class="shopping-day-column">
            <h3>${translatedLeftDay}</h3>
        `;

        Object.keys(leftDayMeals).forEach(mealName => {
          const ingredients = leftDayMeals[mealName];

          shoppingListHTML += `
            <div class="meal-item">
              <h4>${mealName}</h4>
              <ul>
          `;

          ingredients.forEach(ingredient => {
            shoppingListHTML += `<li>${ingredient}</li>`;
          });

          shoppingListHTML += `
              </ul>
            </div>
          `;
        });

        shoppingListHTML += `</div>`;

        // Sağ sütun (varsa)
        if (i + 1 < daysWithMeals.length) {
          const rightDay = daysWithMeals[i + 1];
          const translatedRightDay = daysMap[rightDay] || rightDay;
          const rightDayMeals = shoppingListByDay[rightDay];

          shoppingListHTML += `
            <div class="shopping-day-column">
              <h3>${translatedRightDay}</h3>
          `;

          Object.keys(rightDayMeals).forEach(mealName => {
            const ingredients = rightDayMeals[mealName];

            shoppingListHTML += `
              <div class="meal-item">
                <h4>${mealName}</h4>
                <ul>
            `;

            ingredients.forEach(ingredient => {
              shoppingListHTML += `<li>${ingredient}</li>`;
            });

            shoppingListHTML += `
                </ul>
              </div>
            `;
          });

          shoppingListHTML += `</div>`;
        }

        shoppingListHTML += `</div>`;
        dayCounter += i + 1 < daysWithMeals.length ? 2 : 1;
      }

      shoppingListHTML += `</div>`;

      if (dayCounter === 0) {
        shoppingListHTML = `<p>${translate('noMealsWithIngredients')}</p>`;
      }

      // PDF için HTML şablonu
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${translate('pdfTitle')}</title>
            <style>
              body {
                font-family: Helvetica, Arial, sans-serif;
                padding: 20px;
                color: #333;
                line-height: 1.6;
              }
              h1 {
                text-align: center;
                color: #3498db;
                margin-bottom: 30px;
                font-size: 28px;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
              }
              h2 {
                color: #3498db;
                border-bottom: 1px solid #ddd;
                padding-bottom: 8px;
                margin-top: 30px;
                font-size: 22px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                border: 1px solid #ddd;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
              th {
                background-color: #f2f9ff;
                font-weight: bold;
                color: #333;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              tr:hover {
                background-color: #f5f5f5;
              }
              .shopping-list-container {
                display: flex;
                flex-direction: column;
                width: 100%;
              }
              .shopping-row {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                margin-bottom: 25px;
                page-break-inside: avoid;
              }
              .shopping-day-column {
                width: 48%;
                margin-bottom: 20px;
                page-break-inside: avoid;
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              }
              .meal-item {
                margin-bottom: 20px;
                padding-left: 0;
                border-bottom: 1px dashed #ddd;
                padding-bottom: 15px;
              }
              h3 {
                margin-bottom: 15px;
                color: #3498db;
                font-size: 18px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
              }
              h4 {
                margin: 10px 0 5px 0;
                color: #444;
                font-size: 16px;
              }
              ul {
                margin-top: 10px;
                padding-left: 20px;
              }
              li {
                margin-bottom: 5px;
                line-height: 1.4;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #777;
                border-top: 1px solid #eee;
                padding-top: 10px;
              }
              @media print {
                .shopping-day-column, .shopping-row, .recipe {
                  page-break-inside: avoid;
                }
                h1, h2 {
                  page-break-after: avoid;
                }
                table, .shopping-list-container {
                  page-break-inside: auto;
                }
                tr {
                  page-break-inside: avoid;
                }
                thead {
                  display: table-header-group;
                }
              }
            </style>
          </head>
          <body>
            <h1>${translate('pdfTitle')}</h1>

            <h2>${
              translate('mealTypeSimple.breakfast') || 'Meals for the Week'
            }</h2>
            <table>
              <thead>
                <tr>
                  <th>${translate('days.day') || 'Day'}</th>
                  <th>${
                    translate('mealTypeSimple.breakfast') || 'Breakfast'
                  }</th>
                  <th>${translate('mealTypeSimple.lunch') || 'Lunch'}</th>
                  <th>${translate('mealTypeSimple.dinner') || 'Dinner'}</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>

            <h2>${translate('shoppingList')}</h2>
            ${shoppingListHTML}
            
            <div class="footer">
              ${translate('preparedBy')} ${currentUser?.username} | ${translate(
        'date',
      )} ${new Date().toLocaleDateString()}
            </div>
          </body>
        </html>
      `;

      try {
        // PDF oluştur
        const options = {
          html: htmlContent,
          fileName: `YemekPlani-${new Date().toISOString().split('T')[0]}`,
          directory: 'Documents',
          base64: false,
        };

        const file = await RNHTMLtoPDF.convert(options);

        if (file?.filePath) {
          // Paylaşım ekranını aç
          await Share.open({
            url: `file://${file.filePath}`,
            type: 'application/pdf',
            saveToFiles: true,
          });
        } else {
          throw new Error('PDF dosyası oluşturulamadı');
        }
      } catch (error) {
        console.error('PDF oluşturma veya paylaşma hatası:', error);
        Alert.alert('Hata', 'PDF oluşturulurken bir sorun oluştu');
      }

      setIsGeneratingPdf(false);
      setPdfType('');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      Alert.alert('Hata', 'PDF oluşturulurken bir sorun oluştu');
      setIsGeneratingPdf(false);
      setPdfType('');
    }
  };

  // Tarif kitabı PDF'ini oluştur
  const generateRecipeBookPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfType('cookbook');

      // Sadece kişisel tarifler
      const personalRecipes = userMeals.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      // Kişisel tarif yoksa uyarı ver
      if (!personalRecipes || personalRecipes.length === 0) {
        setIsGeneratingPdf(false);
        setPdfType('');
        Alert.alert(
          translate('info') || 'Bilgi',
          translate('noPersonalRecipes') ||
            'Henüz kişisel tarifleriniz bulunmuyor. Önce kendi tariflerinizi eklemelisiniz.',
        );
        return;
      }

      // HTML içeriği
      let recipesHTML = '';

      personalRecipes.forEach((recipe, index) => {
        // Her tarif için HTML oluştur
        recipesHTML += `
          <div class="recipe">
            <h2 class="recipe-title">${recipe.name}</h2>
            <div class="recipe-info">
              <div class="info-item">
                <span class="info-label">${translate('calories')}:</span>
                <span class="info-value">${recipe.calories || '-'} kcal</span>
              </div>
              <div class="info-item">
                <span class="info-label">${translate('prepTime')}:</span>
                <span class="info-value">${recipe.prepTime || '-'} ${translate(
          'minutes',
        )}</span>
              </div>
              <div class="info-item">
                <span class="info-label">${translate(
                  'mealType.mealType',
                )}:</span>
                <span class="info-value">${
                  translate(`mealType.${recipe.type}`) || recipe.type
                }</span>
              </div>
            </div>
            
            <div class="recipe-description">
              <p>${recipe.description || translate('noDescription')}</p>
            </div>
            
            ${
              recipe.ingredients && recipe.ingredients.length > 0
                ? `
              <div class="recipe-ingredients">
                <h3>${translate('ingredients')}</h3>
                <ul>
                  ${recipe.ingredients
                    .map(ingredient => `<li>${ingredient}</li>`)
                    .join('')}
                </ul>
              </div>
            `
                : ''
            }
            
            ${
              recipe.steps && recipe.steps.length > 0
                ? `
              <div class="recipe-steps">
                <h3>${translate('steps')}</h3>
                <ol>
                  ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
              </div>
            `
                : ''
            }
          </div>
          ${
            index < personalRecipes.length - 1
              ? '<div class="recipe-divider"></div>'
              : ''
          }
        `;
      });

      // PDF için HTML şablonu
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${translate('personalRecipeBook')}</title>
            <style>
              body {
                font-family: Helvetica, Arial, sans-serif;
                padding: 20px;
                color: #333;
              }
              .book-title {
                text-align: center;
                color: #007AFF;
                margin-bottom: 30px;
              }
              .book-subtitle {
                text-align: center;
                color: #666;
                margin-bottom: 50px;
                font-style: italic;
              }
              .recipe {
                margin-bottom: 40px;
                page-break-inside: avoid;
              }
              .recipe-title {
                color: #007AFF;
                border-bottom: 2px solid #ddd;
                padding-bottom: 10px;
                margin-top: 30px;
              }
              .recipe-info {
                display: flex;
                flex-direction: column;
                margin: 15px 0;
                background-color: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
              }
              .info-item {
                margin-bottom: 5px;
              }
              .info-label {
                font-weight: bold;
                color: #666;
              }
              .recipe-description {
                margin: 15px 0;
                font-style: italic;
              }
              .recipe-ingredients h3, .recipe-steps h3 {
                color: #555;
                margin-top: 20px;
                margin-bottom: 10px;
              }
              .recipe-divider {
                border-top: 1px dashed #ccc;
                margin: 30px 0;
              }
              ul, ol {
                padding-left: 25px;
              }
              li {
                margin-bottom: 5px;
              }
              @media print {
                .recipe {
                  page-break-inside: avoid;
                }
                .book-title, .book-subtitle {
                  page-break-after: avoid;
                }
                h2.recipe-title {
                  page-break-before: auto;
                  page-break-after: avoid;
                }
                .recipe-info, .recipe-description, .recipe-ingredients, .recipe-steps {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <h1 class="book-title">${translate('personalRecipeBook')}</h1>
            <p class="book-subtitle">
              ${translate('preparedBy')} ${currentUser?.username} | 
              ${translate('date')} ${new Date().toLocaleDateString()}
            </p>
            
            ${recipesHTML}
          </body>
        </html>
      `;

      try {
        // PDF oluştur
        const options = {
          html: htmlContent,
          fileName: `TarifKitabi-${new Date().toISOString().split('T')[0]}`,
          directory: 'Documents',
          base64: false,
        };

        const file = await RNHTMLtoPDF.convert(options);

        if (file?.filePath) {
          // Paylaşım ekranını aç
          await Share.open({
            url: `file://${file.filePath}`,
            type: 'application/pdf',
            saveToFiles: true,
          });
        } else {
          throw new Error('PDF dosyası oluşturulamadı');
        }
      } catch (error) {
        console.error('Tarif kitabı PDF hatası:', error);
        Alert.alert('Hata', 'Tarif kitabı oluşturulurken bir sorun oluştu');
      }

      setIsGeneratingPdf(false);
      setPdfType('');
    } catch (error) {
      console.error('Tarif kitabı hatası:', error);
      Alert.alert('Hata', 'Tarif kitabı oluşturulurken bir sorun oluştu');
      setIsGeneratingPdf(false);
      setPdfType('');
    }
  };

  // Dil seçim modalı
  const renderLanguageModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isLanguageModalVisible}
        onRequestClose={() => setIsLanguageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{translate('selectLanguage')}</Text>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'tr' && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageChange('tr')}>
              <Text
                style={[
                  styles.languageText,
                  language === 'tr' && styles.selectedLanguageText,
                ]}>
                {translate('turkish')}
              </Text>
              {language === 'tr' && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'en' && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageChange('en')}>
              <Text
                style={[
                  styles.languageText,
                  language === 'en' && styles.selectedLanguageText,
                ]}>
                {translate('english')}
              </Text>
              {language === 'en' && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsLanguageModalVisible(false)}>
              <Text style={styles.closeButtonText}>{translate('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color="#007AFF" />
          <Text style={styles.username}>{currentUser?.username}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userMeals && userMeals.length ? userMeals.length : 0}
            </Text>
            <Text style={styles.statLabel}>{translate('personalRecipes')}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {getAllMeals().filter(meal => meal.isDefault).length}
            </Text>
            <Text style={styles.statLabel}>{translate('defaultRecipes')}</Text>
          </View>
        </View>

        {/* Premium Butonu */}
        {!isPremium ? (
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={handlePurchasePremium}
            disabled={isPurchasing}>
            <Ionicons name="star" size={20} color="#fff" />
            <Text style={styles.premiumButtonText}>
              {translate('buyPremium') || "Premium'a Yükselt"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={20} color="#fff" />
            <Text style={styles.premiumBadgeText}>
              {translate('premiumStatus') || 'Premium Statü'}
            </Text>
          </View>
        )}

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsLanguageModalVisible(true)}>
            <Ionicons name="language" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {translate('changeLanguage')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={generateMealPlanPdf}
            disabled={isGeneratingPdf}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {isGeneratingPdf && pdfType === 'mealplan'
                ? translate('generating')
                : translate('exportPlan')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={generateRecipeBookPdf}
            disabled={isGeneratingPdf}>
            <Ionicons name="book" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {isGeneratingPdf && pdfType === 'cookbook'
                ? translate('generating')
                : translate('exportRecipes') || 'Tarif Kitabını Dışa Aktar'}
            </Text>
          </TouchableOpacity>

          {/* Satın Alımları Geri Yükleme Butonu */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRestorePurchases}
            disabled={isRestoring}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {isRestoring
                ? translate('loading')
                : translate('premiumRestoreButton') ||
                  'Satın Alımları Geri Yükle'}
            </Text>
          </TouchableOpacity>
          {/* 
          //Premium Durumunu Sıfırlama Butonu (Sadece Geliştirme İçin)
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearPremiumStatus}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              Premium Durumunu Sıfırla (DEV)
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>{translate('logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AdBanner />

      {renderLanguageModal()}
      {isGeneratingPdf && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{translate('generating')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  content: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    flex: 0.48,
    marginRight: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 6,
    marginHorizontal: 10,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  premiumButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  premiumBadge: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 6,
    marginHorizontal: 10,
    marginVertical: 6,
  },
  premiumBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  actionButtonsContainer: {
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  selectedLanguage: {
    backgroundColor: '#e6f2ff',
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
});

export default ProfileScreen;
