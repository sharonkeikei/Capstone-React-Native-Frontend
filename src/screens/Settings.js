import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Picker } from 'react-native';

const Settings = (props) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const { navigation } = props;
  const LANGUAGES = { 
    Spanish: 'es', 
    Korean: 'ko', 
    Chinese: 'zh-TW', 
    Japanese: 'ja', 
    French: 'fr',
    German: 'de', 
    Vietnamese: 'vi'
  };

  const changeOption = (lang) => {
    setSelectedLanguage(lang);
  };

  const displayLanguage = Object.keys(LANGUAGES).find(label => {
    return LANGUAGES[label] == selectedLanguage;
  });
  

  const languageComponents = Object.keys(LANGUAGES).map(label => {
    return (
      <Picker.Item label={label} value={LANGUAGES[label]} />
    )
  });


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Language Settings</Text>

      <View>
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={changeOption}
          style={{ width: 160 }}
          mode="dropdown"
        >
          <Picker.Item label="Options"/> 
          {languageComponents}
        </Picker>
        <Text>Language selectd: {displayLanguage}</Text>
      </View>

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => navigation.navigate('WordTranslator', {
          item: {language: selectedLanguage}})
        }
      >
        <Text style={styles.buttonText}>Translating Words</Text>
        {/* <Text style={styles.buttonText}>Who is {character.name}?</Text> */}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => navigation.navigate('PhotoTranslator', 
          {item: {language: selectedLanguage}})
        }
      >
        <Text style={styles.buttonText}>Translating Photo</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  text: {
    color: '#747EFD',
    fontSize: 24,
    fontWeight: 'bold'
  },
  buttonContainer: {
    backgroundColor: '#747EFD',
    borderRadius: 5,
    padding: 10,
    margin: 20
  },
  buttonText: {
    fontSize: 20,
    color: '#fff'
  }
});

export default Settings;


// reference: https://cloud.google.com/translate/docs/languages