import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ToastAndroid, TextInput, KeyboardAvoidingView, TouchableOpacity, Animated, Alert, ActivityIndicator } from 'react-native';
import { Header, Icon } from "react-native-elements"
import { useNavigation , useRoute} from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import MainApi from "../../services/ApiModule"

const EditProfile = () => {
    const [offset] = useState(new Animated.ValueXY({ x: 0, y: 80 }));
    const navigation = useNavigation()
    const [pswDoesntMatchText, setPswDoesntMatchText] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [psw, setPsw] = useState("");
    const [pswConf, setPswConf] = useState("");
    const [pswsMatches, setPswMatches] = useState(false);
    const [checkingRegister, setCheckingRegister] = useState(false);
    const LOGIN_EMAIL = "LOGIN_EMAIL";
    const LOGIN_PSW = "LOGIN_PSW";
    const LOGIN_ID = "LOGIN_ID";

    const [id, setId] = useState("");
    const [oldEmail, setOldEmail] = useState("");
    const [oldPsw, setOldPsw] = useState("");

    const showToastWithGravity = () => {
        ToastAndroid.showWithGravity(
          "Dados Atualizados",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      };

    useEffect(() => {
        async function fun() {
            const newlogin = await AsyncStorage.getItem(LOGIN_ID);
            const newpsw = await AsyncStorage.getItem(LOGIN_PSW);
            const oldemail = await AsyncStorage.getItem(LOGIN_EMAIL);
            setId((newlogin == null) ? '-1' : newlogin);
            setOldPsw((newpsw == null) ? '-1' : newpsw);
            
            setOldEmail((oldemail == null) ? '-1' : oldemail);
            
            
            MainApi.GetUserDataByID(newlogin).then(res => {

                    var nameBD = res.data[0].Name;
                    var emailBD = res.data[0].Email;
                    setName((nameBD == null) ? '-1' : nameBD);
                    setEmail((emailBD == null) ? '-1' : emailBD);
                
              }).catch(err => console.log(err));
            
            
          }
          fun();
    }, []);

    async function saveLogin(id: string) {
        await AsyncStorage.setItem(LOGIN_EMAIL, email);
        await AsyncStorage.setItem(LOGIN_PSW, psw);
        await AsyncStorage.setItem(LOGIN_ID, id.toString());
    }

    function checkLogin(userEmail: string, userPsw: string) {
        MainApi.GetUser(userEmail, userPsw).then(res => {
        showToastWithGravity()
        saveLogin(res.data[0].ID).then(() => navigation.navigate("Statistics"));
          
        }).catch(err => console.log(err));
        return false;
    }

    function checkNRegister() {
        MainApi.CheckIfEmailExists(email).then(res => {
            const emailExists = res.data[0]["EmailCadastrado"];

            if (!emailExists || email == oldEmail) {
                var senha;
                if(psw === ""){
                    senha = oldPsw; 
                }else{
                    senha = psw; 
                }
                MainApi.UpdateUser(id,name, email, senha);
                checkLogin(email, senha);
                setCheckingRegister(false);
            }
            else {
                setCheckingRegister(false);
                Alert.alert("Email inválido", "O email já existe!");
            }
        });
      }
    
    function enterRegister() {
        setCheckingRegister(true);
        if (name === "") {
            Alert.alert("Nome inválido", "O nome não pode ser vazio!");
            setCheckingRegister(false);
            return;
        }
        else if (email === "") {
            Alert.alert("Email inválido", "O email não pode ser vazio!");
            setCheckingRegister(false);
            return;
        }
        else if (psw === "" && oldPsw === "") {
            Alert.alert("Senha inválida", "A senha não pode ser vazia!");
            setCheckingRegister(false);
            return;
        }
        else if (psw != "") {
            if (!pswsMatches) {
                Alert.alert("Senha inválida", "As senhas não batem!");
                setCheckingRegister(false);
                return;
            }
        }

        checkNRegister();
    }

    useEffect(() => {
        // only update after load all inputs
        if (name === "" && email === "" && psw === "" && pswConf === "") return;

        if (pswConf === "")  return;

        setPswDoesntMatchText(getPswTextAndSetMatch);
    }, [psw]);

    useEffect(() => {
        // only update after load all inputs
        if (name === "" && email === "" && psw === "" && pswConf === "") return;

        setPswDoesntMatchText(getPswTextAndSetMatch);
    }, [pswConf]);

    const getPswTextAndSetMatch = ():string => {

        if (psw !== pswConf) {
            setPswMatches(false);
            return "As senhas não batem!";
        }
        else {
            setPswMatches(true);
            return "";
        }
    }

    useEffect(() => {
        Animated.spring(offset.y,{toValue:0, speed:8, useNativeDriver: true}).start();
    }, []);

    return (
        <>
            <Header
                placement="left"
                leftComponent={
                    <>
                        <TouchableOpacity
                            style={styles.returnButton}
                            onPress={() => navigation.navigate("Statistics")}
                        >
                            <Icon name='navigate-before' size={25} style={styles.buttonIcon} />
                        </TouchableOpacity>
                    </>
                }
                containerStyle={{
                    marginTop: 5,
                    borderBottomColor: 'rgba(0, 0, 0, 0)'
                }}
                backgroundColor='rgba(0, 0, 0, 0)'
            />
            <KeyboardAvoidingView style={styles.background}>


                <Animated.View
                    style={[styles.containerBody,
                    {
                        transform: [
                            { translateY: offset.y }]
                    }]}>
                    <Text style={styles.titleText}>Edite seu perfil!</Text>
                    <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName}/>
                    <TextInput style={styles.input} keyboardType='email-address' placeholder="Email" autoCapitalize="none" 
                    onChangeText={e => setEmail(e.toLowerCase().trim())}/>
                    <TextInput style={styles.input} secureTextEntry={true} placeholder="Senha" autoCapitalize="none" 
                    onChangeText={setPsw}/>
                    <TextInput style={styles.lastInput} secureTextEntry={true} placeholder="Confirme a senha" autoCapitalize="none" 
                    onChangeText={setPswConf} />
                    
                    <Text style={styles.pswDoesntMatch}>{pswDoesntMatchText}</Text>
                    {!checkingRegister && (
                    <TouchableOpacity style={styles.btnRegister} onPress={enterRegister}>
                        <Text style={styles.registerText}>Editar</Text>
                    </TouchableOpacity>) || 
                    ( <ActivityIndicator size="large" color={'#34a0a4'} />)}

                </Animated.View>

            </KeyboardAvoidingView>
        </>

    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f6f7f1',

    },
    returnButton: {
        alignItems: "center",
        backgroundColor: "#a1c9c9",
        borderRadius: 50,
        padding: 6
    },

    buttonIcon: {
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF'
    },
    titleText: {
        fontSize: 20,
        textAlign: 'center',
        fontFamily:'Montserrat-Medium',
        marginBottom: 40,
        color: '#db9487'
    },
    containerBody: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
    },
    input: {
        backgroundColor: '#a1c9c9',
        width: '90%',
        padding: 10,
        color: '#000',
        marginBottom: 15,
        fontSize: 17,
        borderRadius: 7
    },
    lastInput: {
        backgroundColor: '#a1c9c9',
        width: '90%',
        padding: 10,
        color: '#000',
        fontSize: 17,
        borderRadius: 7
    },
    btnRegister: {
        width: '70%',
        height: 50,
        backgroundColor: '#34a0a4',
        marginTop: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',

    },
    registerText: {
        color: '#fff',
        fontFamily:'Montserrat-Medium',
        fontSize: 17,
    },
    pswDoesntMatch: {
        color: '#ff0033',

    }

});

export default EditProfile
