import { Injectable } from "@angular/core";
import { HttpService } from "@core/services";
import { UtilitiesService } from "@core/utils";
import { environment } from "@env/environment";
import { NbDialogService } from "@nebular/theme";
import { AlertDialogComponent } from "@shared/components";

@Injectable({
    providedIn: "root",
})
export class DepartmentApiService {
    constructor(
        private httpService: HttpService,
        private nbDialogService: NbDialogService,
        private utilitiesService: UtilitiesService
    ) {}

    /**
     * 返回訊息元件
     *
     * @memberof DepartmentApiService
     */
    RESULT_MESSAGE = this.httpService.RESULT_MESSAGE + "(DepartmentApiService)";

    /**
     * 若有錯誤，則會印出 Console.Error
     *
     * @param {*} httpResult API 的 Response
     * @param {string} module 執行的 API
     * @memberof DepartmentApiService
     */
    checkError(httpResult: any, module: string) {
        let resultMessage = "";
        if (httpResult) {
            if (JSON.stringify(httpResult) === "{}") console.debug(module + " API 成功");
            else if (httpResult.resultInfo) {
                if (httpResult.resultInfo.success) {
                    resultMessage = "";
                    console.debug(module + " API 成功");
                } else {
                    resultMessage = httpResult.resultInfo.errorMessage || "";
                    console.debug(module + " API 失敗");
                }
            } else {
                if (httpResult._header_ && httpResult._header_.success && !httpResult._failed) {
                    resultMessage = "";
                    console.debug(module + " API 成功");
                } else {
                    resultMessage =
                        httpResult.message || (httpResult._header_ && httpResult._header_.errorMessage) || "";
                    console.debug(module + " API 失敗");
                }
            }
        } else {
            console.debug(module + " HttpResul 返回空值");
        }

        if (!!resultMessage) {
            console.error(this.RESULT_MESSAGE + "(" + module + ") : " + resultMessage);
            this.nbDialogService.open(AlertDialogComponent, {
                context: {
                    title: "錯誤",
                    content: resultMessage,
                },
            });
        }

        if (httpResult && httpResult._header_ && httpResult._header_.success) return httpResult;
        else return false;
    }

    /**
     * 建立部門(企業)
     *
     * @param {*} body API 的 body 內容
     * @return {*} 成功：成功建立後的 DepartmentId / 失敗：false
     * @memberof DepartmentApiService
     */
    async departmentCreate(body) {
        const httpResult: any = await this.httpService.httpPOST("/openapi/qs/department/create", body);
        if (httpResult && httpResult._header_ && httpResult._header_.success) return httpResult.id;
        else return false;
    }

    /**
     * 取得部門(企業)列表
     *
     * @param {*} body API 的 body 內容
     * @return {*} 成功：API 的 Response / 失敗：false
     * @memberof DepartmentApiService
     */
    async departmentList(body) {
        let httpResult: any = null;
        if (!this.utilitiesService.getMockSession())
            httpResult = await this.httpService.httpPOST("/openapi/qs/department/list", body);
        else
            httpResult = await this.httpService.httpGET(
                "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/department/list"
            );

        return this.checkError(httpResult, "dipartmentList");
    }

    /**
     * 取得部門(企業)項目
     *
     * @param {*} body API 的 body 內容
     * @return {*} 成功：API 的 Response / 失敗：false
     * @memberof DepartmentApiService
     */
    async departmentItem(body) {
        const httpResult: any = await this.httpService.httpPOST("/openapi/qs/department/item", body);
        if (httpResult && httpResult._header_ && httpResult._header_.success) return httpResult;
        else return false;
    }

    /**
     * 更新部門(企業)
     *
     * @param {*} body API 的 body 內容
     * @return {*} 成功：true / 失敗：false
     * @memberof DepartmentApiService
     */
    async departmentUpdate(body) {
        const httpResult: any = await this.httpService.httpPOST("/openapi/qs/department/update", body);
        if (httpResult && httpResult._header_ && httpResult._header_.success) return true;
        else return false;
    }

    /**
     * 刪除部門(企業)
     *
     * @param {*} body API 的 body 內容
     * @return {*} 成功：true / 失敗：false
     * @memberof DepartmentApiService
     */
    async departmentDelete(body) {
        const httpResult: any = await this.httpService.httpPOST("/openapi/qs/department/delete", body);
        if (httpResult && httpResult._header_ && httpResult._header_.success) return true;
        else return false;
    }
}
