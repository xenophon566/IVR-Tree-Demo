/**
 * This file can be replaced during build by using the `fileReplacements` array.
 * `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
 * The list of file replacements can be found in `angular.json`.
 *
 * @param {const} environment
 */
export const environment = {
    production: false,
    env: "stage",
    whiteList: ["localhost", "127.0.0.1", "qbi.chainsea.com.tw", "rdqa.chainsea.com.tw"],
};
