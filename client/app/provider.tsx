import { Provider } from "react-redux";

import { Store } from "../redux/store";

interface ProviderProps {
  children: any;
}

export function Providers({ children }: ProviderProps) {
  return <Provider store={Store}>{children}</Provider>;
}
