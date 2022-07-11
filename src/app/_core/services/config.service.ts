import { Injectable, APP_INITIALIZER } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { environment } from "@env/environment";

/**
 * Config Service
 *
 * @export
 * @class ConfigService
 */
@Injectable({
    providedIn: "root",
})
export class ConfigService {
    /**
     * config service
     *
     * @private
     * @type {object}
     * @memberof ConfigService
     */
    private config: object = {};

    /**
     * Local config
     *
     * @private
     * @type {object}
     * @memberof ConfigService
     */
    private configLocal: object = {};

    /**
     * Remote config
     *
     * @private
     * @type {object}
     * @memberof ConfigService
     */
    private configRemote: object = {};

    /**
     * @ignore
     */
    constructor(private httpClient: HttpClient) {}

    /**
     * load LOCAL config by environment
     *
     * @returns {Promise<any>}
     * @memberof ConfigService
     */
    loadLocalConfig(): Promise<any> {
        return new Promise((resolve, reject) => {
            const env = environment.env || "dev-mock";

            try {
                const httpLocal$ = this.httpClient.get("./assets/config/" + env + ".json");
                httpLocal$.pipe(map((res) => res)).subscribe((data) => {
                    this.configLocal = data;
                    Object.assign(this.config, this.configLocal);
                    resolve(this.config);
                });
            } catch (err) {
                return reject(err.message || err);
            }
        });
    }

    /**
     * load REMOTE config by environment
     *
     * @returns {Promise<any>}
     * @memberof ConfigService
     */
    loadRemoteConfig(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const httpRemote$ = this.httpClient.get("https://jsonplaceholder.typicode.com/users/1");
                httpRemote$.pipe(map((res) => res)).subscribe((data) => {
                    this.configRemote = data;
                    Object.assign(this.config, this.configRemote);
                    resolve(this.config);
                });
            } catch (err) {
                return reject(err.message || err);
            }
        });
    }

    /**
     * Is app in the dev mode
     *
     * @returns
     * @memberof ConfigService
     */
    isMockMode() {
        if (!!~environment.whiteList.indexOf(location.hostname)) {
            const isMock = !!~location.href.indexOf("mock=true") || !!~parent.location.href.indexOf("mock=true");
            return isMock || !!~environment.env.indexOf("-mock") || !!sessionStorage.getItem("mock");
        } else return false;
    }

    /**
     * Get a value of specified property in the configuration file
     *
     * @param {*} key
     * @returns
     * @memberof ConfigService
     */
    get(key: any) {
        return this.config[key];
    }

    /**
     * Get all config from Local & Remote(Remote can overwrite Local)
     *
     * @returns
     * @memberof ConfigService
     */
    getALL() {
        return this.config;
    }
}

/**
 * Config Factory
 *
 * @export
 * @param {ConfigService} config
 * @returns
 */
export function ConfigFactory(config: ConfigService) {
    return () => {
        config.loadLocalConfig();
        // config.loadRemoteConfig();
    };
}

/**
 * init settings
 *
 * @export
 * @returns
 */
export function init() {
    return {
        provide: APP_INITIALIZER,
        useFactory: ConfigFactory,
        deps: [ConfigService],
        multi: true,
    };
}

/**
 * Config Module
 *
 * @export {const} ConfigModule
 */
export const ConfigModule = { init };
