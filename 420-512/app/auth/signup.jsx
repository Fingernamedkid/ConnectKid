import { Text, View, TextInput, Dimensions, KeyboardAvoidingView, ActivityIndicator, ScrollView, Platform } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { colorsPalette } from '../../assets/colorsPalette';
import { TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { setToken, signUp } from '../../lib/axios';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

const WIDTH_BTN = Dimensions.get('window').width - 56;

const SignUp = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [alertUsername, setAlertUsername] = useState(false);
  const [alertEmail, setAlertEmail] = useState(false);
  const [alertMDP, setAlertMDP] = useState(false);
  const [alertType, setAlertType] = useState(false);
  const [alertPhoneNumber, setAlertPhoneNumber] = useState(false);
  const [msgErreur, setMsgErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = colorsPalette[theme];

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    type: '',
    phonenumber: '',
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour l'email
  const phoneRegex = /^[0-9]{10}$/; // Expression régulière pour le numéro de téléphone (10 chiffres)

  const submit = async () => {
    let isValid = true;

    // Validation des champs vides et des regex
    if (form.username === '') {
      setAlertUsername(true);
      isValid = false;
    } else {
      setAlertUsername(false);
    }

    if (form.password === '') {
      setAlertMDP(true);
      isValid = false;
    } else {
      setAlertMDP(false);
    }

    if (form.email === '' || !emailRegex.test(form.email)) {
      setAlertEmail(true);
      isValid = false;
    } else {
      setAlertEmail(false);
    }

    if (form.type === '') {
      setAlertType(true);
      isValid = false;
    } else {
      setAlertType(false);
    }

    if (form.phonenumber === '' || !phoneRegex.test(form.phonenumber)) {
      setAlertPhoneNumber(true);
      isValid = false;
    } else {
      setAlertPhoneNumber(false);
    }

    if (!isValid) return;

    console.log(`Trying to SignUp with username : ${form.username}, email : ${form.email} and password : ${form.password}`);

    try {
      setLoading(true);
      const result = await signUp(form.username, form.email, form.password, form.type, form.phonenumber);
      setLoading(false);
      setForm({ username: '', email: '', password: '', type: 'Parent', phonenumber: '' });
      router.push(`../${result.id}/profileView`);
    } catch (error) {
      setLoading(false);
      console.log(error);
      if (error.message.includes('Request failed with status code 409')) {
        setMsgErreur('Email et/ou Identifiant déjà utilisé');
      } else {
        setMsgErreur('Désolé : Il y a un problème de notre côté, veuillez réessayer plus tard.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 items-center"
      style={{ backgroundColor: colors.background_c1 }}
      keyboardVerticalOffset={0}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1 items-center">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text
            className="text-7xl font-bold tracking-[2px] text-center pt-24 pb-16"
            style={{ color: colors.primary }}
          >
            FitTrackr
          </Text>
          <View className="flex-1 justify-center items-center gap-8">
            <Text className="text-4xl font-semibold pb-4" style={{ color: colors.text }}>
              Créez votre compte
            </Text>
            {loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}

            {msgErreur !== '' && (
              <View
                className="items-center justify-center py-5 rounded-lg border-2"
                style={[
                  { width: WIDTH_BTN, color: colors.text, backgroundColor: colors.lightAlert, borderColor: colors.alert },
                ]}
              >
                <Text style={{ color: colors.text }}>{msgErreur}</Text>
              </View>
            )}

            <View>
              <View className="flex-row items-center">
                <TextInput
                  className="justify-center py-5 rounded-lg text-center focus:border-2"
                  style={[
                    { width: WIDTH_BTN, color: colors.text, backgroundColor: colors.background, borderColor: colors.primary },
                    alertEmail ? { paddingRight: 56, borderWidth: 2, borderColor: colors.alert } : {},
                  ]}
                  onChangeText={(item) => {
                    setForm({ ...form, email: item });
                  }}
                  placeholder="Entrez votre courriel"
                  placeholderTextColor={colors.text}
                  value={form.email}
                />
                {alertEmail ? <Icon className="absolute right-4" name="exclamation-triangle" size={30} color={colors.alert} /> : null}
              </View>
              {alertEmail && <Text style={{ color: colors.alert, paddingTop: 5 }}>Courriel : Veuillez entrer un email valide</Text>}
            </View>

            <View>
              <View className="flex-row items-center">
                <TextInput
                  className="justify-center py-5 rounded-lg text-center focus:border-2"
                  style={[
                    { width: WIDTH_BTN, color: colors.text, backgroundColor: colors.background, borderColor: colors.primary },
                    alertUsername ? { paddingRight: 56, borderWidth: 2, borderColor: colors.alert } : {},
                  ]}
                  onChangeText={(item) => {
                    setForm({ ...form, username: item });
                  }}
                  placeholder="Entrez l'identifiant"
                  placeholderTextColor={colors.text}
                  value={form.username}
                />
                {alertUsername ? <Icon className="absolute right-4" name="exclamation-triangle" size={30} color={colors.alert} /> : null}
              </View>
              {alertUsername && <Text style={{ color: colors.alert, paddingTop: 5 }}>Identifiant : Ce champ doit être rempli</Text>}
            </View>

            <View className="rounded-lg">
              <View className="m-3 z-0 flex-row items-center">
                <TextInput
                  className="justify-center py-5 rounded-lg text-center focus:border-2"
                  style={[
                    { width: WIDTH_BTN, color: colors.text, backgroundColor: colors.background, borderColor: colors.primary },
                    alertMDP ? { paddingRight: 56, borderWidth: 2, borderColor: colors.alert } : {},
                  ]}
                  onChangeText={(item) => {
                    setForm({ ...form, password: item });
                  }}
                  placeholder="Entrez le mot de passe"
                  placeholderTextColor={colors.text}
                  value={form.password}
                  secureTextEntry
                />
                {alertMDP ? <Icon className="absolute right-4" name="exclamation-triangle" size={30} color={colors.alert} /> : null}
              </View>
              {alertMDP && <Text style={{ color: colors.alert, paddingTop: 5 }}>Mot de passe : Ce champ doit être rempli</Text>}
            </View>

            <View className="rounded-lg">
              <View className="m-3 z-0 flex-row items-center">
                <Picker
                  selectedValue={form.type}
                  style={[
                    { width: WIDTH_BTN, color: colors.text, backgroundColor: colors.background, borderColor: colors.primary },
                    alertType ? { paddingRight: 56, borderWidth: 2, borderColor: colors.alert } : {},
                  ]}
                  onValueChange={(item) => {
                    setForm({ ...form, type: item });
                  }}
                >
                  <Picker.Item label="Parent" value="Parent" />
                  <Picker.Item label="Enfant" value="Enfant" />
                </Picker>
                {alertType ? <Icon className="absolute right-4" name="exclamation-triangle" size={30} color={colors.alert} /> : null}
              </View>
              {alertType && <Text style={{ color: colors.alert, paddingTop: 5 }}>Type : Ce champ doit être rempli</Text>}
            </View>

            <View className="rounded-lg">
              <View className="m-3 z-0 flex-row items-center">
                <TextInput
                  className="justify-center py-5 rounded-lg text-center focus:border-2"
                  style={[
                    { width: WIDTH_BTN, color: colors.text, backgroundColor: colors.background, borderColor: colors.primary },
                    alertPhoneNumber ? { paddingRight: 56, borderWidth: 2, borderColor: colors.alert } : {},
                  ]}
                  onChangeText={(item) => {
                    setForm({ ...form, phonenumber: item });
                  }}
                  placeholder="Entrez le numéro de téléphone"
                  placeholderTextColor={colors.text}
                  value={form.phonenumber}
                />
                {alertPhoneNumber ? <Icon className="absolute right-4" name="exclamation-triangle" size={30} color={colors.alert} /> : null}
              </View>
              {alertPhoneNumber && <Text style={{ color: colors.alert, paddingTop: 5 }}>Numéro de téléphone : Veuillez entrer un numéro valide</Text>}
            </View>

            <TouchableOpacity
              className="py-4 rounded-xl px-3"
              style={[{ width: WIDTH_BTN, color: colors.text, backgroundColor: colors.primary }]}
              onPress={submit}
            >
              <Text className="text-center font-medium text-2xl" style={{ color: colors.lightText }}>
                Créez le compte
              </Text>
            </TouchableOpacity>
            <View className="border-b border-gray-300 my-2.5 w-3/4" />
            <Text className="text-3xl font-bold underline" style={{ color: colors.text }}>
              If you already have an account <Link style={{ color: colors.link }} href="./signin">Sign-in</Link>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
