# bankid-api

Helper functions to talk to the Swedish BankID API. Uses axios behind the scenes.

## Usage

`createClient` creates a axios client that is ready to talk to the BankID service.

`authenticate` goes trough the authentication flow by sending personal numer and end user IP and then try to collect their signing. Uses `startAuthentication` and `collect` internally.

`startAuthentication` sends personal number and end user IP.

`collect` collects the signing from the user.

```js
import * as bankidAPI from "node-bankid-api";

const client = bankidAPI.createClient();

bankidAPI
  .authenticate(client, personNummer, ip)
  .then(d => {
    console.log(d.completionData);
  })
  .catch(e => console.error(e));
```
