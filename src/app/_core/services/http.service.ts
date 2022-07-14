import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { GLOBAL } from "@core/services";
import { ConfigService } from "@core/services/config.service";
import { LanguageService, UtilitiesService, PostMessageService } from "@core/utils";
import { environment } from "@env/environment";

/**
 * interface of API Response
 *
 * @export
 * @interface IHttpResponse
 */
export interface IHttpResponse {
    _failed?: boolean; // for API 1.0
    message?: string;
    _header_?: object;
    resultInfo?: object;
    data?: any;
    items?: [];
}

/**
 * Http Service
 *
 * @export
 * @class HttpService
 */
@Injectable({
    providedIn: "root",
})
export class HttpService {
    /**
     * @ignore
     */
    constructor(
        private httpClient: HttpClient,
        private configService: ConfigService,
        private utilitiesService: UtilitiesService,
        private postMessageService: PostMessageService,
        private languageService: LanguageService
    ) {
        this.HTTP_SERVICE = this.languageService.getLanguages("TAB_COMPONENT");
    }

    RESULT_MESSAGE = GLOBAL.RESULT_MESSAGE + "(HttpService) ";

    HTTP_SERVICE: any;

    /**
     * catchHandler
     *
     * @private
     * @param {*} err
     * @return {*}
     * @memberof HttpService
     */
    private catchHandler(err: any) {
        this.postMessageService.postMessage("custom", {
            type: "doSweetAlert",
            data: {
                title: this.HTTP_SERVICE.ERROR,
                text: err.message,
                type: "error",
                confirmButtonText: this.HTTP_SERVICE.COMFIRM,
            },
        });
        return Promise.reject(err.message || err);
    }

    /**
     * ### httpGET
     * > HttpClient Member - Http GET
     * >
     * > Observable to Promise(for Async/Await)
     *
     * @param {*} args[] - (1. url)
     * @returns {Promise<object>}
     * @memberof HttpService
     */
    async httpGET(...args): Promise<object> {
        debugger;
        const hostUrl = this.utilitiesService.getMockSession() || (await this.getEnvConfig(args[2]));
        const apiUrl = !!~args[0].indexOf("http") ? args[0] : hostUrl + args[0];
        const body = args[1] || {};
        const data = body?.data;
        const options = body?.options;

        if (!!apiUrl) {
            try {
                return this.httpClient
                    .get(apiUrl)
                    .pipe(
                        tap((resp: IHttpResponse) => {
                            if (!!this.utilitiesService.getMockSession() && !!options?.handleFunction)
                                resp = options.handleFunction(resp, data, options);

                            return resp.data || resp.items || resp;
                        }),
                        catchError((error) => {
                            console.group(this.RESULT_MESSAGE);
                            console.error(error);
                            console.groupEnd();
                            return of([]);
                        })
                    )
                    .toPromise();
            } catch (err) {
                return this.catchHandler(err);
            }
        } else return Promise.reject("Error url!!!");
    }

    /**
     * ### httpPOST
     * > HttpClient Member - Http POST
     * >
     * > Observable to Promise(for Async/Await)
     *
     * @param {*} args - (1. url, 2. body)
     * @returns {Promise<object>}
     * @memberof HttpService
     */
    async httpPOST(...args): Promise<object> {
        const hostUrl = this.utilitiesService.getMockSession() || (await this.getEnvConfig(args[2]));
        const apiUrl = !!~args[0].indexOf("http") ? args[0] : hostUrl + args[0];
        const body = args[1] || {};
        const data = body?.data;
        const options = body?.options;
        if (args[2] !== "marketContent" && args[2] !== "marketContentSub") {
            const tokenId = this.utilitiesService.getCookie("tkn") || args[2];
            if (!tokenId && tokenId !== "") {
                if (!~environment.env.indexOf("stage")) this.utilitiesService.logout();
                return Promise.resolve({ _failed: true });
            }
            body._header_ = { tokenId };
        }

        if (!!apiUrl) {
            try {
                return this.httpClient
                    .post(apiUrl, body)
                    .pipe(
                        tap((resp: IHttpResponse) => {
                            if (!!this.utilitiesService.getMockSession() && !!options?.handleFunction)
                                resp = options.handleFunction(resp, data, options);

                            return resp.data || resp.items || resp;
                        }),
                        catchError((error) => {
                            console.group(this.RESULT_MESSAGE);
                            console.error(error);
                            console.groupEnd();
                            return of([]);
                        })
                    )
                    .toPromise();
            } catch (err) {
                return this.catchHandler(err);
            }
        } else return Promise.reject("Error url!!!");
    }

    /**
     * ### getEnvConfig
     * > get hostUrl by current environment settings
     *
     * @return {string} hostUrl by environment
     * @memberof HttpService
     */
    async getEnvConfig(component) {
        let protocol = this.utilitiesService.configParser(this.configService.get("PROTOCOL"));
        let hostname = this.utilitiesService.configParser(this.configService.get("HOSTNAME"));
        let apiPort = this.utilitiesService.configParser(this.configService.get("PORT"));
        let apiPath = "";
        if (component === "marketContent" || component === "marketContentSub")
            apiPath = this.utilitiesService.configParser(this.configService.get("MARKET_API_PATH"));
        else apiPath = this.utilitiesService.configParser(this.configService.get("API_PATH"));

        if (!protocol) {
            const config = await this.configService.loadLocalConfig();
            protocol = this.utilitiesService.configParser(`${config["PROTOCOL"]}`);
            hostname = this.utilitiesService.configParser(`${config["HOSTNAME"]}`);
            apiPort = this.utilitiesService.configParser(`${config["PORT"]}`);
            if (component === "marketContent" || component === "marketContentSub")
                apiPath = this.utilitiesService.configParser(`${config["MARKET_API_PATH"]}`);
            else apiPath = this.utilitiesService.configParser(`${config["API_PATH"]}`);
        }

        protocol = !!protocol ? protocol + "//" : "";
        apiPort = !!apiPort ? ":" + apiPort : "";

        const hostUrl = !!protocol && !!hostname ? protocol + hostname + apiPort + apiPath : null;

        return hostUrl;
    }
}
