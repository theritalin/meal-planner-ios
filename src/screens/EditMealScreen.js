import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {useMeals} from '../context/MealContext';
import {useLanguage} from '../context/LanguageContext';
import {DEFAULT_LANGUAGE} from '../utils/translations';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EditMealScreen = ({route, navigation}) => {
  const {meal} = route.params;
  const {updateMeal} = useMeals();
  const {translate, language, translations} = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Add useEffect for debugging language
  useEffect(() => {
    console.log('EditMealScreen Current Language:', language);
  }, [language]);

  // mealTypes dizisini bileşen içinde tanımla, sabit İngilizce etiketlerle
  const mealTypes = React.useMemo(() => {
    // Artık dil veya çeviriye bağımlı değil
    return [
      {
        // key: "mealType.breakfast",
        label: 'Breakfast', // Sabit İngilizce etiket
        value: 'kahvaltı', // Değer Türkçe kalmalı
        show: true,
      },
      {
        // key: "mealType.lunch",
        label: 'Lunch', // Sabit İngilizce etiket
        value: 'öğle', // Değer Türkçe kalmalı
        show: true,
      },
      {
        // key: "mealType.dinner",
        label: 'Dinner', // Sabit İngilizce etiket
        value: 'akşam', // Değer Türkçe kalmalı
        show: true,
      },
    ];
  }, []); // Bağımlılık yok, sadece bir kere oluşturulacak

  // ingredients değerini başlangıçta string dizisine dönüştürüyoruz
  const processIngredients = ingredientsData => {
    if (!ingredientsData || !Array.isArray(ingredientsData)) return [];

    return ingredientsData.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return `${item.amount || ''} ${item.unit || ''} ${
          item.name || ''
        }`.trim();
      }
      return String(item);
    });
  };

  // steps değerini string dizisine dönüştürüyoruz
  const processSteps = stepsData => {
    if (!stepsData || !Array.isArray(stepsData)) return [];

    return stepsData.map(step => {
      if (typeof step === 'string') return step;
      if (typeof step === 'object' && step !== null) {
        return JSON.stringify(step);
      }
      return String(step);
    });
  };

  const [formData, setFormData] = useState({
    name: meal.name || '',
    description: meal.description || '',
    calories: meal.calories?.toString() || '0',
    prepTime: meal.prepTime?.toString() || '0',
    type: meal.type || 'kahvaltı',
    ingredients: processIngredients(meal.ingredients) || [],
    steps: processSteps(meal.steps) || [],
  });

  const [newIngredient, setNewIngredient] = useState('');
  const [newStep, setNewStep] = useState('');

  // Yeni malzeme için girdi alanları
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientAmount, setNewIngredientAmount] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('');

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert(translate('error'), translate('nameError'));
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert(translate('error'), translate('descriptionError'));
      return false;
    }
    if (isNaN(Number(formData.calories)) || Number(formData.calories) <= 0) {
      Alert.alert(translate('error'), translate('caloriesError'));
      return false;
    }
    if (isNaN(Number(formData.prepTime)) || Number(formData.prepTime) <= 0) {
      Alert.alert(translate('error'), translate('prepTimeError'));
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedMeal = {
        ...meal,
        ...formData,
        calories: Number(formData.calories),
        prepTime: Number(formData.prepTime),
      };

      const result = await updateMeal(updatedMeal);
      if (result) {
        Alert.alert(translate('success'), translate('updateMealSuccess'), [
          {
            text: translate('cancel'),
            onPress: () => navigation.navigate('MealDetail', {meal: result}),
          },
        ]);
      } else {
        Alert.alert(translate('error'), translate('updateMealError'));
      }
    } catch (error) {
      console.error('Yemek güncelleme hatası:', error);
      Alert.alert(translate('error'), translate('updateMealError'));
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    if (newIngredientName.trim() === '') {
      Alert.alert(translate('error'), translate('ingredientError'));
      return;
    }

    // Miktar, birim ve ad birleştirilerek tek bir string oluştur
    const ingredientString = `${newIngredientAmount || ''} ${
      newIngredientUnit || ''
    } ${newIngredientName}`.trim();

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ingredientString],
    });

    // Girdi alanlarını temizle
    setNewIngredientName('');
    setNewIngredientAmount('');
    setNewIngredientUnit('');
  };

  const removeIngredient = index => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  };

  const addStep = () => {
    if (newStep.trim() === '') {
      Alert.alert(translate('error'), translate('stepError'));
      return;
    }
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep.trim()],
    });
    setNewStep('');
  };

  const removeStep = index => {
    const updatedSteps = [...formData.steps];
    updatedSteps.splice(index, 1);
    setFormData({
      ...formData,
      steps: updatedSteps,
    });
  };

  const renderTypeSelector = () => {
    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>{translate('mealTypeLabel')}</Text>
        <TouchableOpacity
          style={styles.typeSelector}
          onPress={() => setShowTypeModal(true)}>
          <Text style={styles.typeSelectorText}>
            {/* Seçili öğenin sabit etiketini göster */}
            {mealTypes.find(t => t.value === formData.type)?.label ||
              'Select Meal Type'}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={showTypeModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTypeModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Modal başlığını çeviriyoruz */}
              <Text style={styles.modalTitle}>
                {translate('selectMealType')}
              </Text>
              {mealTypes
                .filter(item => item.show)
                .map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData({...formData, type: item.value});
                      setShowTypeModal(false);
                    }}>
                    <Text
                      style={[
                        styles.modalItemText,
                        formData.type === item.value &&
                          styles.selectedModalItemText,
                      ]}>
                      {/* Modal içinde de sabit etiketi göster */}
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTypeModal(false)}>
                {/* İptal butonunu çeviriyoruz */}
                <Text style={styles.modalCloseButtonText}>
                  {translate('cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>{translate('recipeName')}</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={text => setFormData({...formData, name: text})}
            placeholder={translate('enterRecipeName')}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translate('description')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={text => setFormData({...formData, description: text})}
            placeholder={translate('enterDescription')}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translate('caloriesKcal')}</Text>
          <TextInput
            style={styles.input}
            value={formData.calories}
            onChangeText={text => setFormData({...formData, calories: text})}
            keyboardType="numeric"
            placeholder={translate('enterCalories')}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translate('preparationTime')}</Text>
          <TextInput
            style={styles.input}
            value={formData.prepTime}
            onChangeText={text => setFormData({...formData, prepTime: text})}
            keyboardType="numeric"
            placeholder={translate('enterPrepTime')}
          />
        </View>

        {renderTypeSelector()}

        {/* Malzemeler Bölümü */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>{translate('ingredients')}</Text>

          <View style={styles.listContainer}>
            {Array.isArray(formData.ingredients) &&
              formData.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.listItemContainer}>
                  <Text style={styles.listItemText}>{ingredient}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeIngredient(index)}>
                    <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.ingredientUnitInput]}
              value={newIngredientAmount}
              onChangeText={setNewIngredientAmount}
              placeholder={translate('amount')}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.ingredientUnitInput]}
              value={newIngredientUnit}
              onChangeText={setNewIngredientUnit}
              placeholder={translate('unit')}
            />
            <TextInput
              style={[styles.input, styles.ingredientNameInput]}
              value={newIngredientName}
              onChangeText={setNewIngredientName}
              placeholder={translate('ingredient')}
            />
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hazırlanış Adımları Bölümü */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>{translate('preparation')}</Text>

          <View style={styles.listContainer}>
            {Array.isArray(formData.steps) &&
              formData.steps.map((step, index) => (
                <View key={index} style={styles.listItemContainer}>
                  <Text style={styles.stepNumber}>{index + 1}. </Text>
                  <Text style={[styles.listItemText, {flex: 1}]}>{step}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeStep(index)}>
                    <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          <View style={styles.stepInputContainer}>
            <TextInput
              style={[styles.input, styles.stepInput]}
              value={newStep}
              onChangeText={setNewStep}
              placeholder={translate('explainStep')}
              multiline
            />
            <TouchableOpacity style={styles.addButton} onPress={addStep}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={loading}>
          <Text style={styles.saveButtonText}>
            {loading ? translate('loading') : translate('update')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
  },
  removeButton: {
    padding: 4,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4cd964',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 10,
    fontSize: 14,
  },
  ingredientInputContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  ingredientInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 4,
    backgroundColor: '#f8f9fa',
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 4,
    backgroundColor: '#f8f9fa',
  },
  unitInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  stepInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ingredientUnitInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 4,
    backgroundColor: '#f8f9fa',
  },
  ingredientNameInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 4,
    backgroundColor: '#f8f9fa',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  typeSelector: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedModalItemText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditMealScreen;
