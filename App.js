import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableHighlight,
  ScrollView,
  Button,
  TouchableOpacity
} from 'react-native';
import Voice from 'react-native-voice';
import Slider from '@react-native-community/slider';
import Tts from 'react-native-tts';
import io from 'socket.io-client/dist/socket.io';
import { Dialogflow_V2 } from 'react-native-dialogflow';
import { dialogflowConfig } from './env';

// const BOT_USER = {
//   _id: 2
// };

class App extends Component {
  state = {
    pitch: '',
    end: '',
    started: '',
    results: '',
    ttsStatus: 'initiliazing',
    selectedVoice: 'id-ID-language',
    speechRate: 0.5,
    speechPitch: 1,
    text: '',
    tools: [],
    lamp: "",
    lampText:"",
    colorLamp: "",
  };

  constructor(props) {
    super(props);
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConfig.project_id
    );
    Voice._startRecognizing = this._stopRecognizing.bind(this)
    Voice.onSpeechResults = this.onSpeechResults.bind(this)
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this)

    var socket = this.socket = io('https://plug-plant.herokuapp.com/');
    socket.on("all tools", snap => {
        this.setState({
            lamp: snap.lamp,
        });
            if (snap.lamp) {
              this.setState({
                lampText: "OFF",
                colorLamp: "red",
                text: "lampu mati"
              })
            }else {
              this.setState({
                lampText: "ON",
                colorLamp: "blue",
                text: "lampu menyala"
              })
            }
          });
  }

  onSpeechResults = e => {
    this.setState({
      results: e.value[0].toLowerCase(),
    }, () => {
      Voice.stop()
    });
    this.onSend(this.state.results)
  };

  onSpeechEnd = e => {
    //Invoked when SpeechRecognizer stops recognition
    console.log('onSpeechEnd: ', e);
    this.setState({
      end: '√',
    });
  };

  onSend(messages) {
    Dialogflow_V2.requestQuery(
      messages,
      result => this.handleGoogleResponse(result),
      error => console.log(error)
    );
  }

  handleGoogleResponse(result) {
    let text = result.queryResult.fulfillmentMessages[0].text.text[0];
    this.sendBotResponse(text);
  }

  sendBotResponse(text) {
    if(text === "lampu menyala"){
      if (this.state.lamp) {
            this.setState({
              text: "lampu sudah menyala",
            });
          }else {
            this.setState({
              text: text,
            });
          this.socket.emit('update sensor', {lamp: true})
          }
          Tts.stop();
          Tts.speak(this.state.text);
    }else if(text === "lampu mati") {
      if (!this.state.lamp) {
          this.setState({
              text: "lampu sudah mati",
          });
              }else {
                this.setState({
                  text: text,
                });
              this.socket.emit('update sensor', {lamp: false})
              }
      Tts.stop();
      Tts.speak(this.state.text);
    } else {
      this.setState({
        text: text,
      });
      Tts.stop();
      Tts.speak(this.state.text);
    }
  }



  btnLamp = async () => {
    await this._destroyRecognizer();
        if (this.state.lamp) {
          this.setState({
            lampText: "OFF",
            colorLamp: "red",
            text: "lampu mati"
          })
          this.socket.emit('update sensor', {lamp: false})
        }else {
          this.setState({
            lampText: "ON",
            colorLamp: "blue",
            text: "lampu menyala"
          })
          this.socket.emit('update sensor', {lamp: true})
        }
      Tts.stop();
      Tts.speak(this.state.text);
      this.setState({ ttsStatus: 'finished' })
  }


  _startRecognizing = async () => {
    //Starts listening for speech for a specific locale
    this.setState({
      pitch: '',
      started: '',
      results: '',
      end: '',
    });

    try {
      await Voice.start('id-ID');
    } catch (e) {
      //eslint-disable-next-line
      console.error(e);
    }
  };

  _stopRecognizing = async () => {
    //Stops listening for speech
    try {
      await Voice.stop();
    } catch (e) {
      //eslint-disable-next-line
      console.error(e);
    }
  };

  _cancelRecognizing = async () => {
    //Cancels the speech recognition
    try {
      await Voice.cancel();
    } catch (e) {
      //eslint-disable-next-line
      console.error(e);
    }
  };

  _destroyRecognizer = async () => {
    //Destroys the current SpeechRecognizer instance
    try {
      await Voice.destroy();
    } catch (e) {
      //eslint-disable-next-line
      console.error(e);
    }
    this.setState({
      pitch: '',
      started: '',
      results: '',
      end: '',
      text:''
    });
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.welcome}>
            Miniature Smart Home
          </Text>

          <Text style={{marginBottom: 3, fontSize: 15}}>
            Lampu
          </Text>
          <TouchableOpacity
             // style={styles.customBtnBG}
             style={{backgroundColor : this.state.colorLamp, paddingHorizontal: 30,paddingVertical: 5, borderRadius: 30, margin: 5}}
             onPress={this.btnLamp}
           >
             <Text style={styles.customBtnText}>{this.state.lampText}</Text>
           </TouchableOpacity>

          <Text style={styles.instructions}>
            Sentuh mikrofon untuk bicara
          </Text>
          <TouchableHighlight
            onPress={this._startRecognizing}
            style={{ marginVertical: 20 }}>
            <Image
              style={styles.button}
              source={{
                uri:
                  'https://raw.githubusercontent.com/AboutReact/sampleresource/master/microphone.png',
              }}
            />
          </TouchableHighlight>
          <Text
            style={{
              textAlign: 'center',
              color: '#B0171F',
              marginBottom: 1,
              fontWeight: '700',
            }}>
            Hasil
          </Text>

          <Text
          style = {
            {
              textAlign: 'center',
              color: '#B0171F',
              marginBottom: 1,
              fontWeight: '700',
            }
          }>
          {this.state.results}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'space-between',
              position: 'absolute',
              bottom: 0,
            }}>
            <TouchableHighlight
              onPress={this._stopRecognizing}
              style={{ flex: 1, backgroundColor: 'red' }}>
              <Text style={styles.action}>Berhenti</Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={this._cancelRecognizing}
              style={{ flex: 1, backgroundColor: 'red' }}>
              <Text style={styles.action}>Batal</Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={this._destroyRecognizer}
              style={{ flex: 1, backgroundColor: 'red' }}>
              <Text style={styles.action}>Hapus</Text>
            </TouchableHighlight>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 50,
  },
  action: {
    width: '100%',
    textAlign: 'center',
    color: 'white',
    paddingVertical: 8,
    marginVertical: 5,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
    marginTop: 10
  },
  stat: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
    marginTop: 30,
  },
  customBtnText: {
        fontSize: 40,
        fontWeight: '400',
        color: "#fff",
    }
});
export default App;
