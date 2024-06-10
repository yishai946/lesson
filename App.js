import Stack from "./navigation/Stack";
import { AppProvider } from "./context/appContext";

export default function App() {
  return (
    <AppProvider>
      <Stack />
    </AppProvider>
  );
}
