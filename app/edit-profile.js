import { Stack } from "expo-router";
import EditProfileScreen from "../src/screens/EditProfileScreen";

export default function EditProfile() {
    return (
        <>
            <Stack.Screen options={{
                title: "Editar Perfil",
                headerStyle: { backgroundColor: "#3E7C1F" },
                headerTintColor: "#fff"
            }} />
            <EditProfileScreen />
        </>
    );
}
