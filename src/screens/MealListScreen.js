import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useMeals } from "../context/MealContext";

const MealListScreen = ({ route, navigation }) => {
  const { day, mealType } = route.params;
  const { getAllMeals, updateMealPlan, loading, mealFilter, setMealFilter } =
    useMeals();
  const [searchText, setSearchText] = useState("");
  const [filteredMeals, setFilteredMeals] = useState([]);

  const dayLabels = {
    monday: "Pazartesi",
    tuesday: "Salı",
    wednesday: "Çarşamba",
    thursday: "Perşembe",
    friday: "Cuma",
    saturday: "Cumartesi",
    sunday: "Pazar",
  };

  const mealTypeLabels = {
    breakfast: "Kahvaltı",
    lunch: "Öğle Yemeği",
    dinner: "Akşam Yemeği",
  };

  useEffect(() => {
    // Başlık ayarla
    navigation.setOptions({
      title: `${dayLabels[day]} - ${mealTypeLabels[mealType]}`,
    });

    // Yemekleri filtrele
    const meals = getAllMeals().filter((meal) => meal.type === mealType);
    setFilteredMeals(meals);
  }, [day, mealType, mealFilter]);

  // Arama fonksiyonu
  useEffect(() => {
    const meals = getAllMeals().filter((meal) => meal.type === mealType);
    if (searchText.trim() === "") {
      setFilteredMeals(meals);
    } else {
      const filtered = meals.filter(
        (meal) =>
          meal.name.toLowerCase().includes(searchText.toLowerCase()) ||
          meal.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredMeals(filtered);
    }
  }, [searchText, mealFilter]);

  const handleAddMeal = (meal) => {
    updateMealPlan(day, mealType, meal, "add");
    Alert.alert(
      "Yemek Eklendi",
      `${meal.name} ${dayLabels[day]} ${mealTypeLabels[mealType]} listesine eklendi.`,
      [{ text: "Tamam", onPress: () => navigation.goBack() }]
    );
  };

  const renderMealItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.mealItem}
        onPress={() => navigation.navigate("MealDetail", { meal: item })}
      >
        <View style={styles.mealContent}>
          <Text style={styles.mealName}>{item.name}</Text>
          <Text style={styles.mealDescription}>{item.description}</Text>
          <View style={styles.mealDetails}>
            <Text style={styles.mealDetail}>{item.calories} kcal</Text>
            <Text style={styles.mealDetail}>{item.prepTime} dk</Text>
          </View>
        </View>
        <View style={styles.addButtonContainer}>
          <View style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Yemek ara..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            mealFilter === "all" && styles.activeFilter,
          ]}
          onPress={() => setMealFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              mealFilter === "all" && styles.activeFilterText,
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            mealFilter === "default" && styles.activeFilter,
          ]}
          onPress={() => setMealFilter("default")}
        >
          <Text
            style={[
              styles.filterText,
              mealFilter === "default" && styles.activeFilterText,
            ]}
          >
            Varsayılan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            mealFilter === "personal" && styles.activeFilter,
          ]}
          onPress={() => setMealFilter("personal")}
        >
          <Text
            style={[
              styles.filterText,
              mealFilter === "personal" && styles.activeFilterText,
            ]}
          >
            Kişisel
          </Text>
        </TouchableOpacity>
      </View>

      {filteredMeals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Hiç yemek bulunamadı. Farklı bir filtre deneyin veya kendi
            yemeğinizi ekleyin.
          </Text>
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() => navigation.navigate("AddMeal", { mealType })}
          >
            <Text style={styles.addMealButtonText}>Yeni Yemek Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredMeals}
          renderItem={renderMealItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("AddMeal", { mealType })}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e4e8",
  },
  searchInput: {
    backgroundColor: "#f0f2f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e4e8",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f0f2f5",
  },
  activeFilter: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    color: "#333",
  },
  activeFilterText: {
    color: "white",
    fontWeight: "600",
  },
  listContent: {
    padding: 15,
  },
  mealItem: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  mealDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  mealDetails: {
    flexDirection: "row",
  },
  mealDetail: {
    fontSize: 12,
    color: "#888",
    marginRight: 15,
  },
  addButtonContainer: {
    justifyContent: "center",
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: -2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  addMealButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  addMealButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
});

export default MealListScreen;
