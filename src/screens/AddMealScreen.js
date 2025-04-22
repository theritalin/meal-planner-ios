import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useMeals} from '../context/MealContext';
import {useLanguage} from '../context/LanguageContext';
import {DEFAULT_LANGUAGE} from '../utils/translations';
import * as ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const AddMealScreen = ({navigation}) => {
  const {addMeal} = useMeals();
  const {translate, language, translations} = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('kahvaltı');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [calories, setCalories] = useState('');
  const [ingredients, setIngredients] = useState([
    {name: '', amount: '', unit: ''},
  ]);
  const [steps, setSteps] = useState(['']);
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Add useEffect for debugging language
  useEffect(() => {
    console.log('AddMealScreen Current Language:', language);
  }, [language]);

  // mealTypes dizisini bileşen içinde tanımla, sabit İngilizce etiketlerle
  const mealTypes = React.useMemo(() => {
    // Artık dil veya çeviriye bağımlı değil
    // const currentTranslations = ...
    // const translatedMealTypes = ...
    return [
      {
        // key: "mealType.breakfast", // Artık key'e gerek yok
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
    // }, [language, translations]); // Bağımlılıkları kaldır
  }, []); // Bağımlılık yok, sadece bir kere oluşturulacak

  const handleAddIngredient = () => {
    setIngredients([...ingredients, {name: '', amount: '', unit: ''}]);
  };

  const handleRemoveIngredient = index => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleUpdateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = index => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const handleUpdateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleAddMeal = async () => {
    // Zorunlu alanların kontrolü
    const requiredFields = [
      {field: name, name: translate('recipeName')},
      {field: type, name: translate('mealTypeLabel')},
      {field: prepTime, name: translate('preparationTime')},
      {field: cookTime, name: translate('cookingTime')},
    ];

    const missingFields = requiredFields
      .filter(item => !item.field)
      .map(item => item.name);

    if (missingFields.length > 0) {
      Alert.alert(
        translate('missingFields'),
        `${translate('pleaseFillRequired')}\n\n${missingFields.join('\n')}`,
        [{text: translate('cancel')}],
      );

      // iOS haptic feedback - uyarı
      if (Platform.OS === 'ios') {
        ReactNativeHapticFeedback.trigger('notification');
      }

      return;
    }

    try {
      const newMeal = {
        name,
        description,
        type,
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1,
        calories: parseInt(calories) || 0,
        ingredients: ingredients
          .filter(ing => ing.name.trim() !== '')
          .map(ing =>
            `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`.trim(),
          ),
        steps: steps.filter(step => step.trim() !== ''),
      };

      await addMeal(newMeal);

      // Başarı geri bildirimi - Haptic
      if (Platform.OS === 'ios') {
        ReactNativeHapticFeedback.trigger('notification');
      }

      Alert.alert(translate('success'), translate('addMealSuccess'), [
        {
          text: translate('cancel'),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Yemek eklenirken hata:', error);
      Alert.alert(translate('error'), translate('addMealError'));
    }
  };

  const renderTypeSelector = () => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{translate('mealTypeLabel')}*</Text>
        <TouchableOpacity
          style={styles.typeSelector}
          onPress={() => setShowTypeModal(true)}>
          <Text style={styles.typeSelectorText}>
            {/* Seçili öğenin sabit etiketini göster */}
            {mealTypes.find(t => t.value === type)?.label || 'Select Meal Type'}
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
                      setType(item.value);
                      setShowTypeModal(false);
                    }}>
                    <Text
                      style={[
                        styles.modalItemText,
                        type === item.value && styles.selectedModalItemText,
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
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{translate('addNewRecipe')}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('recipeName')}*</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={translate('enterRecipeName')}
            />
          </View>

          {renderTypeSelector()}

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
              <Text style={styles.label}>{translate('preparationTime')}*</Text>
              <TextInput
                style={styles.input}
                value={prepTime}
                onChangeText={setPrepTime}
                placeholder={translate('preparationTime')}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
              <Text style={styles.label}>{translate('cookingTime')}*</Text>
              <TextInput
                style={styles.input}
                value={cookTime}
                onChangeText={setCookTime}
                placeholder={translate('cookingTime')}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
              <Text style={styles.label}>{translate('servingCount')}</Text>
              <TextInput
                style={styles.input}
                value={servings}
                onChangeText={setServings}
                placeholder={translate('servingCount')}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
              <Text style={styles.label}>{translate('caloriesKcal')}</Text>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                placeholder={translate('caloriesKcal')}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={translate('enterDescription')}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>
              {translate('ingredients')}
            </Text>
          </View>

          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientInputContainer}>
                <TextInput
                  style={styles.ingredientInput}
                  value={ingredient.name}
                  onChangeText={value =>
                    handleUpdateIngredient(index, 'name', value)
                  }
                  placeholder={translate('ingredient')}
                />
                <TextInput
                  style={styles.amountInput}
                  value={ingredient.amount}
                  onChangeText={value =>
                    handleUpdateIngredient(index, 'amount', value)
                  }
                  placeholder={translate('amount')}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.unitInput}
                  value={ingredient.unit}
                  onChangeText={value =>
                    handleUpdateIngredient(index, 'unit', value)
                  }
                  placeholder={translate('unit')}
                />
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveIngredient(index)}>
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addItemButton}
            onPress={handleAddIngredient}>
            <Text style={styles.addItemButtonText}>
              {translate('addIngredient')}
            </Text>
          </TouchableOpacity>

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>
              {translate('preparation')}
            </Text>
          </View>

          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
              </View>
              <View style={styles.stepInputContainer}>
                <TextInput
                  style={styles.stepInput}
                  value={step}
                  onChangeText={value => handleUpdateStep(index, value)}
                  placeholder={translate('explainStep')}
                  multiline
                />
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveStep(index)}>
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addItemButton}
            onPress={handleAddStep}>
            <Text style={styles.addItemButtonText}>{translate('addStep')}</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>
                {translate('cancel').toUpperCase()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
              <Text style={styles.addButtonText}>
                {translate('saveRecipe')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f8f9fa',
  },
  pickerAndroid: {
    height: 50,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberContainer: {
    width: 25,
    alignItems: 'center',
  },
  stepNumber: {
    fontWeight: 'bold',
  },
  stepInputContainer: {
    flex: 1,
    marginLeft: 5,
  },
  stepInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 50,
    backgroundColor: '#f8f9fa',
  },
  removeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 15,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addItemButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addItemButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  typeSelector: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  typeSelectorText: {
    fontSize: 14,
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

export default AddMealScreen;
