import { Component, OnInit, ViewChild, ComponentFactoryResolver } from "@angular/core";
import { NbMenuService, NbDialogService } from "@nebular/theme";
import { ConfirmDialogComponent } from "@shared/components";
import { TabsLoaderDirective } from "@shared/directives/tabs-loader.directive";
import { TabsComponent } from "@shared/components/tabs/tabs.component";
import { QaEditorService, TabsFrameService, TabsService, SmartQaEditorService } from "@core/state";
import { LanguageService, UtilitiesService, PostMessageService } from "@core/utils";
import { GlobalService, GLOBAL, SET_TIMEOUT, HttpService } from "@core/services";
import { PipeTransform, Pipe } from "@angular/core";
import { environment } from "@env/environment";
import * as _ from "lodash";
/**
 * Tabs Frame for dynamic tabs
 *
 * @export
 * @class TabsFrameComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-tabs-frame",
    templateUrl: "./tabs-frame.component.html",
    styleUrls: ["./tabs-frame.component.scss"],
})
export class TabsFrameComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private httpService: HttpService,
        private utilitiesService: UtilitiesService,
        private globalService: GlobalService,
        private tabsFrameService: TabsFrameService,
        private tabsService: TabsService,
        private qaEditorService: QaEditorService,
        private nbMenuService: NbMenuService,
        private nbDialogService: NbDialogService,
        private smartQaEditorService: SmartQaEditorService,
        private tabFactoryResolver: ComponentFactoryResolver,
        private postMessageService: PostMessageService,
        private languageService: LanguageService
    ) {
        this.smartQaEditorObj = this.smartQaEditorService.smartQaEditorObject;
        // this.i18n?.TAB_COMPONENT? = this.languageService.getLanguages('TAB_COMPONENT');
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    TAB_COMPONENT: any;

    smartQaEditorObj = {};

    /**
     * Tabs Loader Directive
     *
     * @type {TabsLoaderDirective}
     * @memberof TabsFrameComponent
     */
    @ViewChild(TabsLoaderDirective) cbeSharedTabsLoader: TabsLoaderDirective;

    /**
     * qaEditor Template
     *
     * @memberof TabsFrameComponent
     */
    @ViewChild("qaEditorTemplate") qaEditorTemplate;

    tab: TabsComponent;

    tabs: TabsComponent[] = [];

    nbBottomMenu: any;

    isChannelBtnShow = true;

    TabsFrameState: any;

    tabsFrameObj: any = {};

    QaEditorState: any;

    webViewHideChannel = ["line", "messenger"];

    activityTabFilterArr = [];

    channelName = GLOBAL.CHANNEL_NAME;

    channels = [];

    channelList = [{ title: "web", value: "Web" }];

    channelActive = {
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
        google: "",
        google_Activity: "",
        instagram: "",
        instagram_Activity: "",
    };

    channelOpened = {
        web_Activity: false,
        ios_Activity: false,
        android_Activity: false,
        line_Activity: false,
        messenger_Activity: false,
        phone_Activity: false,
        google_Activity: false,
        instagram_Activity: false,
    };

    prevSelectedTab = "";

    tabActivity = "";

    viewContainerRef: any;

    verifyState: any;

    SubVerifyState: any;

    curBotRxjs: any;

    curBot = {};

    /**
     * getAvailableChannels
     *
     * @private
     * @returns
     * @memberof TabsFrameComponent
     */
    private getAvailableChannels() {
        const channels = this.utilitiesService.getEnableChannels(this.curBot["FChannel"] || "web");
        const omnichannel = [];
        for (const channel of channels) omnichannel.push({ title: this.channelName[channel], value: channel });
        return omnichannel;
    }

    /**
     * clear Unopen Tab Stack
     *
     * @private
     * @param {*} unopenTabStackArr
     * @param {string} channel
     * @memberof TabsFrameComponent
     */
    private clearUnopenTabStack(unopenTabStackArr: any, channel: string) {
        const unopenActiveIdx = unopenTabStackArr.indexOf(channel);
        const fActivitySelected = this.smartQaEditorService.smartQaEditorObject["fActivitySelected"] || {};
        const fAnswerResult = this.smartQaEditorService.smartQaEditorObject["fAnswerResult"] || {};

        if (!!~unopenActiveIdx) {
            unopenTabStackArr.splice(unopenActiveIdx, 1);
            delete fActivitySelected[channel];
            delete fAnswerResult[channel];
        }
    }

    private clearChannelOpened() {
        this.channelOpened = {
            web_Activity: false,
            ios_Activity: false,
            android_Activity: false,
            line_Activity: false,
            messenger_Activity: false,
            phone_Activity: false,
            google_Activity: false,
            instagram_Activity: false,
        };
    }

    /**
     * new tab
     *
     * @private
     * @param {*} title
     * @param {string} [mode='new']
     * @param {*} template
     * @param {*} [paramsObj=null]
     * @param {boolean} [isCloseable=false]
     * @param {*} isActivity
     * @memberof TabsFrameComponent
     */
    private newTab(title, mode = "new", template, paramsObj = null, isCloseable = false, isActivity) {
        if (mode === "load" && !isCloseable) {
            this.tabs = [];
            this.channels = [];
            this.viewContainerRef.clear();
        }

        if (mode === "clone") this.cloneTab(paramsObj, title);

        if (!~this.channels.indexOf(title)) this.channels.push(title);
        this.utilitiesService.sortArrByOrder(this.channels, GLOBAL.CHANNEL_ORDER.split(","));

        // get channel index by fixed order
        const channelIdx = this.channels.indexOf(title);

        // create and insert component by index of fixed order
        this.viewContainerRef = this.cbeSharedTabsLoader.viewContainerRef;
        const componentFactory = this.tabFactoryResolver.resolveComponentFactory(TabsComponent);
        const componentRef = this.viewContainerRef.createComponent(componentFactory, channelIdx);
        const instance: TabsComponent = componentRef.instance as TabsComponent;
        instance.active = true;
        instance.tabTitle = title;
        instance.template = template;
        instance.isCloseable = isCloseable;
        instance.data = paramsObj;

        // append tabs by index of fixed order
        this.tabs.splice(channelIdx, 0, componentRef.instance as TabsComponent);

        for (const i of this.tabs) {
            if (i.tabTitle === title) {
                // [New tab] as follows modes
                const tabModeArr = ["new", "clone", "cloneActivity"];
                if (!!~tabModeArr.indexOf(mode)) this.doNewTab(title, mode);

                // [Load tab] new tab when title is 'web' or push to unopen tab stack
                if (mode === "load") {
                    if (title === "web") this.doNewTab(title, mode);
                    else this.smartQaEditorObj["unopenTabStack"].push(title);
                }

                this.selectTab(i, !!isActivity, false, mode);

                break;
            }
        }

        // set to [Default] after clone
        // clone => [Default], cloneActivity => [Activity]
        if (mode === "clone" && isActivity) {
            const tabTitle = title.split("_Activity")[0].toLowerCase();
            for (const i of this.tabs) {
                if (i.tabTitle === tabTitle) this.selectTab(i, false, false, mode);
            }
        }

        setTimeout(() => {
            this.tabsService.setState({
                currentTab: title,
                viewContainerRef: this.viewContainerRef,
                openEditor: "smart-qa",
            });
        }, SET_TIMEOUT.REATTACH);
    }

    /**
     * clone tab
     *
     * @private
     * @param {*} paramsObj
     * @param {*} channel
     * @memberof TabsFrameComponent
     */
    private cloneTab(paramsObj: any, channel: any) {
        let hasNotSupport: boolean = false;
        let copiedChannel: string = "web";
        let sweetAlertTitle: string = "";

        if (paramsObj.dataList) {
            const spliceIndex = [];
            paramsObj.dataList.forEach((item, index) => {
                if (item.type === "QuickReply") item = item.QuickReply;

                if (!!channel) {
                    channel = channel.split("_")[0];
                    if (!!~this.webViewHideChannel.indexOf(channel) && item.WebViewUrl) delete item.WebViewUrl;
                    switch (channel) {
                        case "line":
                            if (item.type === "MediaCard" || item.type === "File") {
                                copiedChannel = item.channel;
                                hasNotSupport = true;
                                spliceIndex.push(index);
                                sweetAlertTitle = this.i18n?.TAB_COMPONENT?.LINE_LIMIT;
                            }
                            break;
                        case "messenger":
                            if (item.type === "LinkImage") {
                                copiedChannel = item.channel;
                                hasNotSupport = true;
                                spliceIndex.push(index);
                                sweetAlertTitle = this.i18n?.TAB_COMPONENT?.MESSENGER_LIMIT;
                            }
                            break;
                        case "android":
                            if (item.type === "Json") {
                                copiedChannel = item.channel;
                                hasNotSupport = true;
                                spliceIndex.push(index);
                                sweetAlertTitle = this.i18n?.TAB_COMPONENT?.ANDROID_LIMIT;
                            }
                            break;
                        case "ios":
                            if (item.type === "Json") {
                                copiedChannel = item.channel;
                                hasNotSupport = true;
                                spliceIndex.push(index);
                                sweetAlertTitle = this.i18n?.TAB_COMPONENT?.IOS_LIMIT;
                            }
                            break;
                        case "phone":
                            if (
                                !!~[
                                    "Image",
                                    "LinkImage",
                                    "Cards",
                                    "Audio",
                                    "File",
                                    "Video",
                                    "MediaCard",
                                    "Json",
                                ].indexOf(item.type)
                            ) {
                                this.openSweetDialog("phone");
                                copiedChannel = item.channel;
                                spliceIndex.push(index);
                            }
                            break;
                        case "google":
                            if (!!~["Image", "LinkImage", "File", "Video", "MediaCard", "Json"].indexOf(item.type)) {
                                this.openSweetDialog("google");
                                copiedChannel = item.channel;
                                spliceIndex.push(index);
                            }
                            break;
                        case "instagram":
                            if (!!~["LinkImage", "Audio", "File", "Video", "MediaCard"].indexOf(item.type)) {
                                copiedChannel = item.channel;
                                hasNotSupport = true;
                                spliceIndex.push(index);
                                sweetAlertTitle = this.i18n?.TAB_COMPONENT?.INSTAGRAM_LIMIT;
                            }
                            break;
                    }
                }
            });

            if (spliceIndex.length > 0) {
                if (spliceIndex.length === 1 && paramsObj.dataList.length === 1) {
                    const copyQRAnswer = Object.assign({}, paramsObj.dataList[0]);
                    // 單答不支援格式
                    if (copyQRAnswer.QuickReply) {
                        const newQReply = Object.assign(
                            {},
                            {
                                QuickReply: {
                                    text: [""],
                                    type: "Text",
                                    version: "v770",
                                    quick_reply_items: copyQRAnswer.QuickReply.quick_reply_items,
                                },
                                channel: copyQRAnswer.channel,
                                type: "QuickReply",
                                version: "v770",
                            }
                        );

                        if (!!copyQRAnswer.QuickReply.robotCommand)
                            newQReply.QuickReply["robotCommand"] = copyQRAnswer.QuickReply.robotCommand;

                        if (!!copyQRAnswer.QuickReply.WebViewUrl)
                            newQReply.QuickReply["WebViewUrl"] = copyQRAnswer.QuickReply.WebViewUrl;

                        paramsObj.dataList = [newQReply];
                    } else {
                        const newQReply = Object.assign(
                            {},
                            {
                                channel: copiedChannel,
                                text: [""],
                                type: "Text",
                                version: "v770",
                            }
                        );

                        if (!!copyQRAnswer.robotCommand) newQReply["robotCommand"] = copyQRAnswer.robotCommand;

                        if (!!copyQRAnswer.WebViewUrl) newQReply["WebViewUrl"] = copyQRAnswer.WebViewUrl;

                        paramsObj.dataList = [newQReply];
                    }
                } else {
                    // 多答不支援格式
                    spliceIndex.reverse().forEach((index) => {
                        if (paramsObj.dataList && paramsObj.dataList[index]) {
                            const copyQRAnswer = Object.assign({}, paramsObj.dataList[index]);

                            if (paramsObj.dataList && paramsObj.dataList.length === 1) {
                                // 剩下最後一筆
                                if (copyQRAnswer.QuickReply) {
                                    const newQReply = {
                                        QuickReply: {
                                            text: [""],
                                            type: "Text",
                                            version: "v770",
                                            quick_reply_items: copyQRAnswer.QuickReply.quick_reply_items,
                                        },
                                        channel: paramsObj.dataList[index].channel,
                                        type: "QuickReply",
                                        version: "v770",
                                    };

                                    paramsObj.dataList = [this.cloneRobotAndWebView(copyQRAnswer, newQReply, true)];
                                } else {
                                    const newAnswer = Object.assign(
                                        {},
                                        {
                                            channel: copiedChannel,
                                            text: [""],
                                            type: "Text",
                                            version: "v770",
                                        }
                                    );

                                    paramsObj.dataList = [this.cloneRobotAndWebView(copyQRAnswer, newAnswer, false)];
                                }
                            } else {
                                // 至少還有最後兩筆
                                if (copyQRAnswer.QuickReply) {
                                    // 若 QuickReply 為第一筆將 QuickReply 塞到最後一筆 (正常情況不會發生)
                                    const targetIndex = index === 0 ? paramsObj.dataList.length : index;
                                    const newQReply = {
                                        QuickReply: paramsObj.dataList[targetIndex - 1],
                                        channel: paramsObj.dataList[targetIndex - 1].channel,
                                        type: "QuickReply",
                                        version: "v770",
                                    };

                                    newQReply.QuickReply.quick_reply_items = copyQRAnswer.QuickReply.quick_reply_items;

                                    paramsObj.dataList[targetIndex - 1] = this.cloneRobotAndWebView(
                                        copyQRAnswer,
                                        newQReply,
                                        true
                                    );
                                } else {
                                    const newAnswer = Object.assign({}, paramsObj.dataList[index - 1]);

                                    paramsObj.dataList[index - 1] = this.cloneRobotAndWebView(
                                        copyQRAnswer,
                                        newAnswer,
                                        false
                                    );
                                }
                                paramsObj.dataList.splice(index, 1);
                            }
                        }
                    });
                }
            }

            if (paramsObj.dataList.length === 0)
                paramsObj.dataList = [{ channel: copiedChannel, text: [""], type: "Text", version: "v770" }];
        }

        if (hasNotSupport) {
            if (!~this.qaEditorService.cloneMsgStack.indexOf(sweetAlertTitle))
                this.qaEditorService.cloneMsgStack.push(sweetAlertTitle);
        }
    }

    private openSweetDialog(channel: string) {
        const wording = this.channelName[channel] + this.i18n?.TAB_COMPONENT?.CHANNEL_ALERT;
        this.postMessageService.postMessage("custom", {
            type: "loaderHide",
        });
        this.postMessageService.postMessage("custom", {
            type: "doSweetAlert",
            data: {
                title: this.i18n?.TAB_COMPONENT?.SYSTEM_HINT,
                text: wording,
                type: "error",
                confirmButtonText: this.i18n?.TAB_COMPONENT?.CONFIRM,
            },
        });
    }

    /**
     * clone tab order as follows
     * openTab -> cloneChannel -> newTab -> (cloneTab / doNewTab)
     *
     * @private
     * @param {string} copyTab
     * @param {*} pasteTab
     * @param {string} mode
     * @param {boolean} isActivity
     * @param {string} copyActivityTab
     * @param {string} pasteActivityTab
     * @memberof TabsFrameComponent
     */
    private cloneRobotAndWebView(copyAnswer, newAnswer, isQuickReply) {
        const deepCopyAnswer = Object.assign({}, copyAnswer);
        const deepNewAnswer = Object.assign({}, newAnswer);
        if (isQuickReply) {
            if (!!deepCopyAnswer.QuickReply.robotCommand)
                deepNewAnswer.QuickReply.robotCommand = deepCopyAnswer.QuickReply.robotCommand;

            if (!!deepCopyAnswer.QuickReply.WebViewUrl)
                deepNewAnswer.QuickReply.WebViewUrl = deepCopyAnswer.QuickReply.WebViewUrl;
        } else {
            if (!!deepCopyAnswer.robotCommand) deepNewAnswer.robotCommand = deepCopyAnswer.robotCommand;

            if (!!deepCopyAnswer.WebViewUrl) deepNewAnswer.WebViewUrl = deepCopyAnswer.WebViewUrl;
        }
        return deepNewAnswer;
    }

    /**
     * get Active Tab
     *
     * @private
     * @param {boolean} isClose
     * @param {boolean} isActivity
     * @param {string} title
     * @param {TabsComponent} tab
     * @param {string} titleActivity
     * @param {string} [mode='click']
     * @returns
     * @memberof TabsFrameComponent
     */
    private getActiveTab(
        isClose: boolean,
        isActivity: boolean,
        title: string,
        tab: TabsComponent,
        titleActivity: string,
        mode = "click"
    ) {
        // reset whole tabs
        this.tabs.forEach((val) => (val.active = false));

        // get tab of active
        let activityOpened = false;
        for (const i of this.tabs) {
            if (isClose) {
                if (isActivity && i.tabTitle === title) tab = i;
            } else {
                if (isActivity && i.tabTitle === titleActivity) tab = i;
                else if (!isActivity && i.tabTitle === title) tab = i;
            }

            if (mode === "master-click") {
                if (this.channelOpened[titleActivity]) activityOpened = true;
            } else if (mode === "click") this.channelOpened[titleActivity] = isActivity ? true : false;
        }

        if (activityOpened) {
            for (const i of this.tabs) if (i.tabTitle === titleActivity) tab = i;
        }

        return tab;
    }

    /**
     * set Activity Tab
     *
     * @private
     * @param {boolean} isClose
     * @param {boolean} isActivity
     * @param {string} titleActivity
     * @param {string} title
     * @memberof TabsFrameComponent
     */
    private setActivityTab(isClose: boolean, isActivity: boolean, titleActivity: string, title: string) {
        // reset activity channels
        for (const i in this.channelActive) this.channelActive[i] = this.channelActive[i] !== "" ? "opened" : "";

        // set active tab for tab bar
        if (isClose) {
            if (isActivity) {
                this.channelActive[titleActivity] = "";
                this.channelActive[title] = "active"; // default tab
            } else title = "web";
        } else {
            if (isActivity) this.channelActive[titleActivity] = "active";
            this.channelActive[title] = "active"; // default tab
        }

        // set active tab bar for opened activity tab
        if (this.channelOpened[titleActivity]) {
            this.channelActive[titleActivity] = "active";
            this.channelActive[title] = "active"; // default tab
        }
    }

    isPopChannel = true;

    /**
     * clone Channel
     *
     * @private
     * @param {string} copyTab
     * @param {*} pasteTab
     * @param {string} copyActivityTab
     * @param {string} pasteActivityTab
     * @param {string} mode
     * @param {boolean} isActivity
     * @memberof TabsFrameComponent
     */
    private cloneChannel(
        copyTab: string,
        pasteTab: any,
        copyActivityTab: string,
        pasteActivityTab: string,
        mode: string,
        isActivity: boolean
    ) {
        this.postMessageService.postMessage("custom", {
            type: "loaderShow",
        });

        // [Default Tab] do not clone when click 'cloneActivity'
        // scan data from stateObject to qaEditorObject
        const orderList = this.qaEditorService.qaEditorOrderList || {};
        const channelList = Object.keys(orderList);
        const qaEditorObject = this.utilitiesService.scanQaEditorObj(this, channelList, {});

        // clone default channel
        if (mode === "clone") {
            const quickReply: any = {
                type: "QuickReply",
                QuickReply: {},
                version: "v770",
            };
            let qaEditorArray = [];
            let quickReplyItem = "";
            let webview = "";
            const play = {};
            const command = {};
            const robotCommand = "";
            const dataList = qaEditorObject.result[copyTab] || [];

            if (!!~["phone", "google"].indexOf(copyTab) || !!~["phone", "google"].indexOf(pasteTab)) {
                if (copyTab !== pasteTab) {
                    this.postMessageService.postMessage("custom", {
                        type: "loaderHide",
                    });
                    if (!!~environment.env.indexOf("stage")) {
                        this.postMessageService.postMessage("custom", {
                            type: "doSweetAlert",
                            data: {
                                title: this.i18n?.TAB_COMPONENT?.SYSTEM_HINT,
                                text: this.i18n?.TAB_COMPONENT?.UNABLE_CLONE,
                                type: "error",
                                confirmButtonText: this.i18n?.TAB_COMPONENT?.CONFIRM,
                            },
                        });
                    } else {
                        this.nbDialogService.open(ConfirmDialogComponent, {
                            context: {
                                title: this.i18n?.TAB_COMPONENT?.SYSTEM_HINT,
                                content: this.i18n?.TAB_COMPONENT?.UNABLE_CLONE,
                            },
                        });
                    }

                    this.isPopChannel = false;
                    return;
                }
            }

            // get final answer
            for (const k in dataList) {
                const channelAnswer = dataList[k];

                // QuickReply
                if (channelAnswer.type === "QuickReply" && !~dataList[k].channel.indexOf("phone")) {
                    quickReplyItem = channelAnswer.reply.qReply_0;
                    continue;
                }

                // Webview
                if (channelAnswer.type === "Webview" && !~dataList[k].channel.indexOf("phone")) {
                    webview = channelAnswer.webview;
                    continue;
                }

                qaEditorArray.push(channelAnswer);
            }

            if (pasteTab === "phone") {
                quickReplyItem = "";
                webview = "";
            }

            qaEditorArray = this.qaEditorService.setFinalAnswer(
                quickReplyItem,
                qaEditorArray,
                quickReply,
                webview,
                copyTab,
                robotCommand,
                play,
                command
            );

            if (!!this.qaEditorService.valueContentData && !!this.qaEditorService.valueContentData[copyTab])
                this.qaEditorService.valueContentData[pasteTab] = this.qaEditorService.valueContentData[copyTab];

            const pasteObj = {
                openMode: "clone",
                dataList: qaEditorArray,
                valueContent: this.qaEditorService.valueContentData,
            };

            // clone a channel answers
            this.newTab(pasteTab, mode, this.qaEditorTemplate, pasteObj, true, isActivity);
        }

        // [Activity Tab] clone content when 'clone' or 'cloneActivity clicked
        const copyActivityResult =
            mode === "cloneActivity" ? qaEditorObject.result[copyTab] : qaEditorObject.result[copyActivityTab];

        // clone activity channel
        this.cloneActivityChannel(copyTab, copyActivityTab, pasteActivityTab, mode, copyActivityResult);
    }

    /**
     * clone activity channel
     *
     * @private
     * @param {string} copyTab
     * @param {string} copyActivityTab
     * @param {string} pasteActivityTab
     * @param {string} mode
     * @param {any[]} copyActivityResult
     * @memberof TabsFrameComponent
     */
    private cloneActivityChannel(
        copyTab: string,
        copyActivityTab: string,
        pasteActivityTab: string,
        mode: string,
        copyActivityResult: any[]
    ) {
        const unopenTabStack = this.smartQaEditorService.smartQaEditorObject["unopenTabStack"];
        let qaEditorArray = [];
        let activitySelect = null;

        if (!!copyActivityResult || !!~unopenTabStack.indexOf(copyActivityTab)) {
            if (!!copyActivityResult) {
                const quickReply: any = {
                    type: "QuickReply",
                    QuickReply: {},
                    version: "v770",
                };
                let quickReplyItem = "";
                let webview = "";
                const play = {};
                const command = {};
                const robotCommand = "";
                let isFirstAnswer = false;
                const pasteTab = pasteActivityTab.split("_Activity")[0];
                if (!!~pasteTab.indexOf("phone") || !!~pasteTab.indexOf("google")) {
                    copyActivityResult.map((item) => {
                        if (item.type === "play") {
                            item.params = typeof item.params === "string" ? JSON.parse(item.params) : item.params;

                            if (!!item.command && !!item.command.params) {
                                item.command.params =
                                    typeof item.command.params === "string"
                                        ? JSON.parse(item.command.params)
                                        : item.command.params;
                                return item;
                            }
                            return item;
                        }

                        if (!isFirstAnswer) {
                            isFirstAnswer = true;
                            return item;
                        } else return undefined;
                    });

                    copyActivityResult.filter((item) => item !== undefined);
                }

                // get final answer
                for (const k in copyActivityResult) {
                    const channelAnswer = copyActivityResult[k];

                    // QuickReply
                    if (channelAnswer.type === "QuickReply") {
                        quickReplyItem = channelAnswer.reply.qReply_0;
                        continue;
                    }

                    // Webview
                    if (channelAnswer.type === "Webview") {
                        webview = channelAnswer.webview;
                        continue;
                    }

                    qaEditorArray.push(channelAnswer);
                }

                if (pasteActivityTab === "phone_Activity") {
                    quickReplyItem = "";
                    webview = "";
                }

                const channel = mode === "cloneActivity" ? copyTab : copyActivityTab;
                qaEditorArray = this.qaEditorService.setFinalAnswer(
                    quickReplyItem,
                    qaEditorArray,
                    quickReply,
                    webview,
                    channel,
                    robotCommand,
                    play,
                    command
                );

                // get activity dropdown selected
                const activitySelected = this.qaEditorService.activitySelected || {};
                if (mode === "clone") activitySelect = activitySelected[copyActivityTab].activitySelect;
            } else if (!!~unopenTabStack.indexOf(copyActivityTab)) {
                const fAnswerResult = this.smartQaEditorService.smartQaEditorObject["fAnswerResult"] || {};
                const fActivitySelected = this.smartQaEditorService.smartQaEditorObject["fActivitySelected"] || {};

                qaEditorArray = fAnswerResult[copyActivityTab];

                const pasteTab = pasteActivityTab.split("_Activity")[0];
                if (!!~["phone"].indexOf(pasteTab)) {
                    if (qaEditorArray.length > 1) this.openSweetDialog(pasteTab);
                    qaEditorArray = qaEditorArray.slice(0, 1);
                }

                // get activity dropdown selected
                if (mode === "clone") activitySelect = fActivitySelected[copyActivityTab].activitySelect;
            }

            if (mode === "cloneActivity") {
                this.qaEditorService.valueContentData[pasteActivityTab] =
                    this.qaEditorService.valueContentData[pasteActivityTab.split("_Activity")[0]];
            }
            if (mode === "clone") {
                this.qaEditorService.valueContentData[pasteActivityTab] =
                    this.qaEditorService.valueContentData[copyActivityTab];
                this.qaEditorService.valueContentData[pasteActivityTab.split("_Activity")[0]] =
                    this.qaEditorService.valueContentData[copyTab];
            }

            const pasteActivityTabObj = {
                tabsFrameObj: {},
                openMode: "clone",
                dataList: qaEditorArray,
                activitySelected: activitySelect,
                valueContent: this.qaEditorService.valueContentData,
            };

            const deepPastActivityTabObj = _.cloneDeep(pasteActivityTabObj);

            // clone activity channel answers
            this.newTab(pasteActivityTab, mode, this.qaEditorTemplate, deepPastActivityTabObj, true, true);
        } else if (!copyActivityResult && mode === "cloneActivity") {
            // new a tab when empty activity
            this.newTab(pasteActivityTab, "new", this.qaEditorTemplate, {}, true, true);
        }
    }

    /**
     * do New Tab
     *
     * @private
     * @param {*} title
     * @param {string} [mode='']
     * @memberof TabsFrameComponent
     */
    private doNewTab(title: any, mode = "") {
        this.isPopChannel = true;
        setTimeout(() => {
            this.tabsService.setState({ onNewTabTitle: title, onNewTabMode: mode, openEditor: "smart-qa" });
        }, SET_TIMEOUT.EXTREMELY);
    }

    /**
     * do Close Tab
     *
     * @private
     * @param {TabsComponent} tab
     * @param {boolean} isActivity
     * @memberof TabsFrameComponent
     */
    private doCloseTab(tab: TabsComponent, isActivity: boolean) {
        const channel = tab.tabTitle.split("_Activity")[0].toLowerCase();
        const channelActivity = channel + "_Activity";
        const viewContainerRef = this.cbeSharedTabsLoader.viewContainerRef;

        // get tabs for Default & Activity
        let defaultTab = null;
        let defaultTabIdx = 0;
        let activityTab = null;
        let activityTabIdx = 0;
        const unopenTabStackArr = this.smartQaEditorObj["unopenTabStack"];

        // reset activity channel opened status
        this.channelOpened[channelActivity] = false;

        if (!!isActivity) {
            for (let i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].tabTitle === channel) defaultTab = this.tabs[i];
                if (this.tabs[i].tabTitle === channelActivity) activityTabIdx = i;
            }

            // close activity tab only
            viewContainerRef.remove(activityTabIdx);
            this.tabs.splice(activityTabIdx, 1);
            this.channelActive[channelActivity] = "";

            // clear channelActive from state object
            this.utilitiesService.clearStateObject(this.qaEditorService.stateObject, channelActivity);

            this.channels.splice(this.channels.indexOf(channelActivity), 1);

            // [Active] remove closed channel from unopenTabStack
            this.clearUnopenTabStack(unopenTabStackArr, channelActivity);

            // 刪除貼標資料
            delete this.qaEditorService.valueContentData[channelActivity];
            // select to default tab after delete activity tab
            this.selectTab(defaultTab, true, true, "load");
        } else {
            for (let i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].tabTitle === channel) {
                    defaultTab = this.tabs[i];
                    defaultTabIdx = i;

                    // close default tab
                    viewContainerRef.remove(defaultTabIdx);
                    this.tabs.splice(defaultTabIdx, 1);
                    this.channelActive[channel] = "";
                }
            }

            this.channels.splice(this.channels.indexOf(channel), 1);

            // [Default] remove closed channel from unopenTabStack
            this.clearUnopenTabStack(unopenTabStackArr, channel);

            for (let i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].tabTitle === channelActivity) {
                    activityTab = this.tabs[i];
                    activityTabIdx = i;

                    // close activity tab
                    viewContainerRef.remove(activityTabIdx);
                    this.tabs.splice(activityTabIdx, 1);
                    this.channelActive[channelActivity] = "";
                }
            }

            const actIdx = this.channels.indexOf(channelActivity);
            if (!!~actIdx) this.channels.splice(actIdx, 1);

            // [Active] remove closed channel from unopenTabStack
            this.clearUnopenTabStack(unopenTabStackArr, channelActivity);

            // clear channel & channelActivity from state object
            this.utilitiesService.clearStateObject(this.qaEditorService.stateObject, channel);
            this.utilitiesService.clearStateObject(this.qaEditorService.stateObject, channelActivity);

            // select tab after delete
            // `if` [channel === prevTab] select to [web] `else` select to previous tab
            const prevTab = this.prevSelectedTab.split("_Activity")[0].toLowerCase();
            if (channel === prevTab) this.selectTab(this.tabs[0], this.channelOpened.web_Activity, false, "load");
            else {
                for (const i of this.tabs) {
                    if (i.tabTitle === this.prevSelectedTab) {
                        this.selectTab(i, !!isActivity, false, "master-click");
                    }
                }
            }

            // 刪除貼標資料
            delete this.qaEditorService.valueContentData[channel];
            delete this.qaEditorService.valueContentData[channelActivity];
        }

        // push closed channel back to channelList
        let closeFlag = true;
        if (!isActivity) {
            this.channelList.map((key) => {
                if (key.value === channel) closeFlag = false;
            });
            if (closeFlag) {
                this.channelList.push({ title: this.channelName[channel], value: channel });
                this.utilitiesService.sortObjArrByKey(this.channelList, "value", GLOBAL.CHANNEL_ORDER.split(","));
            }
            this.isChannelBtnShow = !!this.channelList.length;
        }
    }

    /**
     * open Tab
     *
     * @param {*} title
     * @param {string} [mode='new']
     * @param {*} [paramsObj=null]
     * @param {boolean} [isActivity=false]
     * @returns
     * @memberof TabsFrameComponent
     */
    openTab(title, mode = "new", paramsObj = null, isActivity = false) {
        let tabTitle = title.split("_Activity")[0].toLowerCase();
        tabTitle += isActivity ? "_Activity" : "";

        if (mode === "new" || mode === "load") {
            if (!!paramsObj) {
                paramsObj.dataList = paramsObj.tabsFrameObj.result || {};
                paramsObj.valueContent = paramsObj.tabsFrameObj.valueContent || [];
            }

            // new or load a channel answers
            this.newTab(
                tabTitle,
                mode,
                this.qaEditorTemplate,
                paramsObj,
                tabTitle !== "web" ? true : false,
                isActivity
            );
        } else if (mode === "clone" || mode === "cloneActivity") {
            // verify before clone or cloneActivity
            this.qaEditorService.clearIsRequiredVerifyState();
            this.qaEditorService.isRequiredVerify = false;
            this.qaEditorService.clearVerify();
            this.qaEditorService.setIsSave();
            let isVaild: boolean = true;
            if (this.verifyState.length > 0) {
                this.verifyState.forEach((item) => {
                    if (!item.state) {
                        isVaild = false;
                        console.debug(
                            "Verify Failed. \nId：" +
                                item.id +
                                "\nComponent：" +
                                item.component +
                                "\nChannel：" +
                                item.channel
                        );
                    }
                });
            }

            if (isVaild) {
                const tabTitlePrev = !!this.tab ? this.tab.tabTitle : null;
                const copyTab = tabTitlePrev.split("_Activity")[0].toLowerCase();
                const copyActivityTab = copyTab + "_Activity";
                const pasteTab = title.split("_Activity")[0].toLowerCase();
                const pasteActivityTab = pasteTab + "_Activity";

                this.cloneChannel(copyTab, pasteTab, copyActivityTab, pasteActivityTab, mode, isActivity);
            } else {
                this.postMessageService.postMessage("custom", {
                    type: "loaderHide",
                });
                this.postMessageService.postMessage("custom", {
                    type: "doSweetAlert",
                    data: {
                        type: "warning",
                        title: "Oops!",
                        text: this.i18n?.TAB_COMPONENT?.VERIFY_INVAILD,
                        confirmButtonText: this.i18n?.TAB_COMPONENT?.CONFIRM,
                    },
                });

                return;
            }
        }

        if (!isActivity) {
            let idx = null;
            for (let i = 0; i < this.channelList.length; i++) if (this.channelList[i].value === tabTitle) idx = i;

            if (this.isPopChannel) this.channelList.splice(idx, 1);

            this.isChannelBtnShow = !!this.channelList.length;
        } else {
            if (mode === "new" || mode === "cloneActivity") this.channelOpened[tabTitle] = true;
        }
    }

    /**
     * close Tab
     *
     * @param {TabsComponent} tab
     * @param {boolean} [isActivity=false]
     * @param {boolean} [isClick=false]
     * @memberof TabsFrameComponent
     */
    closeTab(tab: TabsComponent, isActivity = false, isClick = false) {
        if (isClick) {
            this.nbDialogService
                .open(ConfirmDialogComponent, {
                    context: {
                        title: this.i18n?.TAB_COMPONENT?.SYSTEM_HINT,
                        content: this.i18n?.TAB_COMPONENT?.CLEAR_ANSWER,
                    },
                })
                .onClose.subscribe((dialogResp) => {
                    if (!!dialogResp && dialogResp.action === "confirm") {
                        this.doCloseTab(tab, isActivity);
                        this.qaEditorService.setIsClickMenu(true);
                    }
                });
        } else this.doCloseTab(tab, isActivity);
    }

    /**
     * select Tab
     *
     * @param {TabsComponent} tab
     * @param {boolean} [isActivity=false]
     * @param {boolean} [isClose=false]
     * @param {string} [mode='click']
     * @returns
     * @memberof TabsFrameComponent
     */
    selectTab(tab: TabsComponent, isActivity = false, isClose = false, mode = "click") {
        if (!tab) return;

        const title = tab.tabTitle.split("_Activity")[0].toLowerCase();
        const titleActivity = title + "_Activity";
        const selectedTab = isActivity ? titleActivity : title;

        // prevent the same tab selected by user click
        if (mode === "click" || mode === "master-click") {
            this.prevSelectedTab = "";
            for (const i of this.tabs) {
                if (i.active) this.prevSelectedTab = i.tabTitle;
            }

            if (selectedTab === this.prevSelectedTab) return;
        }

        this.tabActivity = title + "_Activity";

        // get active tab
        tab = this.getActiveTab(isClose, isActivity, title, tab, this.tabActivity, mode);

        // set active tab
        this.setActivityTab(isClose, isActivity, this.tabActivity, title);

        // new a tab
        if (mode === "click" || mode === "master-click") this.doNewTab(tab.tabTitle, mode);

        // set active status to tab
        tab.active = true;

        this.tab = tab;
    }

    async ngOnInit() {
        if (!!~environment.env.indexOf("stage")) {
            const httpResult: any = await this.httpService.httpPOST("/openapi/cbe/tenant/item", {
                id: this.utilitiesService.getCookie("tid"),
            });
            if (httpResult && httpResult.data) this.curBot = httpResult.data;
        } else {
            this.curBot = this.utilitiesService.getEncryptData("curBot");
            this.curBotRxjs = this.globalService.curBotRxjs$.subscribe(() => {
                this.curBot = this.utilitiesService.getEncryptData("curBot");
            });
        }

        if (!!localStorage.getItem("fChannel")) {
            for (const i of localStorage.getItem("fChannel").split(",")) {
                this.channelList.push({ title: this.channelName[i], value: i });
                this.utilitiesService.sortObjArrByKey(this.channelList, "value", GLOBAL.CHANNEL_ORDER.split(","));
            }
        } else this.channelList = this.getAvailableChannels();

        for (const i in this.channelActive) {
            if (!!~i.indexOf("_Activity")) this.activityTabFilterArr.push(i);
        }

        this.TabsFrameState = this.tabsFrameService.tabsFrameState$.subscribe((resp) => {
            this.tabsFrameObj = resp.data || {};

            // Load action listening here
            if (!!resp.action) {
                this.clearChannelOpened();

                this.smartQaEditorObj["unopenTabStack"] = [];

                this.channelActive = {
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
                    google: "",
                    google_Activity: "",
                    instagram: "",
                    instagram_Activity: "",
                };

                if (!!resp.action.close) {
                    this.tabs = [];
                    this.channelList = this.getAvailableChannels();
                }

                const toOpenChannelArr = resp.toOpenChannelArr;
                for (const i of toOpenChannelArr) {
                    const channel = i || "web";
                    const activitySelectedStr = resp.activitySelectedObject[channel] || "";

                    const activitySelected = !!activitySelectedStr ? activitySelectedStr.split(",")[0] : "";
                    const activitySelectedName = !!activitySelectedStr ? activitySelectedStr.split(",")[1] : "";

                    const paramsObj = {
                        openMode: "load",
                        tabsFrameObj: this.tabsFrameObj || {},
                        activitySelected,
                        activitySelectedName,
                    };

                    this.openTab(channel, "load", paramsObj, !!~channel.indexOf("_Activity"));
                }

                // select to first tab by load
                this.selectTab(this.tabs[0], false, false, "load");
            }
        });

        this.openTab("web", "new");

        // tag = (new / clone)
        this.nbBottomMenu = this.nbMenuService.onItemClick().subscribe((title: { item: any; tag: any }) => {
            if (!!~JSON.stringify(this.channelList).indexOf(title.item.value))
                this.openTab(title.item.value, title.tag);
        });

        this.SubVerifyState = this.qaEditorService.verifyState$.subscribe((resp) => {
            this.verifyState = resp;
        });
    }

    ngOnDestroy(): void {
        if (!!this.TabsFrameState) this.TabsFrameState.unsubscribe();
        if (!!this.nbBottomMenu) this.nbBottomMenu.unsubscribe();
        if (!!this.QaEditorState) this.QaEditorState.unsubscribe();
        if (!!this.SubVerifyState) this.SubVerifyState.unsubscribe();
        if (!!this.curBotRxjs) this.curBotRxjs.unsubscribe();

        this.clearChannelOpened();
    }
}

/**
 * activity tab filter
 *
 * @export
 * @class ActivityTabFilterPipe
 * @implements {PipeTransform}
 */
@Pipe({
    name: "activityTabFilter",
    pure: false,
})
export class ActivityTabFilterPipe implements PipeTransform {
    /**
     * pipeline transform
     *
     * @param {any[]} items
     * @param {*} filter
     * @returns {*}
     * @memberof ActivityTabFilterPipe
     */
    transform(items: any[], filter: any): any {
        if (!items || !filter) return items;
        return items.filter((item) => !~filter.indexOf(item.tabTitle));
    }
}
