"use strict";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import axios, { AxiosInstance, AxiosResponse, AxiosPromise } from "axios";

const testCertPath = path.resolve("./FPTestcert2_20150818_102329.pfx");
const testPassphrase = "querty123";

export { AxiosInstance, AxiosResponse, AxiosPromise };

export interface ClientOptions {
  certPath: string;
  passphrase: string;
}

export const createClient = (opts: ClientOptions) => {
  const { certPath = testCertPath, passphrase = testPassphrase } = opts;
  const pfx = fs.readFileSync(certPath);

  return axios.create({
    httpsAgent: new https.Agent({
      pfx,
      passphrase,
      rejectUnauthorized: false
    })
  });
};

export const collect = (client: AxiosInstance, orderRef: string) =>
  client.post(
    "https://appapi2.test.bankid.com/rp/v5/collect",
    {
      orderRef
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

export const startAuthentication = (
  client: AxiosInstance,
  personalNumber: string,
  endUserIp: string,
  requirement = {}
) =>
  client.post(
    "https://appapi2.test.bankid.com/rp/v5/auth",
    {
      personalNumber,
      endUserIp,
      requirement
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

const authenticate = (
  client: AxiosInstance,
  personalNumber: string,
  endUserIp: string,
  requirement = {}
) => {
  startAuthentication(client, personalNumber, endUserIp, requirement).then(
    (response: AxiosResponse<{ orderRef: string }>) => {
      const { data: { orderRef } } = response;
      return new Promise((resolve, reject) => {
        // Start a interval to poll every 2 seconds
        const intervalId = setInterval(() => {
          collect(client, orderRef)
            .then(({ data }) => {
              if (data.status === "complete") {
                clearInterval(intervalId);
                resolve(data);
              } else if (data.status === "failed") {
                clearInterval(intervalId);
                reject(data);
              }
            })
            .catch(reject);
        }, 2000);
      });
    }
  );
};
