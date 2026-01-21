import { useEffect, useState } from "react";
import { clearApiKey, getApiKey, setApiKey } from "../api/birdeye";

const API_KEY_EVENT = "birdeye-api-key";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(getApiKey());

  useEffect(() => {
    setApiKeyState(getApiKey());
    const handleUpdate = () => setApiKeyState(getApiKey());
    window.addEventListener(API_KEY_EVENT, handleUpdate);
    return () => window.removeEventListener(API_KEY_EVENT, handleUpdate);
  }, []);

  const saveKey = (value) => {
    if (!value) return;
    setApiKey(value);
    setApiKeyState(value);
    window.dispatchEvent(new Event(API_KEY_EVENT));
  };

  const clearKey = () => {
    clearApiKey();
    setApiKeyState("");
    window.dispatchEvent(new Event(API_KEY_EVENT));
  };

  return {
    apiKey,
    saveKey,
    clearKey,
  };
}
