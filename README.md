# React Lynx

This is a React hooks wrapper for the [node-lynx][1] library. This library
exposes most API-calls as hooks that return objects with named properties. It
also includes Contexts that can be used to handle Lynx-connection and current
user.

All hooks need to be used withing the `LynxProvider` context.

## Install

```bash
npm install --save @iotopen/react-lynx
```

## Usage

Create a `LynxProvider` to wrap all components using the hooks:

```typescript jsx
const key = 'abcdef123456789abcdef123456789';

const App = () => {
    return (
        <LynxProvider apiKey={key} apiURL={'https://lynx.iotopen.se'}>
            <MyComponent/>
        </LynxProvider>
    );
};
```

Then the hooks can be used in `MyComponent`:

```typescript jsx
import {useInstallations} from '@iotopen/react-lynx';

const MyComponent = () => {
    const {loading, error, installations, refresh} = useInstallations();

    return (
        <div>
            {loading && <h2>Loading installations...</h2>}
            {!loading && <ul>
                {installations.map(i => <li>i.name</li>)}
            </ul>}
        </div>
    );
};
```

[1]: https://github.com/IoTOpen/node-lynx
