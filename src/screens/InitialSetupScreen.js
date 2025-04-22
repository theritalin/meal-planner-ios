import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMeals } from "../context/MealContext";

const InitialSetupScreen = () => {
  const [name, setName] = useState("");
  const { setUser } = useMeals();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Lütfen adınızı girin");
      return;
    }

    try {
      const user = {
        id: "1",
        name: name.trim(),
      };

      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } catch (error) {
      console.error("Kullanıcı kayıt hatası:", error);
      Alert.alert("Hata", "Bilgileriniz kaydedilirken bir hata oluştu");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Hoş Geldiniz!</Text>
        <Text style={styles.subtitle}>
          Yemek planlayıcısını kullanmaya başlamak için lütfen adınızı girin.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Adınız"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Başla</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default InitialSetupScreen;
