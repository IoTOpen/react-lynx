import { jsx as _jsx } from "react/jsx-runtime";
import { LynxClientProvider } from './LynxClientProvider';
import { UserProvider } from './UserProvider';
export const LynxProvider = ({ children, apiURL, apiKey, bearer }) => {
    return (_jsx(LynxClientProvider, { url: apiURL, apiKey: apiKey, bearer: bearer, children: _jsx(UserProvider, { children: children }) }));
};
//# sourceMappingURL=LynxProvider.js.map