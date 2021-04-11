import React from "react"
import Home from "./pages/Home"
import Suggestion from "./pages/Suggestion"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

const AppStack = createStackNavigator()

const Routes = () => {
    return (
        <NavigationContainer>
            <AppStack.Navigator headerMode="none" initialRouteName="Home">
                <AppStack.Screen name="Home" component={Home} />
                <AppStack.Screen name="Suggestion" component={Suggestion} />
            </AppStack.Navigator>
        </NavigationContainer>
    )
}

export default Routes