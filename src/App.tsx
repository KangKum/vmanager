import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ElementaryPage from "./pages/ElementaryPage";
import MiddlePage from "./pages/MiddlePage";
import HighPage from "./pages/HighPage";
import SchedulePage from "./pages/SchedulePage";
import InOutPage from "./pages/InOutPage";
import PaymentPage from "./pages/PaymentPage";
import Layout from "./components/Layout";
import { AppDataProvider } from "./contexts/AppDataContext";

function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/elementary" element={<ElementaryPage />} />
            <Route path="/middle" element={<MiddlePage />} />
            <Route path="/high" element={<HighPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/inout" element={<InOutPage />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}

export default App;
