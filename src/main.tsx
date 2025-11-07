import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import WaiverForm from "./pages/WaiverForm.tsx";
import { ThemeProvider } from "./components/layout/ThemeContext";
import "./index.css";

const path = window.location.pathname;

if (path.startsWith("/waiver-form/")) {
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
      <WaiverForm />
    </ThemeProvider>
  );
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
  
