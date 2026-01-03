import { Stack } from "expo-router";
import AddProductScreen from "../src/screens/AddProductScreen";

export default function AddProduct() {
    return (
        <>
            <Stack.Screen options={{ title: "Agregar Producto", headerTintColor: "green" }} />
            <AddProductScreen />
        </>
    );
}
