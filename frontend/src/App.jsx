import AppRoutes from "./AppRoutes.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthProvider } from "./features/auth/context/auth.context.jsx";
import "./style.scss";

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
