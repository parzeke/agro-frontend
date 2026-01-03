import { useLocalSearchParams, Stack } from "expo-router";
import { Image } from "react-native";
import ChatScreen from "../../src/screens/ChatScreen";

export default function Chat() {
    const { productName, productImage } = useLocalSearchParams();

    return (
        <>
            <Stack.Screen options={{
                headerTitle: productName || "Chat",
                headerTintColor: "#00A650",
                headerRight: () => (
                    productImage ? (
                        <Image source={{ uri: productImage }} style={{
                            width: 40,
                            height: 40,
                            borderRadius: 5,
                            marginRight: 10,
                        }} />
                    ) : null
                )
            }} />
            <ChatScreen />
        </>
    );
}
