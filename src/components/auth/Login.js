import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMeals } from "../../context/MealContext";

const Login = ({ navigation }) => {
  const { setCurrentUser } = useMeals();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        setError("Lütfen kullanıcı adı ve şifre giriniz");
        return;
      }

      // Demo amaçlı basit kontrol
      if (username === "demo" && password === "demo123") {
        const user = {
          id: "1",
          username: username,
          name: "Demo Kullanıcı",
        };

        await AsyncStorage.setItem("user", JSON.stringify(user));
        setCurrentUser(user);
        navigation.navigate("Home");
      } else {
        setError("Kullanıcı adı veya şifre hatalı");
      }
    } catch (err) {
      setError("Giriş yapılırken bir hata oluştu");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Yemek Planlayıcı</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Demo giriş için:
          {"\n"}Kullanıcı: demo
          {"\n"}Şifre: demo123
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1e4e8",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 10,
  },
  infoText: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
});

export default Login;
