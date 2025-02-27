import React, { useEffect, useState } from 'react';
import { Header, Icon, Button } from "react-native-elements";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  ScrollView,
  Modal,
  Pressable,
  SafeAreaView
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from "@react-native-async-storage/async-storage"
import TrackAppsUsage from "../../services/AppsTracker/TrackerModule"
import { useNavigation } from "@react-navigation/native"
import MainApi from "../../services/ApiModule"


const configTime = () => {

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(0);
  const [modalTitle, setModalTitle] = useState("");
  const [active, setActive] = useState(false);
  const [activeString, setActiveString] = useState("");
  const ACTIVE = "ATIVO";
  const [activeIcon, setActiveIcon] = useState("check-circle");
  const [activeIconColor, setActiveIconColor] = useState("green");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("-1");
  const LOGIN_ID = "LOGIN_ID";

  useEffect(() => {
    async function fun() {
      const login = await AsyncStorage.getItem(LOGIN_ID);
      setUserId((login == null) ? '-1' : login);
    }
    fun();
  }, []);

  useEffect(() => {
    async function updateUsername() {
      MainApi.GetUserDataByID(+userId).then(res => setUsername(res.data[0].Name));
    }
    if (userId != '-1') {
      updateUsername();
    }
  }, [userId]);

  useEffect(() => {
    async function fun() {
      const isActive = await AsyncStorage.getItem(ACTIVE);
      setActive((isActive && isActive === "ativo") ? true : false);
    }
    fun();
  }, []);

  useEffect(() => {
    if (active) {
      setActiveString("ATIVADO");
      setActiveIcon("check-circle");
      setActiveIconColor("green");
      TrackAppsUsage.StartDailyTimeWorkerForApps(["WhatsApp", "Facebook", "Instagram", "Twitter", "TikTok"],
        [data[0].count.toString(), data[1].count.toString(), data[2].count.toString(), data[3].count.toString(), data[4].count.toString()],
        (error: String) => {
          console.log(error);
        });
    }
    else {
      setActiveString("DESATIVADO");
      setActiveIcon("highlight-off");
      setActiveIconColor("red");
      TrackAppsUsage.StopDailyWorker();
    }
  }, [active]);

  const saveActive = async (active: boolean) => {
    if (active) {
      console.log(TrackAppsUsage.CheckForPermission((error: String, value: Object) => {
        if (error) {
          console.log(error)
        }
        else {
          if (!value)
          TrackAppsUsage.AskForPermission();
        }
      }))
      await AsyncStorage.setItem(ACTIVE, "ativo");
    }
    else {
      await AsyncStorage.setItem(ACTIVE, "Nao ativo");
    }

    setActive(active);
  }


  const openSettingsModal = (title: string, settings: number) => {
    setModalTitle(title);
    setModalData(settings);
    setModalVisible(!modalVisible);
  }
  const KEY_WHATSAPP = "WHATSAPP";
  const KEY_FACEBOOK = "FACEBOOK";
  const KEY_INSTAGRAM = "INSTAGRAM";
  const KEY_TWITTER = "TWITTER";
  const KEY_TIKTOK = "TIKTOK";


  const saveTimeForAppAndChangeModal = async (titulo: string, visible: boolean) => {
    setModalVisible(!visible);

    var newData = [...data];
    if (titulo === "WhatsApp") {
      newData[0].count = modalData;
      await AsyncStorage.setItem(KEY_WHATSAPP, modalData.toString());
    }
    else if (titulo === "Facebook") {
      newData[1].count = modalData;
      await AsyncStorage.setItem(KEY_FACEBOOK, modalData.toString());
    }
    else if (titulo === "Instagram") {
      newData[2].count = modalData;
      await AsyncStorage.setItem(KEY_INSTAGRAM, modalData.toString());
    }
    else if (titulo === "Twitter") {
      newData[3].count = modalData;
      await AsyncStorage.setItem(KEY_TWITTER, modalData.toString());
    }
    else if (titulo === "TikTok") {
      newData[4].count = modalData;
      await AsyncStorage.setItem(KEY_TIKTOK, modalData.toString());
    }
    setData(newData);

    TrackAppsUsage.StartDailyTimeWorkerForApps(["WhatsApp", "Facebook", "Instagram", "Twitter", "TikTok"],
      [data[0].count.toString(), data[1].count.toString(), data[2].count.toString(), data[3].count.toString(), data[4].count.toString()],
      (error: String) => {
        console.log(error);
      });
  }

  useEffect(() => {
    async function fun() {
      const countWpp = await AsyncStorage.getItem(KEY_WHATSAPP);
      const countFace = await AsyncStorage.getItem(KEY_FACEBOOK);
      const countInsta = await AsyncStorage.getItem(KEY_INSTAGRAM);
      const countTwt = await AsyncStorage.getItem(KEY_TWITTER);
      const countTt = await AsyncStorage.getItem(KEY_TIKTOK);

      var newData = [...data];


      newData[0].count = countWpp ? Number.parseInt(countWpp) : 30;
      newData[1].count = countFace ? Number.parseInt(countFace) : 30;
      newData[2].count = countInsta ? Number.parseInt(countInsta) : 30;
      newData[3].count = countTwt ? Number.parseInt(countTwt) : 30;
      newData[4].count = countTt ? Number.parseInt(countTt) : 30;


      setData(newData);
    }
    fun();
  }, []);

  const [data, setData] = useState([
    { id: 1, name: "WhatsApp", image: require('../../assets/wpp_icon.png'), count: 0 },
    { id: 2, name: "Facebook", image: require('../../assets/fb_icon.png'), count: 12 },
    { id: 3, name: "Instagram", image: require('../../assets/insta_icon.png'), count: 2 },
    { id: 4, name: "Twitter", image: require('../../assets/twitter_icon.png'), count: 23 },
    { id: 5, name: "TikTok", image: require('../../assets/tiktok_icon.png'), count: 4 },
  ]);
  const navigation = useNavigation()
  return (
    <>
      <SafeAreaView style={styles.container}>
        <Header
          placement="left"
          leftComponent={
            <>
              <TouchableOpacity
                style={styles.returnButton}
              >
                <Icon name='navigate-before' size={25} style={styles.buttonIcon} onPress={() => navigation.navigate("Home")} />
              </TouchableOpacity>
            </>
          }
          centerComponent={
            <>
              {username != "" && (<Text style={{ color: '#DB9487', fontSize: 25, fontFamily: 'MontserratAlternates-SemiBold' }}>
                Olá, {username}!
              </Text>)}
            </>
          }
          rightComponent={
            <View style={{ flexDirection: 'row' }}>
              <Icon name='star-border' size={30} color={'#34a0a4'} onPress={() => navigation.navigate("Favorites")} />
              <Icon name='person' size={30} color={'#34a0a4'} onPress={() => navigation.navigate("Statistics")} />
            </View>
          }
          backgroundColor='#f0f0f0'
        />
        <Text style={styles.titleText}>Personalize seu tempo nas Redes</Text>
        <View style={{ padding: 10 }}>
          <Button title={activeString} type="clear" icon={<Icon name={activeIcon} color={activeIconColor} />} 
            onPress={async () => { 
              await saveActive(!active);
              }} />
        </View>
        <View style={styles.container}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Defina quantas horas você gostaria de passar no {modalTitle}</Text>
                <Text style={styles.text}>
                  {modalData <= 60 ? <Text>{modalData} Minutos por dia</Text> : <Text>1 Horas e {modalData - 60} Minutos por dia</Text>}
                </Text>
                <Slider
                  style={{ width: 300, height: 40 }}
                  minimumValue={0}
                  maximumValue={120}
                  step={5}
                  value={modalData}
                  minimumTrackTintColor="red"
                  maximumTrackTintColor="#000000"
                  onValueChange={value => { if (true) { setModalData(value) } }}
                />
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={async () => await saveTimeForAppAndChangeModal(modalTitle, modalVisible)}
                >
                  <Text style={styles.textStyle}>Salvar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <Text style={styles.subtitleText}>Defina quantas horas por dia você quer passar em cada app!</Text>
          <FlatList
            style={styles.contentList}
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity style={styles.card} onPress={() => openSettingsModal(item.name, item.count)}>
                  <Image style={styles.image} source={item.image} />
                  <View style={styles.cardContent}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View>
                      {item.count <= 60 ? 
                      <Text style={styles.count}>
                        Meta: {item.count} Min por dia
                      </Text> : 
                      <Text style={styles.count}>
                        Meta: 1H {item.count - 60} Min por dia
                      </Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }} />
        </View>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
    backgroundColor: "#f6f7f1",
    height: '100%'
  },
  contentList: {
    flex: 1,
    height: '100%',
    marginBottom:20
  },
  cardContent: {
    marginLeft: 20,
    marginTop: 10,
    alignSelf: 'center'
  },
  image: {
    width: 80,
    height: 80,
    margin:10,
    marginRight:0,
    tintColor:'#f6f7f1'
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily:'Montserrat-Regular',
    margin: 10,
  },
  subtitleText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily:'Montserrat-Medium',
    color: '#db9487'
  },

  card: {
    elevation: 20,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    backgroundColor: "#34a0a4",
    padding: 10,
    flexDirection: 'row',
    borderRadius: 30,
  },

  name: {
    fontSize: 20,
    flex: 1,
    alignSelf: 'flex-start',
    color: "#ffffff",
    fontFamily:'Montserrat-Bold'
  },
  count: {
    fontSize: 15,
    fontFamily:'Montserrat-Regular',
    flex: 1,
    alignSelf: 'flex-start',
    color: "#ffffff"
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    width: '90%',
    height: '45%',
    justifyContent: 'center',
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 5.25,
    shadowRadius: 9,
    elevation: 10
  },
  button: {
    borderRadius: 20,
    padding: 15,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontFamily:'Montserrat-Bold',
    textAlign: "center"
  },
  modalText: {
    fontSize: 25,
    marginBottom: 15,
    fontFamily:'Montserrat-Bold',
    textAlign: "center"
  },
  titleText: {
    fontSize: 25,
    fontFamily:'Montserrat-Bold',
    textAlign: "center",
    color: '#db9487'
  },
  returnButton: {
    backgroundColor: "#a1c9c9",
    borderRadius: 50,
    padding: 6
  },

  buttonIcon: {
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF'
  },
});

export default configTime