import AppRoutes from "./routes/AppRoutes";
import InstallAppBanner from "./components/common/InstallAppBanner";
import PushPrompt from "./components/common/PushPrompt";

function App() {

    return (
        <>
            <AppRoutes />
            <InstallAppBanner />
            <PushPrompt />
        </>
    );

}

export default App;
