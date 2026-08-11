# React Lynx

[![npm version](https://img.shields.io/npm/v/%40iotopen%2Freact-lynx?style=flat-square)](https://www.npmjs.com/package/@iotopen/react-lynx)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.19-3c873a?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-149eca?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> React hooks and context providers for the [IoT Open Lynx API](https://github.com/IoTOpen/node-lynx).

React Lynx wraps `@iotopen/node-lynx` in an idiomatic React API. It provides a
shared Lynx client, current-user and permission state, resource hooks for common
Lynx entities, and MQTT helpers for live data.

All hooks must be rendered below `LynxProvider`.

## Features

- Shared Lynx client configured through a single provider
- Current-user and permission loading through React context
- Read and mutation hooks for installations, devices, edge apps, functions,
  organizations, users, roles, notifications, OAuth clients, and tokens
- Metadata-aware list hooks with loading, error, resource, and refresh state
- Paho MQTT hooks with reconnect, publish, subscribe, and message binding support
- TypeScript types and React 18/19 compatibility

## Requirements

- Node.js `>=20.19.0 <25`
- React `18` or `19`
- A Lynx API endpoint and credentials when using authenticated API calls

## Install

```bash
npm install @iotopen/react-lynx
```

The package declares `react`, `@iotopen/node-lynx`, and `paho-mqtt` as peer
dependencies. Install the dependencies required by the hooks your application
uses:

```bash
npm install react react-dom @iotopen/node-lynx paho-mqtt
```

With pnpm, replace `npm install` with `pnpm add`.

## Quick start

Configure the provider at the application boundary. Keep credentials outside
source control and provide them through your application configuration.

```tsx
import { LynxProvider, useInstallations } from "@iotopen/react-lynx";

const apiKey = import.meta.env.VITE_LYNX_API_KEY as string | undefined;

export function App() {
  return (
    <LynxProvider apiURL="https://lynx.iotopen.se" apiKey={apiKey}>
      <InstallationList />
    </LynxProvider>
  );
}

function InstallationList() {
  const { loading, error, installations, refresh } = useInstallations();

  if (loading) {
    return <p>Loading installations...</p>;
  }

  if (error) {
    return <button onClick={refresh}>Retry</button>;
  }

  return (
    <ul>
      {installations.map((installation) => (
        <li key={installation.id}>{installation.name}</li>
      ))}
    </ul>
  );
}
```

`LynxProvider` accepts these props:

| Prop       | Type        | Description                                                      |
| ---------- | ----------- | ---------------------------------------------------------------- |
| `apiURL`   | `string`    | Lynx API base URL.                                               |
| `apiKey`   | `string`    | API key used by the Lynx client.                                 |
| `bearer`   | `boolean`   | Enables bearer authentication behavior in the underlying client. |
| `children` | `ReactNode` | Components that use React Lynx hooks.                            |

When an API key is available, the provider loads the current user and
permissions. Access them with `useGlobalUser()` and `useGlobalPermissions()`.

## Hook groups

Import hooks from the package root:

```tsx
import {
  useDevice,
  useDevices,
  useGlobalPermissions,
  useNewInstallation,
} from "@iotopen/react-lynx";
```

The public API includes hooks for:

- **Devices and installations:** `useDevice`, `useDevices`, `useInstallation`,
  `useInstallations`, `useInstallationInfo`, `useNewDevice`,
  `useNewInstallation`
- **Edge and compute:** `useEdgeApp`, `useEdgeApps`, `useConfiguredEdgeApps`,
  `useEdgeAppVersions`, `useFunction`, `useFunctions`, `useNewFunction`
- **Users and access:** `useUser`, `useUsers`, `useNewUser`, `useRoles`,
  `useCheckPermissions`, `useGlobalUser`, `useGlobalPermissions`
- **Organizations and identity:** `useOrganization`, `useOrganizations`,
  `useNewOrganization`, `useOAuth2Client`, `useOAuth2Clients`,
  `useNewOAuth2Client`, `useOAuth2Consent`, `useTokens`,
  `useIDTokenAlgorithms`
- **Notifications:** `useNotificationMessage`, `useNotificationMessages`,
  `useNewNotificationMessage`, `useNotificationOutput`,
  `useNotificationOutputs`, `useNewNotificationOutput`,
  `useNotificationOutputExecutor`, `useNotificationOutputExecutors`
- **Live data and metadata:** `useMeta`, `useLiveInstallation`,
  `useMultiLiveInstallation`, `useMQTT`, `usePahoMQTTClient`,
  `useSimpleMQTT`

Most resource hooks expose named state such as `loading`, `error`, the resource
value, and `refresh`. Mutation hooks expose editable state and a Promise-returning
operation such as `create` or `update`; check the hook's TypeScript definition for
the exact return shape.

## MQTT example

Use `useSimpleMQTT` for subscription management and message bindings. MQTT
credentials should come from runtime configuration, never from committed source.

```tsx
import { useEffect } from "react";
import { useSimpleMQTT } from "@iotopen/react-lynx";

export function LiveDevice({ topic }: { topic: string }) {
  const mqtt = useSimpleMQTT(import.meta.env.VITE_MQTT_URI as string);

  useEffect(() => {
    const onMessage = (_topic: string, payload: string) => {
      console.log(payload);
    };

    mqtt.setSubs([topic]);
    mqtt.bindExact(topic, onMessage);

    return () => mqtt.unbindExact(topic, onMessage);
  }, [mqtt, topic]);

  return <p>{mqtt.connected ? "Connected" : "Connecting..."}</p>;
}
```

`usePahoMQTTClient` provides the lower-level client operations. Both hooks clean
up their client and subscriptions when the component is unmounted.

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/IoTOpen/react-lynx.git
cd react-lynx
pnpm install
```

Useful commands:

| Command              | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `pnpm lint`          | Type-check and lint source files with zero warnings.       |
| `pnpm test`          | Type-check and run the Vitest test suite.                  |
| `pnpm test:watch`    | Run Vitest in watch mode.                                  |
| `pnpm build`         | Build ESM, CommonJS, and TypeScript declaration artifacts. |
| `pnpm release:check` | Run release validation, including artifact verification.   |

## Related projects

- [IoT Open Lynx](https://github.com/IoTOpen/node-lynx) - the underlying API client
- [IoT Open](https://iotopen.se/) - the IoT Open platform
