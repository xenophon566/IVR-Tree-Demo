import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    ViewContainerRef,
} from "@angular/core";
import {
    QaTextService,
    QaEditorService,
    TabsService,
    SmartQaEditorService,
    QaImageService,
    QaCardService,
    QaAudioService,
    QaFileService,
    QaVideoService,
    QaJsonService,
    QaLinkService,
    QaMediaCardService,
    QaReplyService,
    QaWebviewService,
    QaPlayService,
    QaQuoteService,
} from "@core/state";
import { HttpService, VerifyService, SET_TIMEOUT } from "@core/services";
import { NbMenuService, NbDialogService } from "@nebular/theme";
import { ConfirmDialogComponent, AlertDialogComponent, TemplateDialogComponent } from "@shared/components";
import { ComponentLoaderDirective } from "@shared/directives/component-loader.directive";
import { COMPONENTS_LIST } from "@shared/components.define";
import { LanguageService, UtilitiesService, PostMessageService } from "@core/utils";
import { EditorService } from "@core/services/editor.service";
import { STATE } from "@shared/components/qa-editor/qa-editor.define";
import { EDITOR_TYPE, EDITOR_COMPONENT } from "@core/state/qa-editor/qa-editor.service";
import { environment } from "@env/environment";

export enum OPERATOR_CONFIG {
    CONFIG_MODULE = "qa-editor",
    MIN_DOWNWARD = 4,
    MIN_AFTER_CLEAR = 5,
    MIN_AFTER_REMOVE = 6,
}

/**
 * QaEditor Component
 *
 * @export
 * @class QaEditorComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-editor",
    templateUrl: "./qa-editor.component.html",
    styleUrls: ["./qa-editor.component.scss"],
})
export class QaEditorComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private viewContainerRef: ViewContainerRef,
        private elementRef: ElementRef,
        private httpService: HttpService,
        private utilitiesService: UtilitiesService,
        private editorService: EditorService,
        private tabsService: TabsService,
        private nbDialogService: NbDialogService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private nbMenuService: NbMenuService,
        public qaEditorService: QaEditorService,
        private smartQaEditorService: SmartQaEditorService,
        private changeDetectorRef: ChangeDetectorRef,
        private verifyService: VerifyService,
        private languageService: LanguageService,
        private qaTextService: QaTextService,
        private qaImageService: QaImageService,
        private qaCardService: QaCardService,
        private qaAudioService: QaAudioService,
        private qaFileService: QaFileService,
        private qaVideoService: QaVideoService,
        private qaJsonService: QaJsonService,
        private qaLinkService: QaLinkService,
        private qaReplyService: QaReplyService,
        private qaWebviewService: QaWebviewService,
        private qaMediaCardService: QaMediaCardService,
        private qaPlayService: QaPlayService,
        private qaQuoteService: QaQuoteService,
        private postMessageService: PostMessageService
    ) {
        this.smartQaEditorObj = this.smartQaEditorService.smartQaEditorObject;

        this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");

        this.qaMenu = this.qaEditorService.getQaMenu(this.QA_EDITOR);

        if (!!this.utilitiesService.getMockSession()) {
            // qbi action dropdown
            this.httpService
                .httpGET(
                    "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/smart-qa-editor/qbiSelectList"
                )
                .then((resp) => {
                    for (const i in resp) {
                        const name = resp[i].FName.split(".");
                        this.qbiSelectList.push({
                            FRobotId: resp[i].FRobotId,
                            FName: this.QA_EDITOR[name[0]][name[1]],
                        });
                    }
                });

            // zenbo action dropdown
            this.httpService
                .httpGET(
                    "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/smart-qa-editor/zenboSelectList"
                )
                .then((resp) => {
                    for (const i in resp) {
                        const name = resp[i].FName.split(".");
                        this.zenboSelectList.push({
                            FRobotId: resp[i].FRobotId,
                            FName: this.QA_EDITOR[name[0]][name[1]],
                        });
                    }
                });
        } else {
            try {
                const stringifyRobotAE = localStorage.getItem("robotAE");
                if (stringifyRobotAE) {
                    const robotAE = JSON.parse(stringifyRobotAE);
                    robotAE.forEach((item) => {
                        switch (item.FRobotType) {
                            case "qbi":
                                this.qbiSelectList.push(item);
                                break;
                            case "zenbo":
                                this.zenboSelectList.push(item);
                                break;
                        }
                    });
                    // console.debug('Robot AE:', robotAE);
                }
            } catch (error) {
                console.debug("qa-editor try JSON.parse(stringifyRobotAE).... ");
            }
        }
    }

    @ViewChild(ComponentLoaderDirective, { static: true })
    cbeSharedComponentLoader: ComponentLoaderDirective;

    @Input() data: any;

    i18n = JSON.parse(localStorage.getItem("languages"));

    QA_EDITOR: any;

    smartQaEditorObj = {};

    loadingSpiner = false;

    currentTab: string = "web";

    currentAnswers = null;

    valueContentObj = {};

    isActivityTab = false;

    activitiesList = [];

    activitySelect = null;

    activitySelectName = null;

    activityDropdown = null;

    tabsState = null;

    htmlCollection = null;

    nbBottomMenu: any;

    qaMenu = [];

    orderList = {};

    componentOrderList = [];

    isValid = false;

    qaMenuStatus = false;

    isSingleAnsChannel = false;

    isQaMenuDisabled = {};

    specificComponent = ["cbe-shared-qa-link", "qa-link", "cbe-shared-qa-json", "qa-json", "cbe-qa-quote", "qa-quote"];

    singleComponent = ["qaReplyObj", "qaWebviewObj"];

    qaEditorObj: any = {};

    TabsState: any;

    tabsObj: any = {};

    qaEditorResultJson: any;

    // viewContainerRef: any;

    qaEditorChannelTab = "";

    triggerTab = "";

    replyData = {};

    webviewData = {};

    isReplyHide = false;

    replyHideChannel = ["phone"];

    isWebviewHide = false;

    webViewHideChannel = ["line", "messenger", "phone", "google", "instagram"];

    isRobotSettingHide = false;

    robotSettingChannel = ["phone", "google"];

    isOauthSettingShow = false;

    oauthSettingChannel = ["web"];

    initVerifyState = {
        state: true,
        errMsg: "",
    };

    verifyState: any = {
        voice: this.initVerifyState,
        activitySelect: this.initVerifyState,
    };

    isClickRemove: any;

    SubIsSave: any;

    isTextAtLast = null;

    curActivitySelected: any = null;

    curBotType: string = "";

    openEditor = "";

    subType = "";

    oauthSettingList = [];

    oauthOptions = null;

    oauthOption = "";

    onPricetagsClick() {
        const valueContent = this.valueContentObj[this.currentTab];
        this.qaEditorService.valueContentData = this.valueContentObj;

        if (!!~environment.env.indexOf("stage")) {
            this.postMessageService.postMessage("custom", {
                type: "showLabelModal",
                mode: "answer",
                data: valueContent || "",
                tab: this.currentTab,
            });
        } else this.nbDialogService.open(TemplateDialogComponent);
    }

    /**
     * qaIcon Status
     *
     * @private
     * @param {*} menuItemData
     * @param {boolean} isAloneComponent
     * @param {string} [action='']
     * @returns
     * @memberof QaEditorComponent
     */
    private qaIconStatus(menuItemData: any, isAloneComponent: boolean, action = "") {
        const qaEditorBodyElem = this.elementRef.nativeElement.querySelector(".editorBody");
        const elemChildList = qaEditorBodyElem.children;
        const data = this.data || {};
        const dataList = data.dataList || [];
        const isLoad = data.isLoad || false;
        const isLoadStatus = (isLoad && dataList.length > 1) || false;
        const elemArr = [];
        const elemChildListArr = [].slice.call(elemChildList);
        elemChildListArr.forEach((v) => {
            if (v.tagName !== "CBE-QA-PLAY") elemArr.push(v);
        });

        const isAlone =
            (!!menuItemData && elemArr.length <= OPERATOR_CONFIG.MIN_AFTER_REMOVE) ||
            elemArr.length <= OPERATOR_CONFIG.MIN_AFTER_CLEAR ||
            isAloneComponent
                ? true
                : false;

        // scan for operator icon status
        if (!isAlone || isLoadStatus) this.editorService.setOperatorStatus(elemChildList, OPERATOR_CONFIG, action);

        return isAlone;
    }

    /**
     * load Component
     *
     * @private
     * @param {*} component
     * @param {*} [menuItemData=null]
     * @param {*} [loadData=null]
     * @memberof QaEditorComponent
     */
    private loadComponent(component, menuItemData = null, loadData = null) {
        const stateObject = this.qaEditorService.stateObject;
        this.loadingSpiner = false;
        const triggerTab = this.triggerTab || this.currentTab;
        if (triggerTab === this.data.channel || !!loadData) {
            // Component Factory
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
            this.viewContainerRef = this.cbeSharedComponentLoader.viewContainerRef;
            const isAloneComponent = !!~this.specificComponent.indexOf(componentFactory.selector);
            const componentRandomId = Math.random().toString(36).substring(7);

            // 清除原本的全部或移除單一元件並更新生產的元件的順序
            if (isAloneComponent) {
                // 需要單獨存在的元件
                this.utilitiesService.clearStateObject(stateObject, this.currentTab);
                this.viewContainerRef.clear();
                this.componentOrderList = [];
                this.componentOrderList.push(componentRandomId);
            } else if (!!menuItemData) {
                // 改變元件類型
                menuItemData.viewContainerRef.remove(+menuItemData.index);
                this.componentOrderList = this.componentOrderList || [];
                this.componentOrderList[+menuItemData.index] = componentRandomId;
            } else (this.componentOrderList || []).push(componentRandomId);

            const channel = this.data.channel;
            this.qaEditorChannelTab = channel;
            this.orderList = Object.assign(
                this.qaEditorService.qaEditorOrderList || {},
                { [channel]: this.componentOrderList },
                {}
            );

            // Save whole orderList to QaEditorService
            this.qaEditorService.qaEditorOrderList = this.orderList;

            // Component Mount to HTML
            const componentRef = this.viewContainerRef.createComponent(
                componentFactory,
                isAloneComponent ? 0 : !!menuItemData ? menuItemData.index : null
            );

            // const componentRef = this.viewContainerRef.createComponent(component);

            if (!!~this.webViewHideChannel.indexOf(channel.split("_Activity")[0])) this.isWebviewHide = true;
            if (!!~this.robotSettingChannel.indexOf(channel.split("_Activity")[0])) this.isRobotSettingHide = true;
            if (!!~this.replyHideChannel.indexOf(channel.split("_Activity")[0])) this.isReplyHide = true;

            // instagram channel快速回覆顯示控制 - 創建與切換答案
            if (channel.split("_Activity")[0] === "instagram") {
                const showAnsTypes = ["Text", "qaTextObj"];
                const ansType = !!loadData
                    ? loadData.type
                    : this.editorService.onSelectStateParser(componentFactory.selector);

                let isLastAns = true;
                if (!!menuItemData) {
                    const igAnsOrder = menuItemData.orderList[channel];
                    if (igAnsOrder.indexOf(componentRandomId) !== igAnsOrder.length - 1) isLastAns = false;
                }

                if (isLastAns) {
                    if (!this.isReplyHide && !~showAnsTypes.indexOf(ansType)) {
                        if (!loadData || this.data.openMode === "clone") {
                            if (!document.getElementsByClassName("alert-dialog").length) {
                                this.nbDialogService.open(AlertDialogComponent, {
                                    context: {
                                        content: this.QA_EDITOR.COMMON.IG_NO_QUICK_REPLY,
                                    },
                                    closeOnBackdropClick: false,
                                    closeOnEsc: false,
                                });
                            }
                        }
                    }

                    this.isReplyHide = !~showAnsTypes.indexOf(ansType) ? true : false;
                }
            }

            // is alone component
            this.qaMenuStatus = isAloneComponent ? true : false;

            if (isAloneComponent) {
                this.replyData = {
                    isload: false,
                    module: "qa-editor",
                    channel: this.currentTab,
                    isClear: true,
                    openEditor: this.data?.openEditor,
                };
                this.webviewData = {
                    isLoad: false,
                    module: "qa-editor",
                    channel: this.currentTab,
                    isClear: true,
                };
            }

            if (this.isWebviewHide)
                this.webviewData = {
                    isLoad: false,
                    channel: this.currentTab,
                    module: "qa-editor",
                    isClear: true,
                };

            // is answer over max component limitation
            this.isQaMenuDisabled[channel] = false;
            this.isQaMenuDisabled[channel] = this.viewContainerRef.length >= EDITOR_COMPONENT.MAX ? true : false;

            // 編輯框側邊的按鈕狀態
            const isAlone = this.qaIconStatus(menuItemData, isAloneComponent, !!loadData ? "load" : "add");

            // Transmit Parameters to Component
            (componentRef.instance as { data: any }).data = {
                id: componentRandomId,
                channel,
                module: "qa-editor",
                operatorConfig: OPERATOR_CONFIG,
                qaMenu: this.qaMenu,
                subType: this.subType,
                isAlone,
                loadData,
                orderList: this.orderList,
                openMode: this.data.openMode,
                openEditor: this.data.openEditor,
                selector: componentFactory.selector,
                stateObject,
                viewContainerRef: this.viewContainerRef,
            };
        }

        this.loadingSpiner = false;
    }

    /**
     * replace Component
     *
     * @private
     * @param {*} component
     * @param {*} menuItem
     * @memberof QaEditorComponent
     */
    private replaceComponent(component, menuItem) {
        const qaEditorBodyElem = this.elementRef.nativeElement.querySelector(".editorBody");
        const elemChildList = qaEditorBodyElem.children;

        for (const i in elemChildList) {
            const child = elemChildList[i].children;
            if (!!child) {
                if (child[0].id === menuItem.data.id) {
                    const onSelectState = this.editorService.onSelectStateParser(menuItem.data.selector);
                    const stateObjectResult = this.qaEditorService.stateObject[onSelectState].result;
                    if (!!stateObjectResult && !!stateObjectResult[menuItem.data.id])
                        delete stateObjectResult[menuItem.data.id];

                    menuItem.data.index = +i;

                    this.loadComponent(component, menuItem.data);
                }
            }
        }
    }

    /**
     * dynamic Component
     *
     * @private
     * @param {*} tag
     * @param {*} loadData
     * @memberof QaEditorComponent
     */
    private dynamicComponent(tag, loadData) {
        this.changeDetectorRef.detach();
        // 各元件類型轉換
        const component = this.editorService.onSelectComponentParser(COMPONENTS_LIST, tag);

        // 動態產生元件或寫入 qaEditorInfoObj保存
        this.loadComponent(component, null, loadData);

        setTimeout(() => {
            this.changeDetectorRef.reattach();
        }, SET_TIMEOUT.REATTACH);
    }

    /**
     * subscribe State
     *
     * @private
     * @memberof QaEditorComponent
     */
    private subscribeState() {
        for (const i in STATE) {
            const stateObjectRxjs$ = this.editorService.getStateObjectService(this, i);
            const stateQaObj = this.editorService.getStateQaObject(i);
            STATE[i] = stateObjectRxjs$.subscribe((resp) => {
                this.qaEditorService.stateObject[stateQaObj] = resp.data || {};
            });
        }
    }

    /**
     * ### on Menu Click
     *
     * @private
     * @memberof QaEditorComponent
     */
    private onMenuClick() {
        this.nbBottomMenu = this.nbMenuService.onItemClick().subscribe((title: { item: any; tag: any }) => {
            const isAloneComponent = !!~this.specificComponent.indexOf(title.item.tag);
            const component = this.editorService.onSelectComponentParser(COMPONENTS_LIST, title.item.tag);
            const operatorData = title.item.data || {};

            // clear item from stateObject before replace component
            if (!!Object.keys(operatorData).length) {
                const stateObj = this.editorService.onSelectStateParser(operatorData.selector);
                const stateObjResult = this.qaEditorService.stateObject[stateObj].result || {};
                delete stateObjResult[operatorData.id];
            }

            // this.triggerTab from Button click & operatorData.channel from operator ckick
            this.triggerTab = !~["new", "clone"].indexOf(title.tag) ? title.tag : "";
            this.smartQaEditorObj["triggerTab"] = this.triggerTab || this.smartQaEditorObj["triggerTab"];
            this.smartQaEditorObj["triggerTab"] = operatorData.channel || this.smartQaEditorObj["triggerTab"];

            this.implementComponent(title, isAloneComponent, component, title.item.tag);
        });
    }

    /**
     * implement Component
     *
     * @private
     * @param {*} title
     * @param {*} isAloneComponent
     * @param {*} component
     * @param {*} isFromMenuClickTag
     * @memberof QaEditorComponent
     */
    private implementComponent(title, isAloneComponent, component, isFromMenuClickTag) {
        const channel = this?.data?.channel || "";
        const isOpenDialog = channel === this.currentTab && channel === this.smartQaEditorObj["triggerTab"];
        const typeConverter = JSON.parse(EDITOR_TYPE.TYPE);
        const idx = Object.values(typeConverter).indexOf(title.item.tag);
        const type = Object.keys(typeConverter)[idx];

        if (!!title.item.data) {
            if (isAloneComponent && isOpenDialog) {
                this.nbDialogService.open(ConfirmDialogComponent).onClose.subscribe((dialogResp) => {
                    if (!!dialogResp && dialogResp.action === "confirm") {
                        this.replaceComponent(component, title.item);
                        if (isFromMenuClickTag) this.qaEditorService.setIsClickMenu(isFromMenuClickTag);
                    }
                });
            } else {
                this.replaceComponent(component, title.item);
                if (
                    !!~title?.item?.data?.channel.indexOf("phone") &&
                    channel === title?.item?.data?.channel &&
                    title?.item?.tag === "qa-text" &&
                    this.componentOrderList.length === 1
                ) {
                    this.loadComponent(COMPONENTS_LIST["QaPlayComponent"]);
                }

                // 未知原因造成 qa-json / qa-link 也會走這
                if (isFromMenuClickTag && isFromMenuClickTag !== "qa-json" && isFromMenuClickTag !== "qa-link")
                    this.qaEditorService.setIsClickMenu(isFromMenuClickTag);
            }
        } else if (!!component) {
            if (isAloneComponent && isOpenDialog) {
                this.nbDialogService.open(ConfirmDialogComponent).onClose.subscribe((dialogResp) => {
                    if (!!dialogResp && dialogResp.action === "confirm") {
                        this.loadComponent(component);
                        if (isFromMenuClickTag) this.qaEditorService.setIsClickMenu(isFromMenuClickTag);
                    }
                });
            } else {
                this.loadComponent(component);
                // 未知原因造成 qa-json / qa-link 也會走這
                if (isFromMenuClickTag && isFromMenuClickTag !== "qa-json" && isFromMenuClickTag !== "qa-link")
                    this.qaEditorService.setIsClickMenu(isFromMenuClickTag);
            }
        }
    }

    /**
     * qaEditor Answer Parser
     *
     * @private
     * @param {*} qaEditorAnswers
     * @param {*} channel
     * @memberof QaEditorComponent
     */
    private qaEditorAnswerParser(qaEditorAnswers: any, channel: any) {
        this.componentOrderList = [];

        this.currentAnswers = qaEditorAnswers;

        for (const loadData of qaEditorAnswers) {
            // 讀取後端資料
            const typeConverter = JSON.parse(EDITOR_TYPE.TYPE);
            const tag = typeConverter[loadData.type];

            if (tag === "qa-reply") {
                // get Quick Reply data
                const quickReply = loadData.QuickReply;

                // set Quick Reply data to component【
                const quickReplyItems = quickReply.quick_reply_items;
                this.replyData = {
                    isLoad: true,
                    module: "qa-editor",
                    channel,
                    quickReplyItems,
                    openEditor: this.data?.openEditor,
                };

                // set other component that subset of Quick Reply
                const type = typeConverter[quickReply.type];
                this.dynamicComponent(type, quickReply);
            } else {
                this.replyData = {
                    isload: false,
                    module: "qa-editor",
                    channel: this.currentTab,
                    openEditor: this.data?.openEditor,
                };
                if (!!channel && !!~channel.indexOf("phone")) {
                    const isClone = this.data?.openMode === "clone" ? true : false;
                    this.dynamicComponent(tag, loadData);

                    if (!isClone)
                        if (loadData.type === "Text") {
                            this.dynamicComponent("qa-play", loadData);
                        }
                } else this.dynamicComponent(tag, loadData);
            }
        }
    }

    /**
     * init Channel
     *
     * @private
     * @memberof QaEditorComponent
     */
    private initChannel() {
        this.loadComponent(COMPONENTS_LIST["QaTextComponent"]);

        if (!!~this.data.channel.indexOf("phone")) {
            this.loadComponent(COMPONENTS_LIST["QaPlayComponent"]);
        }

        this.webviewData = {
            isLoad: false,
            channel: this.currentTab,
            module: "qa-editor",
        };

        this.replyData = {
            isLoad: false,
            channel: this.currentTab,
            module: "qa-editor",
            openEditor: this.data?.openEditor,
        };
    }

    private async getOauthsettingList() {
        if (!this.utilitiesService.getMockSession()) {
            const oauthSettingRadio = JSON.parse(localStorage.getItem("oauthSettingRadio"));
            this.oauthSettingList = oauthSettingRadio?.result?.oauthSettingList || [];
        } else {
            const oauthSetting = await this.httpService.httpGET(
                "https://tgt3dv-angular-rz1jnf--3000.local.webcontainer.io/chatbotenterprise/oauth-setting/oauth-setting"
            );
            this.oauthSettingList = oauthSetting["items"] || [];
        }
    }

    getOauthOption() {
        const channel = this.data.channel;
        this.qaEditorService.oauthTokenTargetData[channel] = this.oauthOption;
    }

    /**
     * on Activity Select Change
     *
     * @memberof QaEditorComponent
     */
    onActivitySelectChange() {
        this.activitySelect = this.activityDropdown;
        this.curActivitySelected = this.activitySelect;

        const activityObj = this.qaEditorService.activitySelected[this.currentTab] || {};
        for (const i of this.activitiesList) {
            if (i.FId === this.activitySelect) {
                activityObj.activitySelect = i.FId;
                activityObj.activitySelectName = i.FName;
            }
        }
    }

    /**
     * on Robot Select Change
     *
     * @memberof QaEditorComponent
     */
    onRobotSelectChange() {
        this.setRobotResult();
    }

    /**
     * set Robot Result
     *
     * @private
     * @memberof QaEditorComponent
     */
    private setRobotResult() {
        const channel = this.currentTab;
        const robotResultObj = {
            channel,
            robotType: this.robotRadio,
            action: this.robotSelect || "",
            emotion: this.robotSelect || "",
            speechContent: this.robotTextarea[this.currentTab] || "",
        };

        this.qaEditorService.robotResult[channel] = robotResultObj;
    }

    /**
     * verify Form
     *
     * @memberof QaEditorComponent
     */
    verifyForm() {
        if (this.isActivityTab)
            this.verifyState["activitySelect"] = this.verifyService.verify(this.curActivitySelected, ["isRequired"]);

        this.verifyState["voice"] = this.verifyService.verify(this.robotTextarea[this.qaEditorChannelTab], [
            "maxLength,500",
        ]);
        let result: boolean = true;

        for (const key in this.verifyState) {
            if (this.verifyState[key].state === false) result = false;

            this.qaEditorService.setVerifyState({
                id: key,
                state: result,
                channel: this.data.channel,
                component: "qa-editor",
            });
        }
    }

    /**
     * on Append
     *
     * @param {*} args
     * @memberof QaEditorComponent
     */
    onAppend(...args) {
        const channel = args[0];
        const qaEditorAnswers = args[1] || [];
        const lastAnswer = qaEditorAnswers[qaEditorAnswers.length - 1];

        console.debug(qaEditorAnswers);

        this.curActivitySelected = this.data.data.activitySelected || null;
        this.activitySelect = this.data.data.activitySelected || null;
        this.activitySelectName = this.data.data.activitySelectedName || null;

        // set activity dropdown selected to activitySelected
        const activityObj = this.qaEditorService.activitySelected[this.currentTab] || {};
        activityObj.activitySelect = this.activitySelect;
        activityObj.activitySelectName = this.activitySelectName;

        // check is Activity Expired
        let isActivityOn = false;
        if (!!this.activitiesList) {
            for (const i of this.activitiesList) {
                if (i.FId === this.activitySelect) {
                    this.activityDropdown = this.activitySelect;
                    isActivityOn = true;
                }
            }
        }
        if (!isActivityOn) this.activityDropdown = this.data.data.activitySelectedName || null;

        if (!!qaEditorAnswers[0]) {
            if (!!qaEditorAnswers[0].version || qaEditorAnswers[0].type === "Json") {
                this.qaEditorAnswerParser(qaEditorAnswers, channel);

                if (!!lastAnswer) {
                    // get last answer for WebViewUrl
                    const webViewUrl =
                        lastAnswer.type === "QuickReply"
                            ? lastAnswer.QuickReply["WebViewUrl"]
                            : lastAnswer["WebViewUrl"] || "";

                    this.webviewData = {
                        isLoad: true,
                        channel,
                        webViewUrl,
                    };

                    // get robotCommand from last answer
                    this.qaEditorService.loadRobotResult(this, lastAnswer, channel);

                    // set robotCommand to robotResult
                    this.setRobotResult();
                }
            } else {
                this.nbDialogService
                    .open(AlertDialogComponent, {
                        context: {
                            content: "舊資料格式不符請重試",
                        },
                        closeOnBackdropClick: false,
                        closeOnEsc: false,
                    })
                    .onClose.subscribe((dialogResp) => {
                        if (!!dialogResp && dialogResp.action === "close") {
                            window.location.reload();
                        }
                    });
            }
        } else this.initChannel();
    }

    private toggleMask(display = "none") {
        const loadingErrorMask = document.getElementsByClassName("loading-error-mask");
        const header = loadingErrorMask[0];
        const body = loadingErrorMask[1];
        if (!!header?.setAttribute) header.setAttribute("style", "display:" + display + ";");
        if (!!body?.setAttribute) body.setAttribute("style", "display:" + display + ";");
    }

    async ngOnInit() {
        this.toggleMask();

        if (!!~environment.env.indexOf("stage")) {
            let tenantList: any = localStorage.getItem("tenantList") || "[]";
            tenantList = JSON.parse(tenantList);
            const tid = this.utilitiesService.getCookie("tid") || tenantList[0]?.FId;
            if (!!tid) {
                for (const i of tenantList) {
                    if (i.FId === tid) this.curBotType = i.FBotType;
                }
            } else this.curBotType = "";
        } else this.curBotType = (this.utilitiesService.getEncryptData("curBot") || "").FBotType;

        // data from current tab
        const dataFromTabs = this.data;

        this.currentTab = dataFromTabs.channel;
        this.openEditor = dataFromTabs.openEditor;
        this.subType = "";
        if (!!Object.keys(dataFromTabs.data).length && !!dataFromTabs.data?.valueContent)
            this.qaEditorService.valueContentData = this.valueContentObj = dataFromTabs.data.valueContent;
        else this.valueContentObj = this.qaEditorService.valueContentData;

        // 複製時候會帶入複製當下所有結果
        if (!!this.data?.data?.valueContent) {
            this.qaEditorService.valueContentData[this.currentTab] = this.data.data.valueContent[this.currentTab];
        }

        // Enable activity Tab
        if (!!~this.data.channel.indexOf("_Activity")) this.isActivityTab = true;
        if (this.isActivityTab) this.qaEditorService.activitySelected[this.currentTab] = {};
        const activityListStr = localStorage.getItem("activityList");
        this.activitiesList = activityListStr !== "undefined" ? JSON.parse(activityListStr) : [];

        // Robot Setting
        this.qaEditorService.robotResult[this.currentTab] = {};

        const lineLimit = ["qa-file", "qa-mediaCard"];
        const phoneLimit = ["qa-image", "qa-card", "qa-audio", "qa-file", "qa-video", "qa-json", "qa-mediaCard"];
        const instagramLimit = ["qa-audio", "qa-file", "qa-video", "qa-mediaCard"];

        let googleLimit = ["qa-image", "qa-file", "qa-video", "qa-link", "qa-json", "qa-mediaCard"];
        if (!!~this.currentTab.indexOf("google")) {
            let smartQAData = null;

            // dataFromTabs from loading / sessionStorage from create
            if (!!dataFromTabs?.data?.tabsFrameObj?.smartQAData)
                smartQAData = dataFromTabs?.data?.tabsFrameObj?.smartQAData[this.currentTab];
            else smartQAData = JSON.parse(sessionStorage.getItem("smartQAData"));

            this.subType = smartQAData?.FQASubType || "";

            if (smartQAData?.FQASubType === "option") {
                googleLimit = [
                    "qa-image",
                    "qa-card",
                    "qa-audio",
                    "qa-file",
                    "qa-video",
                    "qa-link",
                    "qa-json",
                    "qa-mediaCard",
                ];
            }
        }

        const menuLimited: any = {
            ios: ["qa-json"],
            ios_Activity: ["qa-json"],
            android: ["qa-json"],
            android_Activity: ["qa-json"],
            line: lineLimit,
            line_Activity: lineLimit,
            phone: phoneLimit,
            phone_Activity: phoneLimit,
            google: googleLimit,
            google_Activity: googleLimit,
            instagram: instagramLimit,
            instagram_Activity: instagramLimit,
        };

        if (this.openEditor === "greeting") {
            menuLimited.web = ["qa-json", "qa-link", "qa-quote"];
            menuLimited.ios.push("qa-quote");
            menuLimited.android.push("qa-quote");
            menuLimited.line.push("qa-quote");
            menuLimited.phone.push("qa-link", "qa-quote");
            menuLimited.google.push("qa-quote");
        }

        if (this.openEditor === "marketContent") {
            menuLimited.messenger = ["qa-link", "qa-quote"];
            menuLimited.line = ["qa-link", "qa-quote", "qa-file", "qa-mediaCard"];
            menuLimited.instagram = ["qa-link", "qa-audio", "qa-file", "qa-video", "qa-mediaCard", "qa-quote"];
        }

        if (this.openEditor === "marketContentSub") {
            menuLimited.web = ["qa-json", "qa-link", "qa-quote", "qa-audio", "qa-card", "qa-file"];
            menuLimited.messenger = ["qa-json", "qa-link", "qa-quote", "qa-audio", "qa-card", "qa-file"];
            menuLimited.line = ["qa-json", "qa-link", "qa-quote", "qa-audio", "qa-card", "qa-file", "qa-mediaCard"];
            menuLimited.instagram = [
                "qa-json",
                "qa-link",
                "qa-quote",
                "qa-audio",
                "qa-file",
                "qa-video",
                "qa-mediaCard",
            ];
        }

        this.qaMenu = this.qaEditorService.setQaMenuHide(this.data.channel, this.qaMenu, menuLimited);

        this.subscribeState();

        this.onMenuClick();

        const isAnsExisted = localStorage.getItem("isAnsExisted");
        if (dataFromTabs.openMode === "load" || dataFromTabs.openMode === "clone") {
            // error dataList filter
            const dataListArr = [];
            for (const i of dataFromTabs.dataList) {
                if (Object.keys(i).length > 1) dataListArr.push(i);
            }
            this.qaEditorService.cloneCount = dataListArr.length;
            this.onAppend(dataFromTabs.channel, dataListArr);
        } else this.initChannel();

        // get robot selection list
        this.robotSelectList = this.robotRadio === "qbi" ? this.qbiSelectList : this.zenboSelectList;

        // Enable qaMenu button when operator Remove clicked
        this.isClickRemove = this.qaEditorService.isRemove$.subscribe((resp) => {
            this.qaMenuStatus = false;
            this.isQaMenuDisabled[resp.channel] = false;
        });

        const channel = this.currentTab.split("_")[0];
        this.isSingleAnsChannel = !!~["phone", "google"].indexOf(channel) ? true : false;

        this.SubIsSave = this.qaEditorService.isSave$.subscribe((resp) => {
            if (resp) this.verifyForm();
        });

        // instagram channel快速回覆顯示控制 - 刪除與移動答案
        this.isTextAtLast = this.qaEditorService.isTextAtLast$.subscribe((resp) => {
            if (resp.channel === this.data.channel) {
                if (!this.isReplyHide && !resp.isTextAns) {
                    this.nbDialogService.open(AlertDialogComponent, {
                        context: {
                            content: this.QA_EDITOR.COMMON.IG_NO_QUICK_REPLY,
                        },
                        closeOnBackdropClick: false,
                        closeOnEsc: false,
                    });
                }

                this.isReplyHide = !resp.isTextAns;
            }
        });
    }

    async ngAfterViewInit() {
        const toCloseChannelArr = this.smartQaEditorObj["toCloseChannelArr"];
        const channel = this.data.channel;
        const tabsFrameObj = this.data?.data?.tabsFrameObj || {};
        const idx = toCloseChannelArr.indexOf(channel);
        if (!!~idx) toCloseChannelArr.splice(idx, 1);
        this.htmlCollection = document.getElementsByClassName("editorBody " + channel);

        this.tabsState = this.tabsService.tabsState$.subscribe((resp) => {
            if (!resp.onNewTabTitle) return;

            resp.channel = resp.onNewTabTitle;
            this.htmlCollection = document.getElementsByClassName("editorBody " + resp.channel);
        });

        // 智能編輯答案區設定登入驗證通路
        if (this.data.openEditor === "smart-qa") {
            if (!!~this.oauthSettingChannel.indexOf(channel.split("_Activity")[0])) {
                await this.getOauthsettingList();
                this.isOauthSettingShow = true;

                this.oauthOption = tabsFrameObj?.oauthTokenTarget?.[channel] || "noAuth";
                const isOAuthAnsEnable = this.oauthSettingList.some((e) => e.FOAuthAnswerEnable);
                if (!!this?.oauthSettingList?.length && isOAuthAnsEnable) {
                    this.oauthOptions = [{ value: "noAuth", label: "無" }];
                    this.oauthSettingList.map((e) => {
                        if (e.FChannel && e.FOAuthAnswerEnable) {
                            this.oauthOptions.push({
                                value: e.FChannel,
                                label: e.FShowChannel,
                            });
                        }
                    });
                }
            }
        }

        setTimeout(() => {
            localStorage.setItem("isAnsExisted", "");
        }, SET_TIMEOUT.NORMAL);
    }

    ngOnDestroy(): void {
        for (const i in STATE) if (!!STATE[i]) STATE[i].unsubscribe();

        if (!!this.nbBottomMenu) this.nbBottomMenu.unsubscribe();
        if (!!this.isClickRemove) this.isClickRemove.unsubscribe();
        if (!!this.SubIsSave) this.SubIsSave.unsubscribe();
        if (!!this.tabsState) this.tabsState.unsubscribe();
        if (!!this.isTextAtLast) this.isTextAtLast.unsubscribe();

        // clear all states of channel
        this.utilitiesService.clearStateObject(this.qaEditorService.stateObject, this.currentTab);
        delete this.qaEditorService.qaEditorOrderList[this.currentTab];
        delete this.qaEditorService.activitySelected[this.currentTab];
        delete this.qaEditorService.robotResult[this.currentTab];
    }

    ////////////////////// Robot Settings Area ///////////////////////
    toggleRobotBody = true;

    robotRadio: string = "qbi";

    robotSelect: string;

    robotTextarea = {
        web: "",
        web_Activity: "",
        ios: "",
        ios_Activity: "",
        android: "",
        android_Activity: "",
        line: "",
        line_Activity: "",
        messenger: "",
        messenger_Activity: "",
        phone: "",
        phone_Activity: "",
    };

    robotSelectList = [];

    qbiSelectList = [];

    zenboSelectList = [];

    /**
     * toggle Robot
     *
     * @memberof QaEditorComponent
     */
    toggleRobot() {
        this.toggleRobotBody = this.toggleRobotBody ? false : true;
    }

    /**
     * get Robot Radio
     *
     * @memberof QaEditorComponent
     */
    getRobotRadio() {
        this.robotSelectList = this.robotRadio === "qbi" ? this.qbiSelectList : this.zenboSelectList;
        this.robotSelect = null;

        this.setRobotResult();
    }

    /**
     * on Robot Voice Input
     *
     * @memberof QaEditorComponent
     */
    onRobotVoiceInput() {
        this.setRobotResult();
    }
}
