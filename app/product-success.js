import { Stack } from "expo-router";
import ProductSuccessScreen from "../src/screens/ProductSuccessScreen";

export default function ProductSuccess() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ProductSuccessScreen />
        </>
    );
}
