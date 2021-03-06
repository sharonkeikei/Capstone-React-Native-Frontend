import React, { useState, useReducer, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Button, Alert, TouchableHighlight, AsyncStorage } from 'react-native';
import axios from 'axios';
import ENV from '../../env'; 
import * as Google from 'expo-google-app-auth';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons'; 
import { YellowBox } from 'react-native';

import logo from '../../assets/logo.png'; 
import google from '../../assets/google.jpg'; 

import { useFonts, Raleway_600SemiBold, Raleway_700Bold } from '@expo-google-fonts/raleway';
import { AppLoading } from 'expo';


YellowBox.ignoreWarnings([
  'Non-serializable values were found in the navigation state',
]);

import Colors from '../constants/Colors';
import URLS from '../constants/Urls';

const SIGN_IN = 'SIGNED_IN';
const SIGN_OUT = 'SIGNED_OUT';

const initialStateForm = {
  signedIn: false,
  photoUrl: "",
  uid: null, 
  provider: null, 
  username: null, 
  email: null,
};

// Reducer: Take old state and genearate the new state
// function that accepts the action(state to be changed) and changes the state
const reducer = (state, action) => {
  switch (action.type) {
    case SIGN_IN:
      return { 
        ...state, 
        ...action.payload,
        signedIn: true 
      };
    case SIGN_OUT:
      return { 
        ...state, 
        ...action.payload,
        signedIn: false 
      };
    default:
      throw new Error("Don't understand action");
  };
};



  //accessToken to authenticate & authorize users?? not sure if we should pass accessToken around!
  //  <-- should be JWT to make it security!!!!!
  ///////////// send them JWT to set loggin after closing the app ///////////////////




const Home = (props) => {

  const { navigation } = props;

  // dispatch calls the reducer and pass the action(action should be an object)
  const [state, dispatch] = useReducer(reducer, initialStateForm);
  const [userUids, setUserUids] = useState([]);
  const [currId, setCurrId] = useState(null);


  const findId = (uid) => {
    axios.get(`${URLS.BASE_URL}/users`)
      .then(response => {
        console.log('SUCCESS 1: ', response.data);

        const uids = response.data.users.map(user =>{
          return user.uid
        })

        setUserUids(uids);

        if (uid) {
          const user = response.data.users.find(user =>{
            return user.uid === uid;
          })

          setCurrId(user.id);
          // console.log('user.id ??? ', user.id)
        }
      })
      .catch(err => {
        console.log('ERROR 1 - 1: ', err);
      })
  }

  useEffect(() => { 
    if (state.uid) {
      findId(state.uid)
      return;
    } 

  }, [state])


  const addUserApiCall = (body) => {
    // if user exists, dont call /add_user api
    const hasUser = userUids.find(id => {
      return id == body.uid;
    });

    if (!hasUser) {
      // BACKEND API CALL TRAIL ( using my own Network IP for now)
    
      // console.log('body in addUserApiCall: ', body);
      axios.post(`${URLS.BASE_URL}/add_user`, body)
      .then(response => {
        console.log('SUCCESS (new user): ', response.data);
      })
      .catch(err => {
        console.log(`${URLS.BASE_URL}/add_user`, body)
        console.log('ERROR 2: ', err);
      })
    } 
  };


  const signIn = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId: ENV.androidClientId,
        iosClientId: ENV.iosClientId,
        scopes: ['profile', 'email'],
      });

  
      if (result.type === 'success') {
        // how to update state
        dispatch({
          type: SIGN_IN,
          payload: {
            photoUrl: result.user.photoUrl,
            uid: result.user.id, //google called it differently
            provider: "Google", 
            username: result.user.name, //google called it differently
            email: result.user.email,
          }
        });

        const body = {
          uid: result.user.id, 
          provider: "Google", 
          username: result.user.name, 
          email: result.user.email,
          password: result.user.password || null
        }


        addUserApiCall(body);

        storeToken(result.accessToken)
        setAccessToken(result.accessToken)

        return result.accessToken; 
      } else {
        console.log('cancelled');
        return { cancelled: true };
      }
    } catch (err) {
      Alert.alert(
        "Login Failed",
        "Please try again!",
        [
          { text: "OK", 
            onPress: () => console.log("OK Pressed") 
          }
        ]
      )
      console.log('error', err)
      return { error: true };
    }
  };

  const [accessToken, setAccessToken] = useState('')

  const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem(token, ENV.googleApiKey)
    } catch (err) {
        throw new Error(err)
    }
}

  const signOut = async () => {   
  
    try {      
      console.log("token in delete", accessToken);

      await Google.logOutAsync({ 
        accessToken, 
        androidClientId: ENV.androidClientId,
        iosClientId: ENV.iosClientId,
      })

      console.log("Successfully log out");

      Alert.alert(
        "Log out",
        "You have been succefully logged out",
        [
          { text: "OK", 
            onPress: () => console.log("OK Pressed") 
          }
        ]
      )

      // how to update state
      dispatch({
        type: SIGN_OUT,
        payload: initialStateForm
      });

      setCurrId(null);

    } catch (err) {
        throw new Error(err)
    }
  };

  // TEST
  const saveImageHandler = (body) => {

    // console.log('state in PhotoTranslator.js: ', props.route.params);

    console.log('body!! ', body)
    // setFavorite(true);

    axios.post(`${URLS.BASE_URL}/add_image`, body)
      .then(response => {
        console.log('internal API - success: ', response.data)
      })
      .catch(err => {
        console.log('3. internal API - error: ', err)

        Alert.alert(
          "Unique value needed",
          "Oops. The same picture or text exists in your favorite list. Please update a unique value.",
          [
            { 
              text: "OK",
              onPress: () => console.log("OK pressed")
            }
          ]
        )
      })

    // dispatch(imagesActions.addImage(selectedImage, getText, translatedText, true, 'Korean'));
  };


  let [fontsLoaded] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <View style={styles.container}>
      
        <Image style={styles.logo} source={logo} />

        <Text style={styles.title}>Vizlator</Text>
  
        
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.navigate(
            'WordTranslator',
            {
              currentId: currId,
              signedIn: state.signedIn
            }
          )}
        >
          <Text style={styles.buttonText}>Translate Text</Text>
          <MaterialCommunityIcons name="format-text" size={24} color="#fff" />
        </TouchableOpacity>
  
        {/* <View><Text>currId: {currId}</Text></View> */}
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.navigate(
            'PhotoTranslator',
            {
              currentId: currId,
              signedIn: state.signedIn,
              saveImageHandlerCallback: saveImageHandler,
            }
          )}
        >
          <Text style={styles.buttonText}>Translate Image</Text>
          <Entypo name="image" size={24} color="#fff" />
        </TouchableOpacity>

        {state.signedIn ? (
          <View>
            <LoggedInPage username={state.username} photoUrl={state.photoUrl} />
            <View style={styles.signOutBtn}>
              <Button title="Sign out" color="#fff" onPress={() => signOut()} />
            </View>
          </View>
          
        ) :
          <LoginPage signIn={signIn} />
        }
      </View>
    )
  }
}


const LoginPage = props => {
  return (
    <View style={styles.googleBtn}>
      {/* <AntDesign name="google" size={24} color="red" /> */} 
      <Image style={{width: 20, height: 20}} source={google} />
      <Button color={Colors.bg} title="Sign in with Google" onPress={() => props.signIn()} />
    </View>
  )
}

const LoggedInPage = props => {
  return (
    <View style={styles.userContainer}>
      <Text style={styles.header}>Welcome {props.username}!</Text>
      {/* <Image style={styles.image} source={{ uri: props.photoUrl }} /> */}
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor: Colors.primary,
    backgroundColor: Colors.bg,
  },
  logo: {
    // width: 65, 
    // height: 115,
    // width: 75, 
    // height: 140,
    width: 100, 
    height: 180,
    marginTop: 100,
    marginBottom: 40,

  },
  title: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 50,
    fontFamily: 'Raleway_700Bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderColor: '#fff',
    borderWidth: 3,
    borderRadius: 30,
    backgroundColor: "#fff",
    padding: 10,
    margin: 20,
    marginTop: 0,
    width: 200,
  },
  buttonText: {
    fontSize: 20,
    // color: '#fff',
    color: Colors.primary,
    marginLeft: 20,
    fontFamily: 'Raleway_700Bold',
  },
  userContainer: {
    position: 'absolute',
    top: -570,
    right: -70,
    justifyContent: 'center',
    alignItems: 'center',
    // marginVertical: 50
  },
  header: {
    fontSize: 18,
    color: "#fff",
    fontFamily: 'Raleway_700Bold',
  },
  image: {
    marginTop: 15,
    marginBottom: 0,
    width: 70,
    height: 70,
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 3,
    borderRadius: 80
  },
  googleBtn: {
    position: 'absolute',
    bottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 20,
  },
  signOutBtn: {
    backgroundColor: '#505ae0',
    width: 250,
    marginTop: 110,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    borderRadius: 5,
    marginVertical: 20,
    fontFamily: 'Raleway_700Bold',
  }
})

export default Home;


// reference: https://heartbeat.fritz.ai/getting-started-with-stack-navigator-using-react-navigation-5-in-react-native-and-expo-apps-4c516becaee1

// google login front-end: https://www.youtube.com/watch?v=ELXvcyiTTHM
// google login documentation: https://docs.expo.io/versions/latest/sdk/google/?redirected
// login button style: https://codepen.io/slukas23/pen/qwMevr

// logout reference:
// https://docs.expo.io/versions/latest/sdk/google/
// https://forums.expo.io/t/expo-google-app-auth-doenst-logout/31951
// useState or useReducer: https://www.youtube.com/watch?v=NnwkRvElx9E
// useReducer: https://www.youtube.com/watch?v=cKzrgB6MqqM
// payload: https://www.youtube.com/watch?v=AQLNv2nasU0