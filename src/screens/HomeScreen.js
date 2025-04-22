import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TextInput,
  Animated,
  ActivityIndicator,
  Platform,
  Alert,
  FlatList,
  PixelRatio,
  Modal,
  Image,
} from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useMeals} from '../context/MealContext';
import {useLanguage} from '../context/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {usePremium} from '../context/PremiumContext';
import {AdBanner} from '../components/AdBanner';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320; // Temel ölçekleme faktörü

// Dinamik font boyutu hesaplama
const normalize = size => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

const HomeScreen = ({navigation}) => {
  const {currentUser, mealPlan, saveMealPlan, getAllMeals} = useMeals();
  const {translate, language} = useLanguage();

  // Çevirilerde kullanmak için gün ve öğün tiplerini ayarla
  const dayNames = {
    Pazartesi: translate('days.monday'),
    Salı: translate('days.tuesday'),
    Çarşamba: translate('days.wednesday'),
    Perşembe: translate('days.thursday'),
    Cuma: translate('days.friday'),
    Cumartesi: translate('days.saturday'),
    Pazar: translate('days.sunday'),
  };

  // Öğün tipleri için çeviriler
  const mealTypeTranslations = {
    kahvaltı: translate('mealType.breakfast'),
    öğle: translate('mealType.lunch'),
    akşam: translate('mealType.dinner'),
  };

  const [selectedDay, setSelectedDay] = useState('Pazartesi');
  const [displayedDay, setDisplayedDay] = useState(translate('days.monday'));
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [draggedMeal, setDraggedMeal] = useState(null);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [dragStarted, setDragStarted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: translate('all'),
    source: translate('allMeals'),
  });
  const pan = useRef(new Animated.ValueXY()).current;
  const scrollViewRef = useRef(null);

  // Öğün alanları için referanslar
  const mealTypeRefs = useRef({
    kahvaltı: null,
    öğle: null,
    akşam: null,
  });
  const mealRefs = useRef({});

  const days = [
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
    'Pazar',
  ];
  const mealTypes = ['kahvaltı', 'öğle', 'akşam'];

  // Dil değişikliğini takip et
  useEffect(() => {
    setDisplayedDay(dayNames[selectedDay]);
    // Filtre metinlerini güncelle
    setActiveFilters({
      type: translate('all'),
      source: translate('allMeals'),
    });
  }, [language]);

  // filterMeals fonksiyonunu useCallback ile sarmak
  const filterMeals = useCallback(() => {
    // getAllMeals ile tüm yemekleri al (filtrelenmiş olarak)
    let result = getAllMeals();

    // Null veya undefined durumunu kontrol et
    if (!result) {
      result = [];
    }

    // Arama sorgusuna göre filtrele
    if (searchQuery) {
      result = result.filter(meal =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Yemek tipine göre filtrele
    if (activeFilters.type !== translate('all')) {
      // Filtreleri doğru öğün tiplerine dönüştür
      const filterToType = {
        [translate('mealTypeSimple.breakfast')]: 'kahvaltı',
        [translate('mealTypeSimple.lunch')]: 'öğle',
        [translate('mealTypeSimple.dinner')]: 'akşam',
      };

      const typeFilter = filterToType[activeFilters.type];
      if (typeFilter) {
        result = result.filter(meal => meal.type === typeFilter);
      }
    }

    // Kaynak tipine göre filtrele
    if (activeFilters.source === translate('default')) {
      setFilteredMeals(result.filter(meal => meal.isDefault));
    } else if (activeFilters.source === translate('personal')) {
      setFilteredMeals(result.filter(meal => !meal.isDefault));
    } else {
      setFilteredMeals(result);
    }
  }, [activeFilters, searchQuery, getAllMeals, translate]);

  useEffect(() => {
    filterMeals();
  }, [searchQuery, activeFilters, filterMeals]);

  // Eğer ilk kez açılıyorsa ipucu göster
  useEffect(() => {
    const checkTutorialShown = async () => {
      try {
        const tutorialShown = await AsyncStorage.getItem('tutorialShown');

        if (!tutorialShown) {
          // Eğer daha önce gösterilmemişse göster
          setTimeout(() => {
            setShowTutorial(true);
          }, 500);
        }
      } catch (error) {
        console.error('Tutorial gösterim kontrolü hatası:', error);
      }
    };

    checkTutorialShown();
  }, []);

  useEffect(() => {
    // Ekran odaklandığında filtrelenmiş yemekleri güncelle
    const unsubscribe = navigation.addListener('focus', () => {
      filterMeals();
    });

    // Component kaldırıldığında dinleyiciyi temizle
    return unsubscribe;
  }, [navigation, filterMeals]);

  const handleCloseTutorial = async () => {
    try {
      // Tutorialın gösterildiğini kaydet
      await AsyncStorage.setItem('tutorialShown', 'true');
      setShowTutorial(false);
    } catch (error) {
      console.error('Tutorial kaydedilirken hata:', error);
      setShowTutorial(false);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);

    // iOS haptic feedback
    if (Platform.OS === 'ios') {
      ReactNativeHapticFeedback.trigger('selection');
    }
  };

  const handleFilterSelect = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));

    // iOS haptic feedback
    if (Platform.OS === 'ios') {
      ReactNativeHapticFeedback.trigger('selection');
    }
  };

  const handleRandomMeal = async () => {
    try {
      // Öğün tipine ve filtreye göre yemekleri al
      const allMeals = getAllMeals();

      // Yemek listesi boş mu kontrol et
      if (!allMeals || allMeals.length === 0) {
        Alert.alert(translate('warning'), translate('noMealsForRandom'));
        return;
      }

      // Mevcut yemek planını kopyala
      const updatedMealPlan = {...mealPlan};

      // Öğün tiplerine göre yemekleri gruplandır
      const mealsByType = {
        kahvaltı: allMeals.filter(meal => meal.type === 'kahvaltı'),
        öğle: allMeals.filter(meal => meal.type === 'öğle'),
        akşam: allMeals.filter(meal => meal.type === 'akşam'),
      };

      // Filtre uygula (eğer varsa)
      if (activeFilters.source === translate('default')) {
        mealsByType.kahvaltı = mealsByType.kahvaltı.filter(
          meal => meal.isDefault,
        );
        mealsByType.öğle = mealsByType.öğle.filter(meal => meal.isDefault);
        mealsByType.akşam = mealsByType.akşam.filter(meal => meal.isDefault);
      } else if (activeFilters.source === translate('personal')) {
        mealsByType.kahvaltı = mealsByType.kahvaltı.filter(
          meal => !meal.isDefault,
        );
        mealsByType.öğle = mealsByType.öğle.filter(meal => !meal.isDefault);
        mealsByType.akşam = mealsByType.akşam.filter(meal => !meal.isDefault);
      }

      // Her öğün tipi için kullanılmış yemekleri takip et
      const usedMealsByType = {
        kahvaltı: [],
        öğle: [],
        akşam: [],
      };

      // Tüm günler için rastgele yemek seç
      days.forEach(day => {
        // Her gün için plan yoksa oluştur
        if (!updatedMealPlan[day]) {
          updatedMealPlan[day] = {};
        }

        // Her öğün tipi için yemek seç
        mealTypes.forEach(type => {
          // Öğün için yemek listesi oluştur veya güncelle
          if (!updatedMealPlan[day][type]) {
            updatedMealPlan[day][type] = [];
          }

          // Mevcut yemek listesini temizle
          updatedMealPlan[day][type] = [];

          // Bu öğün tipi için uygun yemekler var mı kontrol et
          if (mealsByType[type] && mealsByType[type].length > 0) {
            // Mevcut kullanılmamış yemekleri filtrele (mümkün olduğunca aynı yemeği tekrar kullanmamaya çalış)
            const availableMeals = mealsByType[type].filter(
              meal =>
                !usedMealsByType[type].some(
                  usedMeal => usedMeal.id === meal.id,
                ) || usedMealsByType[type].length >= mealsByType[type].length, // Eğer tüm yemekler kullanıldıysa, tekrar kullanmaya izin ver
            );

            // Eğer kullanılabilir yemek yoksa tüm yemeklerden seç
            const mealsToSelectFrom =
              availableMeals.length > 0 ? availableMeals : mealsByType[type];

            if (mealsToSelectFrom.length > 0) {
              // Rastgele yemek seç
              const randomIndex = Math.floor(
                Math.random() * mealsToSelectFrom.length,
              );
              const selectedMeal = mealsToSelectFrom[randomIndex];

              // Yemeği plana ekle
              updatedMealPlan[day][type].push(selectedMeal);

              // Yemeği kullanılmış olarak işaretle
              usedMealsByType[type].push(selectedMeal);
            }
          }
        });
      });

      // State'i güncelle
      await saveMealPlan(updatedMealPlan);

      // Haptic feedback
      if (Platform.OS === 'ios') {
        ReactNativeHapticFeedback.trigger('notification');
      }

      Alert.alert(translate('success'), translate('randomMealsAdded'));
    } catch (error) {
      console.error('Rastgele plan oluşturma hatası:', error);
      Alert.alert(translate('warning'), translate('errorAddingMeals'));
    }
  };

  const clearMealPlan = () => {
    // Onay diyaloğu göster
    Alert.alert(translate('confirm'), translate('clearMealPlanConfirm'), [
      {text: translate('cancel'), style: 'cancel'},
      {
        text: translate('clear'),
        style: 'destructive',
        onPress: async () => {
          try {
            // Boş bir plan oluştur
            const emptyPlan = {};

            // State'i güncelle
            await saveMealPlan(emptyPlan);

            // Haptic feedback
            if (Platform.OS === 'ios') {
              ReactNativeHapticFeedback.trigger('notification');
            }

            Alert.alert(translate('info'), translate('mealPlanCleared'));
          } catch (error) {
            console.error('Plan temizleme hatası:', error);
            Alert.alert(translate('warning'), translate('errorClearingPlan'));
          }
        },
      },
    ]);
  };

  const handleDayChange = direction => {
    const currentIndex = days.indexOf(selectedDay);
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % days.length;
    } else {
      newIndex = (currentIndex - 1 + days.length) % days.length;
    }

    const newDay = days[newIndex];
    setSelectedDay(newDay);
    setDisplayedDay(dayNames[newDay]);

    // iOS haptic feedback
    if (Platform.OS === 'ios') {
      ReactNativeHapticFeedback.trigger('selection');
    }
  };

  const handleDropToMealPlan = async (meal, type) => {
    try {
      // Mevcut planı kopyala
      const updatedPlan = JSON.parse(JSON.stringify(mealPlan)); // Derin kopya

      // Günü ve öğünü kontrol et
      if (!updatedPlan[selectedDay]) {
        updatedPlan[selectedDay] = {};
      }
      if (!updatedPlan[selectedDay][type]) {
        updatedPlan[selectedDay][type] = [];
      }

      // Yemeği ekle (eğer zaten yoksa)
      if (!updatedPlan[selectedDay][type].some(m => m.id === meal.id)) {
        updatedPlan[selectedDay][type].push(meal);

        // State'i güncelle ve AsyncStorage'a kaydet
        await saveMealPlan(updatedPlan);

        // iOS haptic feedback
        if (Platform.OS === 'ios') {
          ReactNativeHapticFeedback.trigger('selection');
        }
      } else {
        // İsteğe bağlı: Yemek zaten varsa kullanıcıya bildirim göster
        // Alert.alert(translate('warning'), translate('mealAlreadyExists'));
      }

      // Sürükleme durumunu sıfırla
      setDraggedMeal(null);
      setActiveDropZone(null);
      setDragStarted(false);
    } catch (error) {
      console.error('Yemek planına ekleme hatası:', error);
      Alert.alert(translate('warning'), translate('errorAddingToMealPlan'));
    }
  };

  const handleRemoveMeal = async (day, mealType, mealId) => {
    try {
      const updatedMealPlan = {...mealPlan};

      if (!updatedMealPlan[day]) {
        throw new Error('Gün bulunamadı');
      }

      // Eğer mealId belirtilmişse sadece o yemeği sil, yoksa tüm öğünü sil
      if (mealId && Array.isArray(updatedMealPlan[day][mealType])) {
        updatedMealPlan[day][mealType] = updatedMealPlan[day][mealType].filter(
          meal => meal.id !== mealId,
        );

        // Eğer liste boş kaldıysa, öğün tipini tamamen sil
        if (updatedMealPlan[day][mealType].length === 0) {
          delete updatedMealPlan[day][mealType];
        }
      } else {
        // Tüm öğün tipini sil
        delete updatedMealPlan[day][mealType];
      }

      // State'i ve AsyncStorage'ı güncelle
      await saveMealPlan(updatedMealPlan);

      // Haptic feedback
      if (Platform.OS === 'ios') {
        ReactNativeHapticFeedback.trigger('notification');
      }
    } catch (error) {
      console.error('Yemek kaldırma hatası:', error);
      Alert.alert(translate('warning'), translate('errorRemovingMeal'));
    }
  };

  const checkDropZone = (x, y) => {
    let foundDropZone = null;

    for (const type of mealTypes) {
      const ref = mealTypeRefs.current[type];
      if (!ref) continue;

      ref.measure((fx, fy, width, height, pageX, pageY) => {
        if (x > pageX && x < pageX + width && y > pageY && y < pageY + height) {
          foundDropZone = type;
        }
      });
    }

    if (foundDropZone !== activeDropZone) {
      setActiveDropZone(foundDropZone);

      // Haptic feedback (iOS)
      if (Platform.OS === 'ios' && foundDropZone) {
        ReactNativeHapticFeedback.trigger('selection');
      }
    }
  };

  // Sürükleme jestleri
  const panGesture = Gesture.Pan()
    .activateAfterLongPress(300) // Uzun basma sonrası aktif olsun
    .onStart(() => {
      setDragStarted(true);
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
      pan.setValue({x: 0, y: 0});
    })
    .onUpdate(event => {
      pan.x.setValue(event.translationX);
      pan.y.setValue(event.translationY);
      checkDropZone(event.absoluteX, event.absoluteY);

      // Auto-scroll when near edges
      if (scrollViewRef.current) {
        const scrollThreshold = 100;
        const currentOffset = scrollViewRef.current._contentOffset?.y || 0;
        const contentHeight = scrollViewRef.current._contentSize?.height || 0;
        const scrollViewHeight =
          scrollViewRef.current._scrollViewHeight?.height || 0;

        if (event.absoluteY < scrollThreshold) {
          // Scroll up
          scrollViewRef.current.scrollToOffset({
            offset: Math.max(0, currentOffset - 10),
            animated: false,
          });
        } else if (event.absoluteY > scrollViewHeight - scrollThreshold) {
          // Scroll down
          scrollViewRef.current.scrollToOffset({
            offset: Math.min(
              contentHeight - scrollViewHeight,
              currentOffset + 10,
            ),
            animated: false,
          });
        }
      }
    })
    .onEnd(() => {
      pan.flattenOffset();
      if (activeDropZone && draggedMeal) {
        handleDropToMealPlan(draggedMeal, activeDropZone);
      }
      pan.setValue({x: 0, y: 0});
      setDraggedMeal(null);
      setActiveDropZone(null);
      setDragStarted(false);
    });

  const getMealTypeStyle = type => {
    switch (type) {
      case 'kahvaltı':
        return {
          backgroundColor: '#FEE9B2',
          title: translate('mealTypeSimple.breakfast'),
        };
      case 'öğle':
        return {
          backgroundColor: '#B8F3C5',
          title: translate('mealTypeSimple.lunch'),
        };
      case 'akşam':
        return {
          backgroundColor: '#FCC5C5',
          title: translate('mealTypeSimple.dinner'),
        };
      default:
        return {
          backgroundColor: '#E1E8F0',
          title: '',
        };
    }
  };

  const renderMealCell = type => {
    const style = getMealTypeStyle(type);

    return (
      <View
        style={[
          styles.mealCell,
          {backgroundColor: style.backgroundColor},
          activeDropZone === type
            ? {borderWidth: 2, borderColor: '#007AFF'}
            : {},
        ]}
        ref={ref => (mealTypeRefs.current[type] = ref)}>
        <Text style={styles.mealTypeTitle}>{style.title}</Text>

        {mealPlan && mealPlan[selectedDay] && mealPlan[selectedDay][type] ? (
          <View style={styles.mealsRowContainer}>
            {Array.isArray(mealPlan[selectedDay][type]) ? (
              mealPlan[selectedDay][type].map(meal => (
                <View key={meal.id} style={styles.mealItemCard}>
                  <Text style={styles.mealNameSmall} numberOfLines={1}>
                    {meal.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButtonSmall}
                    onPress={() =>
                      handleRemoveMeal(selectedDay, type, meal.id)
                    }>
                    <Ionicons name="close-circle" size={16} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.mealItemCard}>
                <Text style={styles.mealNameSmall} numberOfLines={1}>
                  {mealPlan[selectedDay][type].name}
                </Text>
                <TouchableOpacity
                  style={styles.removeButtonSmall}
                  onPress={() => handleRemoveMeal(selectedDay, type, null)}>
                  <Ionicons name="close-circle" size={16} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            )}

            {Array.isArray(mealPlan[selectedDay][type]) &&
              mealPlan[selectedDay][type].length < 3 && (
                <View style={styles.addMoreContainer}>
                  <Text style={styles.addMoreText}>
                    {translate('dragAndDrop')}
                  </Text>
                </View>
              )}
          </View>
        ) : (
          <View style={styles.emptyMealSlot}>
            <Text style={styles.emptyMealText}>{translate('dragAndDrop')}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderDayPlan = () => (
    <View style={styles.dayPlanContainer}>
      <View style={styles.dayNavigation}>
        <View style={styles.dayArrowFixed}>
          <TouchableOpacity
            style={styles.dayArrow}
            onPress={() => handleDayChange('prev')}>
            <Ionicons name="chevron-back" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.daySelectorCenter}>
          <Text style={styles.selectedDayText}>{displayedDay}</Text>
        </View>
        <View style={styles.dayArrowFixed}>
          <TouchableOpacity
            style={styles.dayArrow}
            onPress={() => handleDayChange('next')}>
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.dayContent}
        contentContainerStyle={styles.dayContentContainer}
        showsVerticalScrollIndicator={false}>
        {mealTypes.map(type => (
          <View key={type} style={styles.mealSection}>
            {renderMealCell(type)}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderMealItem = (item, index) => {
    // useRef ile gesture tanımlamak yerine direkt tanımla
    const longPressGesture = Gesture.LongPress()
      .minDuration(200)
      .onStart(() => {
        if (Platform.OS === 'ios') {
          ReactNativeHapticFeedback.trigger('impact');
        }
        setDraggedMeal(item);
        // Sürükleme başlandığında state güncelle
        setDragStarted(true);
      });

    return (
      <GestureDetector gesture={longPressGesture}>
        <TouchableOpacity
          style={styles.mealCard}
          onPress={() => {
            if (!dragStarted) {
              navigation.navigate('MealDetail', {meal: item});
            }
          }}
          key={item.id}>
          <View style={styles.mealCardContent}>
            <View style={styles.mealCardHeader}>
              <Text style={styles.mealCardName} numberOfLines={1}>
                {item.name}
              </Text>
              <View
                style={[
                  styles.mealCardType,
                  {
                    backgroundColor:
                      item.type === 'kahvaltı'
                        ? '#FFE4B5'
                        : item.type === 'öğle'
                        ? '#98FB98'
                        : '#FFB6C1',
                  },
                ]}>
                <Text style={styles.mealCardTypeText}>
                  {translate(
                    `mealTypeSimple.${
                      item.type === 'kahvaltı'
                        ? 'breakfast'
                        : item.type === 'öğle'
                        ? 'lunch'
                        : 'dinner'
                    }`,
                  )}
                </Text>
              </View>
            </View>
            <Text style={styles.mealCardDescription} numberOfLines={2}>
              {item.description || ''}
            </Text>
            <View style={styles.mealCardInfo}>
              <Text style={styles.mealCardInfoText}>{item.calories} kcal</Text>
              <Text style={styles.mealCardInfoText}>
                {item.prepTime || item.duration} dk
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </GestureDetector>
    );
  };

  const renderDraggedItem = () => {
    if (!draggedMeal) return null;

    // useRef ile gesture tanımlamak yerine direkt tanımla
    const panGestureObj = Gesture.Pan()
      .onUpdate(e => {
        pan.x.setValue(e.translationX);
        pan.y.setValue(e.translationY);
        // Drop zone'u kontrol et
        checkDropZone(e.absoluteX, e.absoluteY);
      })
      .onEnd(() => {
        if (activeDropZone && draggedMeal) {
          handleDropToMealPlan(draggedMeal, activeDropZone);
        }
        pan.setValue({x: 0, y: 0});
        setDraggedMeal(null);
        setActiveDropZone(null);
        setDragStarted(false);
      });

    return (
      <GestureDetector gesture={panGestureObj}>
        <Animated.View
          style={[
            styles.draggedItem,
            {
              transform: [{translateX: pan.x}, {translateY: pan.y}],
            },
          ]}>
          <View style={styles.mealCardContent}>
            <View style={styles.mealCardHeader}>
              <Text style={styles.mealCardName} numberOfLines={1}>
                {draggedMeal.name}
              </Text>
            </View>
            <Text style={styles.mealCardDescription} numberOfLines={1}>
              {draggedMeal.description || ''}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  };

  // Sürükle-bırak rehber modalı
  const renderTutorialModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showTutorial}
        onRequestClose={handleCloseTutorial}>
        <View style={styles.modalOverlay}>
          <View style={styles.tutorialContainer}>
            <View style={styles.tutorialHeader}>
              <Text style={styles.tutorialTitle}>
                {translate('dragAndDrop')}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseTutorial}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.tutorialStep}>
              <View style={styles.tutorialStepNumber}>
                <Text style={styles.tutorialStepNumberText}>1</Text>
              </View>
              <View style={styles.tutorialStepContent}>
                <Text style={styles.tutorialStepText}>
                  {translate('longPressStep')}
                </Text>
              </View>
            </View>

            <View style={styles.tutorialStep}>
              <View style={styles.tutorialStepNumber}>
                <Text style={styles.tutorialStepNumberText}>2</Text>
              </View>
              <View style={styles.tutorialStepContent}>
                <Text style={styles.tutorialStepText}>
                  {translate('dragStep')}
                </Text>
              </View>
            </View>

            <View style={styles.tutorialStep}>
              <View style={styles.tutorialStepNumber}>
                <Text style={styles.tutorialStepNumberText}>3</Text>
              </View>
              <View style={styles.tutorialStepContent}>
                <Text style={styles.tutorialStepText}>
                  {translate('dropStep')}
                </Text>
              </View>
            </View>

            <View style={styles.tutorialImageContainer}>
              <Ionicons
                name="hand-left"
                size={24}
                color="#007AFF"
                style={styles.handIcon}
              />
              <Ionicons name="arrow-forward" size={20} color="#666" />
              <View style={[styles.mealBoxExample, styles.breakfastType]}>
                <Text style={styles.mealBoxExampleText}>
                  {translate('breakfast')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.tutorialButton}
              onPress={handleCloseTutorial}>
              <Text style={styles.tutorialButtonText}>
                {translate('understood')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{translate('appName')}</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          {renderDayPlan()}

          <View style={styles.bottomActionsContainer}>
            <View style={styles.bottomActionButtonsWrapper}>
              <TouchableOpacity
                style={styles.addMealButtonLarge}
                onPress={() => navigation.navigate('AddMeal')}>
                <Text style={styles.addMealButtonText}>
                  {translate('addMeal').toUpperCase()}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.iconButtonRound}
                  onPress={handleRandomMeal}>
                  <Ionicons name="shuffle" size={24} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButtonRound}
                  onPress={clearMealPlan}>
                  <Ionicons name="trash-outline" size={24} color="#ff3b30" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButtonRound}
                  onPress={() => setShowTutorial(true)}>
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color="#5856D6"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={translate('searchMeal')}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={styles.filterButton}
                onPress={toggleFilters}>
                <Text style={styles.filterButtonText}>
                  {translate('filter')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showFilters && (
            <View style={styles.filtersContainer}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {translate('mealType')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterRowContent}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      activeFilters.type === translate('all') &&
                        styles.activeFilterChip,
                    ]}
                    onPress={() =>
                      handleFilterSelect('type', translate('all'))
                    }>
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilters.type === translate('all') &&
                          styles.activeFilterText,
                      ]}>
                      {translate('all')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      styles.breakfastChip,
                      activeFilters.type ===
                        translate('mealTypeSimple.breakfast') &&
                        styles.activeFilterChip,
                    ]}
                    onPress={() =>
                      handleFilterSelect(
                        'type',
                        translate('mealTypeSimple.breakfast'),
                      )
                    }>
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilters.type ===
                          translate('mealTypeSimple.breakfast') &&
                          styles.activeFilterText,
                      ]}>
                      {translate('mealTypeSimple.breakfast')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      styles.lunchChip,
                      activeFilters.type ===
                        translate('mealTypeSimple.lunch') &&
                        styles.activeFilterChip,
                    ]}
                    onPress={() =>
                      handleFilterSelect(
                        'type',
                        translate('mealTypeSimple.lunch'),
                      )
                    }>
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilters.type ===
                          translate('mealTypeSimple.lunch') &&
                          styles.activeFilterText,
                      ]}>
                      {translate('mealTypeSimple.lunch')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      styles.dinnerChip,
                      activeFilters.type ===
                        translate('mealTypeSimple.dinner') &&
                        styles.activeFilterChip,
                    ]}
                    onPress={() =>
                      handleFilterSelect(
                        'type',
                        translate('mealTypeSimple.dinner'),
                      )
                    }>
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilters.type ===
                          translate('mealTypeSimple.dinner') &&
                          styles.activeFilterText,
                      ]}>
                      {translate('mealTypeSimple.dinner')}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {translate('source')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterRowContent}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      activeFilters.source === translate('allMeals') &&
                        styles.activeFilterChip,
                    ]}
                    onPress={() =>
                      handleFilterSelect('source', translate('allMeals'))
                    }>
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilters.source === translate('allMeals') &&
                          styles.activeFilterText,
                      ]}>
                      {translate('allMeals')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      activeFilters.source === translate('default') &&
                        styles.activeFilterChip,
                    ]}
                    onPress={() =>
                      handleFilterSelect('source', translate('default'))
                    }>
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilters.source === translate('default') &&
                          styles.activeFilterText,
                      ]}>
                      {translate('default')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      activeFilters.source === translate('personal') &&
                        styles.activeFilterChip,
                    ]}
                    onPress={() =>
                      handleFilterSelect('source', translate('personal'))
                    }>
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilters.source === translate('personal') &&
                          styles.activeFilterText,
                      ]}>
                      {translate('personal')}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          )}

          {/* Yemek listesi */}
          <FlatList
            data={filteredMeals}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => renderMealItem(item, index)}
            numColumns={2}
            contentContainerStyle={styles.mealListContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={60} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  {translate('noMealsFound')}
                </Text>
              </View>
            )}
          />
        </View>

        <AdBanner />

        {/* Sürüklenen öğe */}
        {draggedMeal && renderDraggedItem()}

        <Modal visible={showTutorial} transparent={true} animationType="fade">
          {renderTutorialModal()}
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  bottomActionsContainer: {
    padding: 10,
  },
  bottomActionButtonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addMealButtonLarge: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  addMealButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: normalize(15),
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 6,
  },
  iconButtonRound: {
    padding: 10,
    borderRadius: 25,
    marginHorizontal: 5,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: normalize(14),
  },
  filterButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: normalize(12),
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  filterRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  filterChip: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
  },
  breakfastChip: {
    backgroundColor: '#FFE4B5',
  },
  lunchChip: {
    backgroundColor: '#98FB98',
  },
  dinnerChip: {
    backgroundColor: '#FFB6C1',
  },
  mealListContent: {
    padding: 10,
  },
  planSection: {
    height: SCREEN_HEIGHT * 0.4,
    minHeight: 180,
    maxHeight: 250,
  },
  mealListSection: {
    flex: 1,
  },
  dayPlanContainer: {
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: SCREEN_HEIGHT * 0.35,
  },
  dayNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  dayArrowFixed: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelectorCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayArrow: {
    padding: 6,
  },
  daySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  selectedDayText: {
    fontSize: normalize(15),
    fontWeight: '600',
    marginHorizontal: 12,
  },
  dayContent: {
    padding: 8,
    flexGrow: 1,
  },
  dayContentContainer: {
    flexGrow: 1,
  },
  mealSection: {
    marginBottom: 8,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealTypeText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#555',
    textTransform: 'capitalize',
  },
  mealCell: {
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 8,
    marginTop: 2,
    minHeight: 40,
    maxHeight: 60,
  },
  mealTypeTitle: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#555',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  mealsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  mealItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 2,
    marginBottom: 4,
    flex: 1,
    maxWidth: '31%',
    minWidth: '31%',
    height: 24,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  addMoreContainer: {
    flex: 1,
    maxWidth: '31%',
    minWidth: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    height: 24,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 2,
  },
  mealNameSmall: {
    fontSize: normalize(10),
    fontWeight: '500',
    flex: 1,
  },
  removeButtonSmall: {
    padding: 2,
  },
  addMoreText: {
    fontSize: normalize(9),
    color: '#007AFF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  mealName: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyMealSlot: {
    backgroundColor: '#f8f9fa',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    minHeight: 40,
  },
  emptyMealText: {
    color: '#666',
    fontSize: normalize(9),
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#888',
    fontSize: normalize(14),
    textAlign: 'center',
    marginTop: 10,
  },
  mealCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  mealCardContent: {
    padding: 10,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  mealCardName: {
    fontSize: normalize(14),
    fontWeight: '600',
    flex: 1,
  },
  mealCardType: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  mealCardTypeText: {
    fontSize: normalize(9),
    fontWeight: '600',
    color: '#333',
  },
  mealCardDescription: {
    fontSize: normalize(12),
    color: '#666',
    marginBottom: 8,
    minHeight: 32,
  },
  mealCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealCardInfoText: {
    fontSize: normalize(10),
    color: '#888',
  },
  draggedItem: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
    left: SCREEN_WIDTH / 4,
    top: SCREEN_HEIGHT / 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tutorialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tutorialTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#007AFF',
  },
  closeButton: {
    padding: 5,
  },
  tutorialStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tutorialStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tutorialStepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  tutorialStepContent: {
    flex: 1,
  },
  tutorialStepText: {
    fontSize: normalize(14),
    color: '#333',
    lineHeight: 20,
  },
  tutorialImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  handIcon: {
    marginRight: 15,
  },
  mealBoxExample: {
    marginLeft: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mealBoxExampleText: {
    fontWeight: '600',
    color: '#333',
  },
  tutorialButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  tutorialButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: normalize(15),
  },
  breakfastType: {
    backgroundColor: '#FFE4B5',
  },
  lunchType: {
    backgroundColor: '#98FB98',
  },
  dinnerType: {
    backgroundColor: '#FFB6C1',
  },
  defaultType: {
    backgroundColor: '#D3D3D3',
  },
});

export default HomeScreen;
