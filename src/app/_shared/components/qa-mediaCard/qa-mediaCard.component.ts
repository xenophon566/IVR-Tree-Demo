import { Component, OnInit, Input, ElementRef, ViewChild, ComponentFactoryResolver } from "@angular/core";
import { CardContentLoaderDirective } from "@shared/directives/card-content-loader.directive";
import { CardContentComponent } from "@shared/components/card-content/card-content.component";
import { QaEditorService, QaMediaCardService, CardContentService } from "@core/state";
import { IAnsMediaCardsJson } from "@core/state/qa-editor/answer-json.interface";
import { EditorService } from "@core/services/editor.service";
import { LanguageService, PostMessageService } from "@core/utils";

/**
 * Qa ediaCard Component
 *
 * @export
 * @class QaMediaCardComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-media-card",
    templateUrl: "./qa-mediaCard.component.html",
    styleUrls: ["./qa-mediaCard.component.scss"],
})
export class QaMediaCardComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private editorService: EditorService,
        private qaEditorService: QaEditorService,
        private postMessageService: PostMessageService,
        private qaMediaCardService: QaMediaCardService,
        private cardContentService: CardContentService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private languageService: LanguageService
    ) {
        this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    /**
     * cardbody ElementRef
     *
     * @type {ElementRef}
     * @memberof QaMediaCardComponent
     */
    @ViewChild("cardbody") cardbody: ElementRef;

    /**
     * body ElementRef
     *
     * @type {ElementRef}
     * @memberof QaMediaCardComponent
     */
    @ViewChild("body") body: ElementRef;

    /**
     * CardContentLoader Directive
     *
     * @type {CardContentLoaderDirective}
     * @memberof QaMediaCardComponent
     */
    @ViewChild(CardContentLoaderDirective, { static: true })
    cbeSharedCardContentLoader: CardContentLoaderDirective;

    @Input() data: any;

    QA_EDITOR: any;

    componentId: string;

    channelId: string = "";

    isLoad = false;

    viewContainerRef: any;

    canDelete = false;

    QaMediaCardState: any;

    qaMediaCardObj: any = {};

    CardContentState: any;

    cardContentObj: any;

    count: number = 0;

    currentCard: number = 0;

    cardfloatLeft: boolean = false;

    cardfloatRight: boolean = false;

    cardContentArr = [];

    /**
     * load Component
     *
     * @param {*} component
     * @param {*} [loadData]
     * @memberof QaMediaCardComponent
     */
    loadComponent(component, loadData?) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        this.viewContainerRef = this.cbeSharedCardContentLoader.viewContainerRef;
        const componentRef = this.viewContainerRef.createComponent(componentFactory);

        const dataObj = {
            channel: this.data.channel,
            module: this.data.module,
            openEditor: this.data.openEditor,
            id: this.componentId,
            currentCard: this.currentCard,
            body: this.body || document.querySelector(".body"),
            count: this.count,
            type: "MediaCard",
        };

        if (loadData) dataObj["loadData"] = loadData;

        (componentRef.instance as { data: any }).data = dataObj;

        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);
        if (isCloneAction) {
            this.qaEditorService.cloneCount--;

            if (!this.qaEditorService.cloneCount) {
                this.postMessageService.postMessage("custom", {
                    type: "loaderHide",
                });

                if (!!this.qaEditorService.cloneMsgStack.length) this.editorService.showCbeAlert(this);
                this.qaEditorService.cloneCount = 0;
                this.qaEditorService.cloneMsgStack = [];
            }
        }
    }

    /**
     * set Result State
     *
     * @memberof QaMediaCardComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let result = {};
        let cardContentResult = !!this.cardContentObj ? this.cardContentObj.result || {} : {};
        const channel = this.data.channel;
        cardContentResult = cardContentResult[channel] || {};

        const FQACardColumn = [];
        for (const i in cardContentResult) if (!!~i.indexOf(this.componentId)) FQACardColumn.push(cardContentResult[i]);

        const objId = this.data.id + "_0";

        const resultObj: IAnsMediaCardsJson = !!cardContentResult[objId] ? cardContentResult[objId] : {};

        resultObj.channelId = this.channelId;

        result = Object.assign(this.qaMediaCardObj.result || {}, { [this.data.id]: resultObj }, {});

        if (!!Object.keys(result).length) {
            this.qaMediaCardService.setState({
                data: { result },
            });
        }
    }

    ngOnInit(): void {
        this.count = 1;
        this.currentCard = 0;
        this.data.stateObject = this.qaEditorService.stateObject;
        this.componentId = this.data.id;
        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        this.loadComponent(CardContentComponent, this.data.loadData);

        this.QaMediaCardState = this.qaMediaCardService.qaMediaCardState$.subscribe((resp) => {
            this.qaMediaCardObj = resp.data || {};
        });

        this.CardContentState = this.cardContentService.cardContentState$.subscribe((resp) => {
            this.cardContentObj = resp.data || {};
        });

        // Processing data from load api
        if (!!this.data.loadData) this.isLoad = true;

        this.setResultState();
    }

    ngAfterViewChecked() {
        this.setResultState();
    }

    ngOnDestroy(): void {
        if (!!this.QaMediaCardState) this.QaMediaCardState.unsubscribe();
        if (!!this.CardContentState) this.QaMediaCardState.unsubscribe();
    }
}
