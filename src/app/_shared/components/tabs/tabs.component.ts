import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver } from "@angular/core";
import { QaEditorLoaderDirective } from "@shared/directives/qa-editor-loader.directive";
import { QaEditorComponent } from "@shared/components/qa-editor/qa-editor.component";
import { TabsService, SmartQaEditorService } from "@core/state";

@Component({
    selector: "cbe-shared-tabs",
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.scss"],
})
export class TabsComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private tabsService: TabsService,
        private smartQaEditorService: SmartQaEditorService,
        private qaEditorFactoryResolver: ComponentFactoryResolver
    ) {
        this.smartQaEditorObj = this.smartQaEditorService.smartQaEditorObject;
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    /**
     * QaEditorLoader Directive
     *
     * @type {QaEditorLoaderDirective}
     * @memberof TabsComponent
     */
    @ViewChild(QaEditorLoaderDirective, { static: true })
    cbeSharedQaEditorLoader: QaEditorLoaderDirective;

    @Input() tabTitle: string;
    @Input() active = false;
    @Input() isCloseable = false;
    @Input() template;
    @Input() data: any = {};

    /**
     * smartQaEditorObj
     *
     * @memberof TabsComponent
     */
    smartQaEditorObj = {};

    /**
     * TabsState
     *
     * @type {*}
     * @memberof TabsComponent
     */
    TabsState: any;

    /**
     * tabsObj
     *
     * @type {*}
     * @memberof TabsComponent
     */
    tabsObj: any = {};

    /**
     * QaEditorState
     *
     * @type {*}
     * @memberof TabsComponent
     */
    QaEditorState: any;

    /**
     * qaEditorObj
     *
     * @type {*}
     * @memberof TabsComponent
     */
    qaEditorObj: any = {};

    openEditor = "";

    /**
     * load Component
     *
     * @memberof TabsComponent
     */
    loadComponent() {
        const data = this.data || {};
        const channel = this.tabTitle;
        const openEditor = data.openEditor || "";
        const openMode = data.openMode || "new";

        const componentFactory = this.qaEditorFactoryResolver.resolveComponentFactory(QaEditorComponent);
        const viewContainerRef = this.cbeSharedQaEditorLoader.viewContainerRef;
        const componentRef = viewContainerRef.createComponent(componentFactory);

        let dataList = [];
        if (openMode !== "clone") dataList = !!data.dataList ? data.dataList[channel] : [];
        else {
            dataList = data.dataList || [];
            for (const i of dataList) {
                i.channelId = "";
                i.channel = channel;
            }
        }

        (componentRef.instance as { data: any }).data = {
            channel,
            openEditor: this.openEditor,
            openMode,
            dataList,
            data,
            viewContainerRef,
            componentRef,
        };
    }

    ngOnInit(): void {
        this.TabsState = this.tabsService.tabsState$.subscribe((resp) => {
            this.openEditor = resp.openEditor;

            if (resp.onNewTabTitle === this.tabTitle) {
                // remove closed channel from unopenTabStack
                const unopenTabStackArr = this.smartQaEditorObj["unopenTabStack"];
                const idx = unopenTabStackArr.indexOf(resp.onNewTabTitle);
                const clickModeArr = ["click", "master-click"];
                if (!!~idx && !!~clickModeArr.indexOf(resp.onNewTabMode)) {
                    unopenTabStackArr.splice(idx, 1);
                    this.loadComponent();
                }

                const tabModeArr = ["new", "load", "clone", "cloneActivity"];
                if (!!~tabModeArr.indexOf(resp.onNewTabMode)) this.loadComponent();
            }
        });
    }

    ngOnDestroy(): void {
        if (!!this.TabsState) this.TabsState.unsubscribe();
        if (!!this.QaEditorState) this.QaEditorState.unsubscribe();
    }
}
