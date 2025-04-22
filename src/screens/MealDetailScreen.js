import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useMeals} from '../context/MealContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MealDetailScreen = ({route, navigation}) => {
  const [currentMeal, setCurrentMeal] = useState(route.params.meal);
  const {currentUser, meals, addMeal, deleteMeal} = useMeals();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (route.params.meal) {
      setCurrentMeal(route.params.meal);
    }
  }, [route.params.meal]);

  // Meal type mapping
  const getMealTypeText = type => {
    switch (type) {
      case 'kahvaltı':
        return 'Kahvaltı';
      case 'öğle':
        return 'Öğle Yemeği';
      case 'akşam':
        return 'Akşam Yemeği';
      default:
        return type;
    }
  };

  const handleDelete = () => {
    Alert.alert('Yemeği Sil', 'Bu yemeği silmek istediğinizden emin misiniz?', [
      {text: 'İptal', style: 'cancel'},
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoading(true);
            await deleteMeal(currentMeal.id);
            navigation.goBack();
          } catch (error) {
            console.error('Yemek silme hatası:', error);
            Alert.alert('Hata', 'Yemek silinirken bir hata oluştu');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    navigation.navigate('EditMeal', {meal: currentMeal});
  };

  const renderSource = () => {
    if (currentMeal.isDefault) {
      return (
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceText}>Varsayılan Tarif</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.sourceContainer, styles.personalSource]}>
          <Text style={styles.sourceText}>Kişisel Tarif</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{currentMeal.name}</Text>
          <View style={styles.headerInfo}>
            <View style={styles.typeContainer}>
              <Text style={styles.type}>
                {getMealTypeText(currentMeal.type)}
              </Text>
            </View>
            {renderSource()}
          </View>
        </View>

        <View style={styles.infoContainer}>
          {(currentMeal.prepTime || currentMeal.duration) && (
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={24} color="#007AFF" />
              <Text style={styles.infoText}>
                {currentMeal.prepTime || currentMeal.duration || 0} dk
              </Text>
              <Text style={styles.infoLabel}>Hazırlık</Text>
            </View>
          )}

          {currentMeal.cookTime > 0 && (
            <View style={styles.infoItem}>
              <Ionicons name="flame-outline" size={24} color="#007AFF" />
              <Text style={styles.infoText}>{currentMeal.cookTime} dk</Text>
              <Text style={styles.infoLabel}>Pişirme</Text>
            </View>
          )}

          {currentMeal.calories > 0 && (
            <View style={styles.infoItem}>
              <Ionicons name="fast-food-outline" size={24} color="#007AFF" />
              <Text style={styles.infoText}>{currentMeal.calories} kcal</Text>
              <Text style={styles.infoLabel}>Kalori</Text>
            </View>
          )}

          {currentMeal.servings > 0 && (
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={24} color="#007AFF" />
              <Text style={styles.infoText}>{currentMeal.servings}</Text>
              <Text style={styles.infoLabel}>Porsiyon</Text>
            </View>
          )}
        </View>

        {currentMeal.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.description}>{currentMeal.description}</Text>
          </View>
        )}

        {currentMeal.ingredients && currentMeal.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Malzemeler</Text>
            {currentMeal.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#007AFF"
                />
                <Text style={styles.ingredientText}>
                  {typeof ingredient === 'object' && ingredient !== null
                    ? `${ingredient.amount || ''} ${ingredient.unit || ''} ${
                        ingredient.name || ''
                      }`.trim()
                    : ingredient}
                </Text>
              </View>
            ))}
          </View>
        )}

        {(currentMeal.steps &&
          Array.isArray(currentMeal.steps) &&
          currentMeal.steps.length > 0) ||
        (currentMeal.instructions &&
          Array.isArray(currentMeal.instructions) &&
          currentMeal.instructions.length > 0) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hazırlanışı</Text>
            {(Array.isArray(currentMeal.steps)
              ? currentMeal.steps
              : Array.isArray(currentMeal.instructions)
              ? currentMeal.instructions
              : []
            ).map((step, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}</Text>
                <Text style={styles.instructionText}>
                  {typeof step === 'object' && step !== null
                    ? JSON.stringify(step)
                    : step}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color="white" />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginRight: 10,
  },
  type: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sourceContainer: {
    backgroundColor: '#e8f4fc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  personalSource: {
    backgroundColor: '#f0e8fc',
  },
  sourceText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 1,
  },
  infoItem: {
    flexDirection: 'column',
    alignItems: 'center',
    margin: 10,
  },
  infoText: {
    marginTop: 5,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    margin: 10,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#444',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  instructionNumber: {
    backgroundColor: '#007AFF',
    color: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MealDetailScreen;
