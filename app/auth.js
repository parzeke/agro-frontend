import { Stack } from "expo-router";
import AuthScreen from "../src/screens/AuthScreen";

export default function Auth() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <AuthScreen />
        </>
    );
}
