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

class App extends Component {
  state = {
    pitch: '',
    end: '',
    started: '',
    partialResults: '',
    voices: [],
    ttsStatus: 'initiliazing',
    selectedVoice: 'id-ID-language',
    speechRate: 0.5,
    speechPitch: 1,
    text: '',
    tools: [],
    lamp: "",
    pump: "",
    colorLamp: "",
    colorPump: ""
  };

  constructor(props) {
    super(props);
    var socket = this.socket = io('http://plug-plant.herokuapp.com');
    socket.on("all tools", snap => {
        this.setState({
            tools: snap,
        });
        this.state.tools.map((item) => {
            if (item.lamp) {
              this.setState({
                lamp: "OFF",
                colorLamp: "red",
                text: "lampu mati"
              })
            }else {
              this.setState({
                lamp: "ON",
                colorLamp: "blue",
                text: "lampu menyala"
              })
            }
          })
    });
    //Setting callbacks for the process status
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Tts.addEventListener('tts-start', event =>
      this.setState({ ttsStatus: 'started' })
    );
    Tts.addEventListener('tts-finish', event =>
      this.setState({ ttsStatus: 'finished' })
    );
    Tts.addEventListener('tts-cancel', event =>
      this.setState({ ttsStatus: 'cancelled' })
    );
  }

  // componentWillUnmount() {
  //   //destroy the process after switching the screen
  //   Voice.destroy().then(Voice.removeAllListeners);
  // }

  onSpeechPartialResults = e => {
    this.setState({
      partialResults: e.value,
    });

    if (this.state.partialResults[0].toLowerCase() === "nyalakan lampu") {
      Tts.addEventListener('tts-start', event =>
        this.setState({ ttsStatus: 'started' })
      );
      this.state.tools.map((item) => {
        if (item.lamp) {
          this.setState({
            text: "lampu sudah menyala",
          });
        }else {
          this.setState({
            text: "lampu menyala",
          });
        this.socket.emit('update sensor', {lamp: true})
        }
    })
    Tts.stop();
    Tts.speak(this.state.text);
    Tts.addEventListener('tts-start', event =>
      this.setState({ ttsStatus: 'finished' })
    );
  }

  else if (this.state.partialResults[0].toLowerCase() === "matikan lampu") {
    Tts.addEventListener('tts-start', event =>
      this.setState({ ttsStatus: 'started' })
    );
      this.state.tools.map((item) => {
        if (!item.lamp) {
          this.setState({
            text: "lampu sudah mati",
          });
        }else {
          this.setState({
            text: "lampu mati",
          });
        this.socket.emit('update sensor', {lamp: false})
        }
      })
      Tts.stop();
      Tts.speak(this.state.text);
      Tts.addEventListener('tts-start', event =>
        this.setState({ ttsStatus: 'finished' })
      );
    }
  };

  btnLamp = async () => {
    await this._destroyRecognizer();
    this.state.tools.map((item) => {
        if (item.lamp) {
          this.setState({
            lamp: "OFF",
            color: "red",
            text: "lampu mati"
          })
          this.socket.emit('update sensor', {lamp: false})
        }else {
          this.setState({
            lamp: "ON",
            color: "blue",
            text: "lampu menyala"
          })
          this.socket.emit('update sensor', {lamp: true})
        }
      })
      Tts.stop();
      Tts.speak(this.state.text);
      this.setState({ ttsStatus: 'finished' })
  }


  _startRecognizing = async () => {
    //Starts listening for speech for a specific locale
    this.setState({
      pitch: '',
      started: '',
      partialResults: '',
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

  onSpeechVolumeChanged = () => {
   //Invoked when pitch that is recognized changed
   this.setState({
     pitch: 100,
   });
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
      partialResults: '',
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
             <Text style={styles.customBtnText}>{this.state.lamp}</Text>
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
          {this.state.partialResults}
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
