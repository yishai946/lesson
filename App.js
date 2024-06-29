import Stack from "./navigation/Stack";
import { AppProvider } from "./context/appContext";
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <AppProvider>
      <Stack />
      <Toast />
    </AppProvider>
  );
}
