// İngilizce ve Türkçe için çeviriler
export const translations = {
  tr: {
    // Genel
    appName: 'Yemek Planlayıcı',
    welcome: 'Hoş Geldiniz',
    cancel: 'İptal',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarılı',

    // Dil seçimi
    language: 'Dil',
    selectLanguage: 'Dil Seçimi',
    turkish: 'Türkçe',
    english: 'İngilizce',

    // Sayfa başlıkları
    home: 'Ana Sayfa',
    profile: 'Profilim',
    mealList: 'Yemek Listesi',
    addMeal: 'Yeni Tarif',
    mealDetail: 'Tarif Detayı',
    editMeal: 'Yemeği Düzenle',

    // Giriş ekranı
    login: 'Giriş Yap',
    username: 'Kullanıcı Adı',
    loginInfo:
      'Sadece kullanıcı adınızı girerek uygulamaya giriş yapabilirsiniz.',
    enterUsername: 'Lütfen bir kullanıcı adı giriniz',
    loginError: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyiniz.',

    // Profil ekranı
    logout: 'Çıkış Yap',
    logoutConfirm: 'Çıkış yapmak istediğinizden emin misiniz?',
    userID: 'Kullanıcı ID',
    registrationDate: 'Kayıt Tarihi',
    weeklyPlanPDF: "Haftalık Planı PDF'e Dönüştür",
    recipeBookPDF: 'Tarif Kitabı Oluştur',

    // Yemek planlama
    weeklyPlan: 'Haftalık Plan',
    mealType: {
      breakfast: 'Kahvaltı',
      lunch: 'Öğle Yemeği',
      dinner: 'Akşam Yemeği',
    },
    mealTypeSimple: {
      breakfast: 'Kahvaltı',
      lunch: 'Öğle',
      dinner: 'Akşam',
    },
    days: {
      monday: 'Pazartesi',
      tuesday: 'Salı',
      wednesday: 'Çarşamba',
      thursday: 'Perşembe',
      friday: 'Cuma',
      saturday: 'Cumartesi',
      sunday: 'Pazar',
    },

    // PDF
    pdfTitle: 'Haftalık Yemek Planı',
    shoppingList: 'Alışveriş Listesi',
    noMealsWithIngredients: 'Yemek planınızda malzemesi olan yemek bulunamadı.',
    personalRecipeBook: 'Kişisel Tarif Kitabım',
    preparedBy: 'Hazırlayan',
    date: 'Tarih',

    // Yemek detayları
    mealType: 'Öğün',
    prepTime: 'Hazırlama Süresi',
    calories: 'Kalori',
    description: 'Açıklama',
    ingredients: 'Malzemeler',
    preparation: 'Hazırlanışı',
    noDescription: 'Açıklama bulunmuyor',

    // Diğer
    noMealsFound: 'Seçilebilecek yemek bulunamadı.',
    planError: 'Plan oluşturulurken bir sorun oluştu.',
    randomPlanSuccess: 'Tüm hafta için rastgele yemek planı oluşturuldu!',

    // Home ekranı
    all: 'Tümü',
    allMeals: 'Tüm Yemekler',
    default: 'Varsayılan',
    personal: 'Kişisel',
    searchMeal: 'Yemek ara...',
    filter: 'Filtrele',
    hideFilters: 'Filtreleri Gizle',
    noMealsYet: 'Henüz yemek bulunmuyor.',
    dragAndDrop: 'Sürükle ve Bırak',
    longPressStep: 'Yemek kartına uzun basın',
    dragStep: 'Kartı sürükleyerek istediğiniz öğün alanına getirin',
    dropStep: 'Öğün alanı üzerinde bırakın',
    breakfast: 'Kahvaltı',
    understood: 'Anladım',

    // Tarif ekleme ekranı
    addNewRecipe: 'Yeni Tarif Ekle',
    recipeName: 'Tarif Adı',
    mealTypeLabel: 'Öğün Tipi',
    selectMealType: 'Öğün Tipi Seç',
    preparationTime: 'Hazırlık Süresi (dk)',
    cookingTime: 'Pişirme Süresi (dk)',
    servingCount: 'Porsiyon Sayısı',
    caloriesKcal: 'Kalori (kcal)',
    missingFields: 'Eksik Bilgiler',
    pleaseFillRequired: 'Lütfen aşağıdaki zorunlu alanları doldurun:',
    addMealSuccess: 'Yemek başarıyla eklendi',
    addMealError: 'Yemek eklenirken bir sorun oluştu',
    ingredient: 'Malzeme',
    amount: 'Miktar',
    unit: 'Birim',
    addIngredient: 'MALZEME EKLE',
    addStep: 'ADIM EKLE',
    explainStep: 'Adımı açıklayın',
    saveRecipe: 'TARİFİ KAYDET',

    // Tarif düzenleme ekranı
    editRecipeTitle: 'Tarifi Düzenle',
    ingredientError: 'Malzeme adı boş olamaz',
    stepError: 'Hazırlanış adımı boş olamaz',
    nameError: 'Yemek adı boş olamaz',
    descriptionError: 'Yemek açıklaması boş olamaz',
    caloriesError: 'Geçerli bir kalori değeri girin',
    prepTimeError: 'Geçerli bir hazırlama süresi girin',
    updateMealSuccess: 'Yemek başarıyla güncellendi',
    updateMealError: 'Yemek güncellenirken bir hata oluştu',
    enterRecipeName: 'Yemek adını girin',
    enterDescription: 'Yemek açıklamasını girin',
    enterCalories: 'Kalori değerini girin',
    enterPrepTime: 'Hazırlama süresini girin',
    update: 'Güncelle',

    // Premium özellikleri
    goPremium: "Premium'a Geç",
    premiumActive: 'Premium Etkin',
    premiumRemoveAds: 'Reklamları Kaldır',
    premiumFeatures: 'Premium Özellikler',
    premiumDescription:
      'Reklamları kaldırın ve tüm özelliklerin keyfini çıkarın',
    premiumPrice: '2.99$',
    premiumBuyButton: 'Satın Al',
    premiumRestoreButton: 'Satın Alımları Geri Yükle',
    generating: 'Oluşturuluyor...',
    exportPlan: 'Haftalık Planı Dışa Aktar',
    exportRecipes: 'Tarif Kitabını Dışa Aktar',
    personalRecipes: 'Kişisel Tarif',
    defaultRecipes: 'Varsayılan Tarif',
    buyPremium: "Premium'a Yükselt",
    premiumStatus: 'Premium Durumu',
    active: 'Aktif',
    premiumSuccess: 'Premium özellikler başarıyla aktif edildi!',
    premiumError: 'Satın alma işlemi sırasında bir hata oluştu.',
    changeLanguage: 'Dil Değiştir',
    exportPdf: 'PDF Dışa Aktar',

    // Uyarılar ve bildirimler
    warning: 'Uyarı',
    info: 'Bilgi',
    confirm: 'Onay',
    clear: 'Temizle',
    clearMealPlanConfirm:
      'Tüm haftalık planı temizlemek istediğinizden emin misiniz?',
    mealPlanCleared: 'Tüm haftalık plan temizlendi.',
    noMealsForRandom: 'Rastgele plan oluşturmak için hiç yemek bulunamadı.',
    randomMealsAdded: 'Rastgele yemekler tüm haftaya eklendi.',
    errorAddingMeals: 'Yemekler eklenirken bir sorun oluştu.',
    errorClearingPlan: 'Plan temizlenirken bir sorun oluştu.',
    errorAddingToMealPlan: 'Yemek planına eklenirken bir hata oluştu.',
    errorRemovingFromMealPlan: 'Yemek planından silinirken bir hata oluştu.',
  },
  en: {
    // General
    appName: 'Meal Planner',
    welcome: 'Welcome',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Language selection
    language: 'Language',
    selectLanguage: 'Select Language',
    turkish: 'Turkish',
    english: 'English',

    // Page titles
    home: 'Home',
    profile: 'My Profile',
    mealList: 'Meal List',
    addMeal: 'New Recipe',
    mealDetail: 'Recipe Detail',
    editMeal: 'Edit Meal',

    // Login screen
    login: 'Login',
    username: 'Username',
    loginInfo: 'You can log in to the app by just entering your username.',
    enterUsername: 'Please enter a username',
    loginError: 'An error occurred while logging in. Please try again.',

    // Profile screen
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    userID: 'User ID',
    registrationDate: 'Registration Date',
    weeklyPlanPDF: 'Convert Weekly Plan to PDF',
    recipeBookPDF: 'Create Recipe Book',

    // Meal planning
    weeklyPlan: 'Weekly Plan',
    mealType: {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
    },
    mealTypeSimple: {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
    },
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },

    // PDF
    pdfTitle: 'Weekly Meal Plan',
    shoppingList: 'Shopping List',
    noMealsWithIngredients:
      'No meals with ingredients found in your meal plan.',
    personalRecipeBook: 'My Personal Recipe Book',
    preparedBy: 'Prepared by',
    date: 'Date',

    // Meal details
    mealType: 'Meal Type',
    prepTime: 'Preparation Time',
    calories: 'Calories',
    description: 'Description',
    ingredients: 'Ingredients',
    preparation: 'Preparation',
    noDescription: 'No description available',

    // Other
    noMealsFound: 'No meals available for selection.',
    planError: 'An error occurred while creating the plan.',
    randomPlanSuccess: 'Random meal plan created for the entire week!',

    // Home screen
    all: 'All',
    allMeals: 'All Meals',
    default: 'Default',
    personal: 'Personal',
    searchMeal: 'Search meals...',
    filter: 'Filter',
    hideFilters: 'Hide Filters',
    noMealsYet: 'No meals available yet.',
    dragAndDrop: 'Drag and Drop',
    longPressStep: 'Long press on the meal card',
    dragStep: 'Drag the card to the desired meal slot',
    dropStep: 'Drop it onto the meal slot',
    breakfast: 'Breakfast',
    understood: 'Got it',

    // Recipe adding screen
    addNewRecipe: 'Add New Recipe',
    recipeName: 'Recipe Name',
    mealTypeLabel: 'Meal Type',
    selectMealType: 'Select Meal Type',
    preparationTime: 'Preparation Time (min)',
    cookingTime: 'Cooking Time (min)',
    servingCount: 'Serving Count',
    caloriesKcal: 'Calories (kcal)',
    missingFields: 'Missing Information',
    pleaseFillRequired: 'Please fill in the following required fields:',
    addMealSuccess: 'Recipe added successfully',
    addMealError: 'An error occurred while adding the recipe',
    ingredient: 'Ingredient',
    amount: 'Amount',
    unit: 'Unit',
    addIngredient: 'ADD INGREDIENT',
    addStep: 'ADD STEP',
    explainStep: 'Explain the step',
    saveRecipe: 'SAVE RECIPE',

    // Recipe editing screen
    editRecipeTitle: 'Edit Recipe',
    ingredientError: 'Ingredient name cannot be empty',
    stepError: 'Preparation step cannot be empty',
    nameError: 'Recipe name cannot be empty',
    descriptionError: 'Recipe description cannot be empty',
    caloriesError: 'Please enter a valid calorie value',
    prepTimeError: 'Please enter a valid preparation time',
    updateMealSuccess: 'Recipe updated successfully',
    updateMealError: 'An error occurred while updating the recipe',
    enterRecipeName: 'Enter recipe name',
    enterDescription: 'Enter recipe description',
    enterCalories: 'Enter calories',
    enterPrepTime: 'Enter preparation time',
    update: 'Update',

    // Premium features
    goPremium: 'Go Premium',
    premiumActive: 'Premium Active',
    premiumRemoveAds: 'Remove Ads',
    premiumFeatures: 'Premium Features',
    premiumDescription: 'Remove ads and enjoy all features',
    premiumPrice: '$2.99',
    premiumBuyButton: 'Buy',
    premiumRestoreButton: 'Restore Purchases',
    generating: 'Generating...',
    exportPlan: 'Export Weekly Plan',
    exportRecipes: 'Export Recipe Book',
    personalRecipes: 'Personal Recipes',
    defaultRecipes: 'Default Recipes',
    buyPremium: 'Upgrade to Premium',
    premiumStatus: 'Premium Status',
    active: 'Active',
    premiumSuccess: 'Premium features successfully activated!',
    premiumError: 'An error occurred during the purchase process.',
    changeLanguage: 'Change Language',
    exportPdf: 'Export PDF',

    // Alerts and notifications
    warning: 'Warning',
    info: 'Information',
    confirm: 'Confirm',
    clear: 'Clear',
    clearMealPlanConfirm:
      'Are you sure you want to clear the entire weekly plan?',
    mealPlanCleared: 'Weekly plan has been cleared.',
    noMealsForRandom: 'No meals found to create random plan.',
    randomMealsAdded: 'Random meals added to the entire week.',
    errorAddingMeals: 'An error occurred while adding meals.',
    errorClearingPlan: 'An error occurred while clearing the plan.',
    errorAddingToMealPlan: 'An error occurred while adding to meal plan.',
    errorRemovingFromMealPlan:
      'An error occurred while removing from meal plan.',
  },
};

// Varsayılan dil
export const DEFAULT_LANGUAGE = 'en';
