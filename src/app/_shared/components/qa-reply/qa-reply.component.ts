import {
    Component,
    OnInit,
    Input,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
    ComponentFactoryResolver,
} from "@angular/core";
import { GlobalService, SET_TIMEOUT } from "@core/services";
import { QaReplyService, ReplyContentService, QaEditorService } from "@core/state";
import { ReplyContentLoaderDirective } from "@shared/directives/reply-content-loader.directive";
import { ReplyContentComponent } from "@shared/components/reply-content/reply-content.component";
import { IAnsReplyJson } from "@core/state/qa-editor/answer-json.interface";
import { TranslateService } from "@ngx-translate/core";
import { LanguageService } from "@core/utils/language.service";

/**
 * QUICK REPLY_QTY 的基本常數設定
 *
 * @enum {number}
 */
enum REPLY_QTY {
    MIN = 1,
    MAX = 10,
}

enum GOOGLE_REPLY_QTY {
    MIN = 1,
    MAX = 8,
}

/**
 * QaReply Component
 *
 * @export
 * @class QaReplyComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-reply",
    templateUrl: "./qa-reply.component.html",
    styleUrls: ["./qa-reply.component.scss"],
})
export class QaReplyComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private globalService: GlobalService,
        private qaEditorService: QaEditorService,
        private qaReplyService: QaReplyService,
        private replyContentService: ReplyContentService,
        private changeDetectorRef: ChangeDetectorRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private translateService: TranslateService,
        private languageService: LanguageService
    ) {
        this.languageService.language$.subscribe((resp) => {
            this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
        });
    }

    i18n = JSON.parse(localStorage.getItem("languages"));

    /**
     * body ElementRef
     *
     * @type {ElementRef}
     * @memberof QaReplyComponent
     */
    @ViewChild("body") body: ElementRef;

    /**
     * cbeSharedReplyContentLoader Directive
     *
     * @type {ReplyContentLoaderDirective}
     * @memberof QaReplyComponent
     */
    @ViewChild(ReplyContentLoaderDirective, { static: true })
    cbeSharedReplyContentLoader: ReplyContentLoaderDirective;

    @Input() data: any;

    QA_EDITOR: any;

    channelId: string = "";

    isLoad = false;

    viewContainerRef: any;

    QaReplyState: any;

    qaReplyObj: any = {};

    ReplyContentState: any;

    replyContentObj: any = {};

    QaEditorInfoState: any;

    replyContentStatus: boolean = false;

    SubQuickReplyCount: any;

    /**
     * load Component
     *
     * @param {*} component
     * @param {*} [loadData=null]
     * @memberof QaReplyComponent
     */
    loadComponent(component, loadData = null) {
        const channel = this.data.channel;
        if (!channel) return;

        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        this.viewContainerRef = this.cbeSharedReplyContentLoader.viewContainerRef;
        const componentRef = this.viewContainerRef.createComponent(componentFactory);
        (componentRef.instance as { data: any }).data = {
            channel,
            id: "qReply",
            index: 0,
            body: this.body || document.querySelector(".body"),
            viewContainerRef: this.viewContainerRef,
            componentRef,
            module: this.data.module,
            openEditor: this.data.openEditor,
            loadData,
            countLimit: !!~channel.indexOf("google") ? GOOGLE_REPLY_QTY : REPLY_QTY,
            type: "quick-reply-content",
        };
    }

    /**
     * set Result State
     *
     * @memberof QaReplyComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        this.changeDetectorRef.detectChanges();
        const channel = this.data.channel;
        if (!!channel) {
            let reply = this.replyContentObj.result || {};
            reply = reply[channel] || {};

            let result = {};
            const resultObj: IAnsReplyJson = {
                channelId: this.channelId,
                channel,
                type: "QuickReply",
                reply,
                version: "v770",
            };

            if ((Object.keys(reply).length === 0 || !reply["qReply_0"]) && Object.keys(this.qaReplyObj).length !== 0) {
                result = Object.assign(this.qaReplyObj.result);
                delete result[channel];
                if (Object.keys(result).length === 0) result = {};
            } else {
                result = Object.assign(this.qaReplyObj.result || {}, { [channel]: resultObj }, {});
            }

            if (!!Object.keys(result).length) {
                this.qaReplyService.setState({
                    data: { result },
                });
            }

            this.qaEditorService.setIsClickMenu("qa-reply");
        }
    }

    ngOnInit(): void {
        this.data.stateObject = this.qaEditorService.stateObject;
        this.isLoad = this.data.isLoad || false;
        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        if (!this.data.isLoad) this.loadComponent(ReplyContentComponent);
        else this.loadComponent(ReplyContentComponent, this.data);

        this.QaReplyState = this.qaReplyService.qaReplyState$.subscribe((resp) => {
            this.qaReplyObj = resp.data || {};
        });

        this.ReplyContentState = this.replyContentService.replyContentState$.subscribe((resp) => {
            this.replyContentObj = resp.data || {};
        });

        setTimeout(() => {
            this.setResultState();
        }, SET_TIMEOUT.EXTREMELY);
    }

    ngAfterViewChecked() {
        this.setResultState();
    }

    ngOnChanges(e) {
        if (!e.data.firstChange && !e.data.currentValue.isLoad) this.replyContentService.setIsClearReplyAry(true);
    }

    ngOnDestroy(): void {
        if (!!this.QaReplyState) this.QaReplyState.unsubscribe();
        if (!!this.SubQuickReplyCount) this.SubQuickReplyCount.unsubscribe();
    }
}
