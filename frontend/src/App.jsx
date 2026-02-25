import AppRoutes from "./AppRoutes.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import "./style.scss";

const App = () => {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
};

export default App;
