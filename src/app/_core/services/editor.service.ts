import { Injectable } from "@angular/core";
import { SET_TIMEOUT } from "@core/services";

/**
 * service of qaEditor
 * common services for qaEditor
 *
 * @export
 * @class EditorService
 */
@Injectable({
    providedIn: "root",
})
export class EditorService {
    /**
     * @ignore
     */
    constructor() {}

    /**
     * get state object
     *
     * @param {*} type
     * @return { Object } state object
     * @memberof EditorService
     */
    getStateQaObject(type) {
        const qaObject = {
            QaTextState: "qaTextObj",
            QaImageState: "qaImageObj",
            QaCardState: "qaCardObj",
            QaAudioState: "qaAudioObj",
            QaFileState: "qaFileObj",
            QaVideoState: "qaVideoObj",
            QaLinkState: "qaLinkObj",
            QaJsonState: "qaJsonObj",
            QaMediaCardState: "qaMediaCardObj",
            QaReplyState: "qaReplyObj",
            QaWebviewState: "qaWebviewObj",
            QaPlayState: "qaPlayObj",
            QaQuoteState: "qaQuoteObj",
        };

        return qaObject[type];
    }

    /**
     * get state object service
     *
     * @param {*} $scope
     * @param {*} type
     * @return { Object } service object
     * @memberof EditorService
     */
    getStateObjectService($scope, type) {
        const service = {
            QaTextState: $scope.qaTextService.qaTextState$,
            QaImageState: $scope.qaImageService.qaImageState$,
            QaCardState: $scope.qaCardService.qaCardState$,
            QaAudioState: $scope.qaAudioService.qaAudioState$,
            QaFileState: $scope.qaFileService.qaFileState$,
            QaVideoState: $scope.qaVideoService.qaVideoState$,
            QaLinkState: $scope.qaLinkService.qaLinkState$,
            QaJsonState: $scope.qaJsonService.qaJsonState$,
            QaMediaCardState: $scope.qaMediaCardService.qaMediaCardState$,
            QaReplyState: $scope.qaReplyService.qaReplyState$,
            QaWebviewState: $scope.qaWebviewService.qaWebviewState$,
            QaPlayState: $scope.qaPlayService.qaPlayState$,
            QaQuoteState: $scope.qaQuoteService.qaQuoteState$,
        };

        return service[type];
    }

    /**
     * convert component selector to name
     *
     * @param {*} type
     * @return { Object } state name object
     * @memberof EditorService
     */
    onSelectStateParser(type) {
        const state = {
            "cbe-shared-qa-text": "qaTextObj",
            "cbe-shared-qa-image": "qaImageObj",
            "cbe-shared-qa-card": "qaCardObj",
            "cbe-shared-qa-audio": "qaAudioObj",
            "cbe-shared-qa-file": "qaFileObj",
            "cbe-shared-qa-video": "qaVideoObj",
            "cbe-shared-qa-link": "qaLinkObj",
            "cbe-shared-qa-json": "qaJsonObj",
            "cbe-shared-qa-media-card": "qaMediaCardObj",
            "cbe-qa-quote": "qaQuoteObj",
        };

        return state[type];
    }

    /**
     * convert component name to service
     *
     * @param {*} $scope
     * @param {*} type
     * @return { Object } service object
     * @memberof EditorService
     */
    onSelectServiceParser($scope, type) {
        const stateService = {
            "qa-text": $scope.qaTextService.qaTextState$,
            "qa-image": $scope.qaImageService.qaImageState$,
            "qa-card": $scope.qaCardService.qaCardState$,
            "qa-audio": $scope.qaAudioService.qaAudioState$,
            "qa-file": $scope.qaFileService.qaFileState$,
            "qa-video": $scope.qaVideoService.qaVideoState$,
            "qa-link": $scope.qaLinkService.qaLinkState$,
            "qa-json": $scope.qaJsonService.qaJsonState$,
            "qa-mediaCard": $scope.qaMediaCardService.qaMediaCardState$,
            "qa-quote": $scope.qaQuoteService.qaQuoteState$,
        };

        return stateService[type];
    }

    /**
     * convert name to component class
     *
     * @param {*} componentsList
     * @param {*} type
     * @return { Object } component object
     * @memberof EditorService
     */
    onSelectComponentParser(componentsList, type) {
        const component = {
            "qa-text": componentsList["QaTextComponent"],
            "qa-image": componentsList["QaImageComponent"],
            "qa-card": componentsList["QaCardComponent"],
            "qa-audio": componentsList["QaAudioComponent"],
            "qa-file": componentsList["QaFileComponent"],
            "qa-video": componentsList["QaVideoComponent"],
            "qa-link": componentsList["QaLinkComponent"],
            "qa-json": componentsList["QaJsonComponent"],
            "qa-mediaCard": componentsList["QaMediaCardComponent"],
            "qa-play": componentsList["QaPlayComponent"],
            "qa-quote": componentsList["QaQuoteComponent"],
        };

        return component[type];
    }

    /**
     * set icon status of qaEditor operator
     *
     * @param {*} elemChildList
     * @param {*} operatorConfig
     * @param {string} [action='']
     * @memberof EditorService
     */
    setOperatorStatus(elemChildList: any, operatorConfig: any, action = "") {
        const opConfig = {
            module: operatorConfig.CONFIG_MODULE,
            min_downward: operatorConfig.MIN_DOWNWARD,
        };
        let lastIdx = elemChildList.length - opConfig.min_downward - 1;

        // hotfix for greeting-editor - redundancy elements on greeting
        if (opConfig.module === "greeting-editor" && action !== "add") {
            // If answer has quickreply,length will add one.
            let isHasQaReply: boolean = false;
            Object.values(elemChildList).forEach((item) => {
                if (item["tagName"] === "CBE-SHARED-QA-REPLY" && item["className"] !== "ng-star-inserted")
                    isHasQaReply = true;
            });

            const isAction = action === "onDown" || action === "onUp" || action === "load";
            lastIdx -= isAction ? (isHasQaReply ? 1 : 0) : 1;
        }

        // Phone 通路不顯示下移/刪除按鈕
        if (!Object.values(elemChildList).some((item) => item["tagName"] === "CBE-QA-PLAY")) {
            const operatorFirst = elemChildList[0].querySelector(".operator");
            const operatorLast = elemChildList[lastIdx].querySelector(".operator");
            const operatorArr = [];
            for (const i in elemChildList) {
                if (typeof elemChildList[i] === "object") {
                    const operator = elemChildList[i].querySelector(".operator");
                    if (!!operator) operatorArr.push(operator);
                }
            }

            setTimeout(() => {
                for (const i of operatorArr) {
                    for (const j of i.children) {
                        j.style.visibility = "visible";
                        j.style.position = "static";
                    }
                }

                if (!!operatorFirst) {
                    operatorFirst.children[2].style.visibility = "hidden";
                    operatorFirst.children[2].style.position = "absolute";
                }

                if (!!operatorLast) operatorLast.lastChild.style.visibility = "hidden";
            }, SET_TIMEOUT.NORMAL);
        }

        setTimeout(() => {
            this.updateOperatorIcon(elemChildList);
        }, SET_TIMEOUT.NORMAL);
    }

    /**
     * ### 更新第一個與最後一個答案的上下箭頭顯示狀態
     *
     * @param {*} elemChildList
     * @memberof EditorService
     */
    updateOperatorIcon(elemChildList: any) {
        // first answer UP button
        const operatorFirst = elemChildList[0].querySelector(".operator");
        if (!!operatorFirst) {
            operatorFirst.children[2].style.visibility = "hidden";
            operatorFirst.children[2].style.position = "absolute";
        }

        // last answer DOWN button
        let qaMenuBtnIdx = 0;
        for (const i of elemChildList) {
            if (i.className === "qaMenu-btn") break;
            qaMenuBtnIdx++;
        }
        const lastAnsIdx = qaMenuBtnIdx - 1;
        const operatorLast = elemChildList[lastAnsIdx].querySelector(".operator");
        if (!!operatorLast) operatorLast.lastChild.style.visibility = "hidden";
    }

    /**
     * call CBE SweetAlert
     *
     * @param {*} $scope
     * @memberof EditorService
     */
    showCbeAlert($scope) {
        $scope.postMessageService.postMessage("doSweetAlert", {
            type: "doSweetAlert",
            data: {
                type: "error",
                title: $scope.QA_EDITOR.COMMON.ERROR,
                text: $scope.qaEditorService.cloneMsgStack.join("\n"),
                confirmButtonText: $scope.QA_EDITOR.COMMON.COMFIRM,
            },
        });
    }
}
