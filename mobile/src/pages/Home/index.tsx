import React, { useState, useEffect } from "react"
import { View, Image, StyleSheet, Text, ActivityIndicator } from "react-native"
import { RectButton } from "react-native-gesture-handler"
import { Header, Icon } from "react-native-elements"
import { useNavigation } from "@react-navigation/native"
import Swiper from "react-native-deck-swiper";
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";

import MainApi from "../../services/ApiModule"

interface Activity {
    Activity_ID: number,
    Category_ID: string,
    Description: string,
    Duration: string,
    ID: number,
    Image: any,
    ImageLink: string,
    LinkNetflix: string,
    Title: string
}

interface Category {
    ID: number,
    Name: string,
}

const colors = {
    red: '#D14950',
    blue: '#59A9E3',
    gray: '#777777',
    black: '#202225',
    white: '#f6f7f1',
    green: '#34a0a4',
    pink: '#DB9487',
    darkgreen: 'rgba(9,30,31,1)',
    transparent: 'rgba(0,0,0,0)'
};

const Card = ({ card }: { card: Activity }) => (
    <View style={styles.card}>
        <Image source={{ uri: card.ImageLink }} style={styles.cardImage} />
        <LinearGradient colors={[colors.transparent, 'rgba(9,30,31,0.3)', 'rgba(9,30,31,0.7)', 'rgba(9,30,31,0.9)', colors.darkgreen]} style={styles.gradient}>

            <View style={styles.cardDetails}>
                <Text style={[styles.category]}>{card.Category_ID}</Text>
                <Text style={[styles.title]}>{card.Title}</Text>

                <View style={styles.timeText}>
                    <Icon name='access-time' size={20} color={colors.white} />
                    <Text style={[styles.time]}>{card.Duration}</Text>
                </View>

                <View style={styles.seeDetails}>
                    <Text style={{
                        color: colors.white, fontFamily: 'Montserrat-Bold', fontSize: 16,
                        alignContent: "center", textAlign: "center"
                    }}>VER ATIVIDADE</Text>
                </View>
            </View>
        </LinearGradient>
    </View>
);

// const swiperRef = React.createRef();

const Home = () => {
    const [index, setIndex] = useState(0);
    var [activities, setActivities] = useState<Activity[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("-1");
    var [activitiesByInterest, setActivitiesByInterest] = useState<Activity[] | null>(null);
    const navigation = useNavigation();


    useEffect(() => {
        const getCategories = async () => {
            await MainApi.GetAllCategories().then(res => setCategories(res.data))
        }
        getCategories();
        const getActivities = async () => {
            await MainApi.GetAllActivities().then(res => setActivities(res.data))
        }
        getActivities();
        async function getUserId() {
            const id = await AsyncStorage.getItem("LOGIN_ID");
            setUserId((id == null) ? '0' : id);
        }
        getUserId();
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
        async function getInterests() {
            MainApi.GetInterestForUser(userId).then(
                res => {
                    const interests = res.data;
                    if (activities.length != 0) {
                        function fixCategories() {
                            for (let i = 0; i < activities.length; i++) {
                                const index = categories.findIndex(category => category.ID.toString() == activities[i].Category_ID);
                                if (index != -1) {
                                    activities[i].Category_ID = categories[index].Name;
                                }
                            }
                            return true;
                        }
                        fixCategories();
                        shuffle(activities);
                        function isInteresting(activity: Activity) {
                            // @ts-ignore: Parameter 'element' implicitly has an 'any' type.
                            const found = interests.find(element => element.Name == activity.Category_ID);
                            if (found) {
                                return true;
                            } else return false;
                        }
                        function shuffle(array) {
                            var currentIndex = array.length, temporaryValue, randomIndex;

                            // While there remain elements to shuffle...
                            while (0 !== currentIndex) {

                                // Pick a remaining element...
                                randomIndex = Math.floor(Math.random() * currentIndex);
                                currentIndex -= 1;

                                // And swap it with the current element.
                                temporaryValue = array[currentIndex];
                                array[currentIndex] = array[randomIndex];
                                array[randomIndex] = temporaryValue;
                            }

                            return array;
                        }
                        let interestsAtvd = activities.filter(isInteresting);
                        let notInterestsAtvd = activities.filter(e => !isInteresting(e));

                        const newActivities = interestsAtvd.concat(notInterestsAtvd);
                        setActivitiesByInterest(newActivities);
                    }
                });
        }
        if (userId !== '-1') {
            getInterests();
        }
    }, [activities, userId]);

    const onSwiped = () => {
        setIndex((index + 1) % activities.length);
    }

    return (
        <>
            <Header
                placement="left"
                centerComponent={
                    <>
                        {username != "" && (
                            <Text style={{ color: '#DB9487', fontSize: 25, fontFamily: 'MontserratAlternates-SemiBold' }}>
                                Olá, {username}!
                            </Text>)}
                    </>
                }
                rightComponent={
                    <View style={{ flexDirection: 'row' }}>
                        <Icon name='star-border' size={30} color={colors.green} style={styles.headerIcon} onPress={() => navigation.navigate("Favorites")} />
                        <Icon name='person' size={30} color={colors.green} style={styles.headerIcon} onPress={() => navigation.navigate("Statistics")} />
                    </View>
                }
                backgroundColor='#f0f0f0'
            />
            <View style={styles.container}>
                {activitiesByInterest && (
                    <>
                        <Text style={{flex:0.05, color: colors.green, fontSize: 20, fontFamily: 'Montserrat-Medium', textAlign:'center',textAlignVertical:"bottom" }}>
                            Sugestões para você!
                        </Text>
                        <View style={styles.swiperContainer}>
                            <Swiper
                                //ref="swiperRef"
                                cards={activitiesByInterest}
                                cardIndex={index}
                                renderCard={card => <Card card={card} />}
                                onSwiped={onSwiped}
                                onTapCard={() => navigation.navigate("Suggestion", {
                                    Activity_ID: activitiesByInterest[index].Activity_ID,
                                    Category_ID: activitiesByInterest[index].Category_ID
                                })}
                                stackSize={2}
                                stackScale={7}
                                stackSeparation={10}
                                disableBottomSwipe
                                disableTopSwipe
                                animateOverlayLabelsOpacity
                                infinite
                                backgroundColor={"transparent"}
                                //showSecondCard={false}
                                overlayLabels={{
                                    left: {
                                        title: "DEPOIS",
                                        style: {
                                            label: {
                                                backgroundColor: colors.red,
                                                color: colors.white,
                                                fontSize: 24
                                            },
                                            wrapper: {
                                                flexDirection: "column",
                                                alignItems: "flex-end",
                                                justifyContent: "flex-start",
                                                marginTop: 20,
                                                marginLeft: -20
                                            }
                                        }
                                    },
                                    // right: {
                                    //     title: "COMEÇAR",
                                    //     style: {
                                    //         label: {
                                    //             backgroundColor: colors.blue,
                                    //             color: colors.white,
                                    //             fontSize: 24
                                    //         },
                                    //         wrapper: {
                                    //             flexDirection: "column",
                                    //             alignItems: "flex-start",
                                    //             justifyContent: "flex-start",
                                    //             marginTop: 20,
                                    //             marginLeft: 20
                                    //         }
                                    //     }
                                    // },
                                }}
                            />
                        </View>
                        <Text style={{flex:0.1, color: '#34a0a480', fontSize: 15, fontFamily: 'Montserrat-Regular', textAlign:'center',textAlignVertical:"center" }}>
                            Deslize para descartar atividade
                        </Text>
                    </>

                ) || (
                        <>
                            <View style={{ paddingVertical: 50, backgroundColor: colors.green }}>
                                <Text style={{ color: colors.white, fontFamily: 'Montserrat-Medium', fontSize: 20, alignContent: "center", textAlign: "center" }}>
                                    Selecionando as melhores sugestões para você!
                                </Text>
                            </View>
                            <View style={{ paddingVertical: 50 }}>
                                <ActivityIndicator size="large" color={colors.green} />
                            </View>
                        </>
                    )}
                {/* <View style={styles.bottomContainer}>
                    <CardDetails index={index}/>
                    <View>
                        <MaterialCommunityIcons.button
                            name="close"
                            size={94}
                            backgroundColor="transparent"
                            underlayColor="transparent"
                            activeOpacity={0.3}
                            color={colors.red}
                            onPress={() => swiperRef.current.swipeLeft()}
                        />
                    </View>
                </View> */}

            </View>

        </>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: 'center'
    },

    footer: {},

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    },

    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",

    },

    swiperContainer: {
        flex: 0.80
    },

    card: {
        flex: 0.75,
        borderRadius: 10,
        shadowRadius: 25,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 0 },
        backgroundColor: colors.black,
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
    },

    cardImage: {
        // width: 400,
        // flex: 1,
        ...StyleSheet.absoluteFillObject,
        resizeMode: "cover",
        borderRadius: 10
    },

    bottomContainer: {
        flex: 0.45
    },

    cardDetails: {
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        width: '100%'
    },

    text: {
        fontFamily: "Courier"

    },

    category: {
        fontSize: 14,
        fontFamily: 'Raleway-Medium',
        marginBottom: 10,
        color: colors.white,
        alignContent: "flex-start",
        marginHorizontal: 15
    },

    title: {
        fontSize: 24,
        marginBottom: 20,
        fontFamily: 'Raleway-Medium',
        color: colors.white,
        alignContent: "flex-start",
        marginHorizontal: 15
    },

    description: {
        fontSize: 16,
        marginBottom: 30,
        color: colors.white,
        alignContent: "flex-start",
        marginHorizontal: 15
    },

    time: {
        color: colors.white,
        fontFamily: 'Raleway-Medium',
        fontSize: 16,
        fontWeight: "500",
        alignContent: "flex-start",
        marginBottom: 10,
        marginHorizontal: 5
    },

    timeText: {
        flexDirection: "row",
        marginHorizontal: 15,
        marginBottom: 10
    },
    seeDetails: {
        flexDirection: "column",
        alignItems: "center",
        alignContent: "center",
        justifyContent: 'center',
        alignSelf: "center",
        margin: 20
    },
    gradient: {
        borderRadius: 10,
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        width: '100%',
        height: '70%'
    },
    headerIcon: {
        paddingHorizontal: 5
    }


});

export default Home
