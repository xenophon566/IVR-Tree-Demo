import { Injectable } from "@angular/core";
import { HttpService, IHttpResponse } from "@core/services/http.service";
import { UtilitiesService } from "@core/utils";
import { GlobalService } from "@core/services";
import { environment } from "@env/environment";

@Injectable({
    providedIn: "root",
})
export class InitialService {
    constructor(
        private httpService: HttpService,
        private utilitiesService: UtilitiesService,
        private globalService: GlobalService
    ) {}

    resultMessage = "";

    /**
     * getTenantListToStorage
     *
     * setEncryptStringByKey - tenantList
     * setEncryptData - curBot
     *
     * @param {string} [tenantId='']
     * @return {*}
     * @memberof InitialService
     */
    async getTenantListToStorage() {
        let tenantList: IHttpResponse = null;
        tenantList = await this.httpService.httpPOST("/openapi/cbe/tenant/list");

        this.resultMessage = tenantList.message || "";

        if (!!tenantList.items && !!tenantList.items.length) {
            this.utilitiesService.setEncryptStringByKey("tenantList", tenantList.items);
            return tenantList.items;
        } else this.resultMessage = "Empty Tenant List";

        if (!!this.resultMessage) console.error(this.httpService.RESULT_MESSAGE + this.resultMessage);

        return null;
    }

    /**
     * getCurBotToStorage
     *
     * @param {string} [tenantId='']
     * @param {*} [tenantListItems=[]]
     * @return {*}
     * @memberof InitialService
     */
    async getCurBotToStorage(tenantId = "") {
        const tenantListStr = this.utilitiesService.getEncryptStringByKey("tenantList") || "";
        const tenantListItems = JSON.parse(tenantListStr);
        if (!tenantListItems.length) this.resultMessage = "Empty Tenant List";
        const tid = tenantId || this.utilitiesService.getCookie("tid") || tenantListItems[0].FId;
        if (!tid) this.resultMessage = "tid not found";

        for (const item of tenantListItems) {
            if (item.FId === tid) {
                this.utilitiesService.setEncryptData("curBot", item);
                this.globalService.setCurBot(true);
                return item;
            }
        }

        if (!!this.resultMessage) console.error(this.utilitiesService.RESULT_MESSAGE + this.resultMessage);

        return null;
    }
}
