import {
    Component,
    OnInit,
    Input,
    ElementRef,
    ViewChild,
    ComponentFactoryResolver,
    ChangeDetectorRef,
} from "@angular/core";
import { CardContentLoaderDirective } from "@shared/directives/card-content-loader.directive";
import { CardContentComponent } from "@shared/components/card-content/card-content.component";
import { QaCardService, QaEditorService, CardContentService } from "@core/state";
import { SET_TIMEOUT } from "@core/services/global.service";
import { trigger, style, animate, transition } from "@angular/animations";
import { IAnsCardsJson } from "@core/state/qa-editor/answer-json.interface";
import { LanguageService, PostMessageService } from "@core/utils";
import { EditorService } from "@core/services/editor.service";

/**
 * CARD constant enum for number of cards limitation
 *
 * @enum {number}
 */
const enum CARD {
    MAX = 10,
    MIN = 1,
}

const enum CARD_GOOGLE {
    MAX = 10,
    MIN = 1,
}

/**
 * [Dynamic] qa-card
 * component class of angular component factory
 *
 * @export
 * @class QaCardComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-qa-card",
    templateUrl: "./qa-card.component.html",
    styleUrls: ["./qa-card.component.scss"],
    animations: [
        trigger("slider", [
            transition(":increment", [style({ transform: "translateX(100%)" }), animate(200)]),
            transition(":decrement", [animate(200, style({ transform: "translateX(100%)" }))]),
        ]),
    ],
})
export class QaCardComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private editorService: EditorService,
        private qaEditorService: QaEditorService,
        private postMessageService: PostMessageService,
        private qaCardService: QaCardService,
        private cardContentService: CardContentService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private changeDetectorRef: ChangeDetectorRef,
        private languageService: LanguageService
    ) {
        this.QA_EDITOR = this.languageService.getLanguages("QA_EDITOR");
    }

    @ViewChild("cardbody") cardbody: ElementRef;
    @ViewChild("body") body: ElementRef;
    @ViewChild(CardContentLoaderDirective, { static: true })
    cbeSharedCardContentLoader: CardContentLoaderDirective;

    @Input() data: any;

    QA_EDITOR: any;

    componentId: string;

    channelId: string = "";

    isLoad = false;

    isCardClick = false;

    viewContainerRef: any;

    canDelete = false;

    QaCardState: any;

    qaCardObj: any = {};

    CardContentState: any;

    cardContentObj: any;

    count: number = 0;

    currentCard: number = 0;

    theoryCardId = 0;

    cardfloatLeft: boolean = false;

    cardfloatRight: boolean = null;

    cardContentArr = [];

    cardContentOrderList = [];

    imageAspectRatio: string = "rectangle";

    dots = [];

    maxCard = 10;

    minCard = 1;

    isResizeHidden = false;

    /**
     * ### create component by Angular Component Factory Loader
     *
     * @param {*} component
     * @param {*} [loadData]
     * @memberof QaCardComponent
     */
    loadComponent(component, loadData?) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        this.viewContainerRef = this.cbeSharedCardContentLoader.viewContainerRef;
        const componentRef = this.viewContainerRef.createComponent(componentFactory);
        this.getTheoryCardId();

        const dataObj = {
            type: "Cards",
            channel: this.data.channel,
            module: this.data.module,
            openEditor: this.data.openEditor,
            id: this.componentId,
            currentCard: this.currentCard,
            theoryCardId: this.theoryCardId,
            body: this.body || document.querySelector(".body"),
            count: this.count,
            viewContainerRef: this.viewContainerRef,
        };
        if (loadData) dataObj["loadData"] = loadData;
        (componentRef.instance as { data: any }).data = dataObj;
    }

    /**
     * ### 卡片移動(left/right)
     *
     * @memberof QaCardComponent
     */
    onMove(direction: string) {
        if (!direction) return;

        const qaCardElem = this.body.nativeElement;
        const qaCardChildList = qaCardElem.children;
        const loadData = this?.data?.loadData;
        const fQACardColumn = loadData?.FQACardColumn || [];
        for (const i in qaCardChildList) {
            const card = qaCardChildList[i].children;
            if (!!card) {
                if (!fQACardColumn[i]) fQACardColumn[i] = {};
                fQACardColumn[i].id = card[0].id;
            }
        }

        const currentIdx = this.currentCard;
        const swapIdx = currentIdx + (direction === "right" ? 1 : -1);
        const temp1 = fQACardColumn[currentIdx];
        const temp2 = fQACardColumn[swapIdx];
        fQACardColumn[currentIdx] = temp2;
        fQACardColumn[swapIdx] = temp1;

        this.cardContentOrderList = [];
        for (const item of fQACardColumn) this.cardContentOrderList.push(item.id);

        const currentCard = qaCardChildList[this.currentCard];
        const cardId = currentCard.children[0].id;
        this.cardContentService.setCardContentMove(currentIdx, cardId, direction);

        this.selectCardContent(direction === "left" ? "prev" : "next");
    }

    /**
     * ### 卡片 id重新排列
     *
     * @memberof QaCardComponent
     */
    getTheoryCardId() {
        if (!!this.body) {
            const elem = this.body.nativeElement;
            const theoryCardIdArr = [];
            for (const card of elem.children) {
                if (!!card.children?.[0]?.id) {
                    const id = +card.children[0].id.split("_")[1];
                    theoryCardIdArr.push(id);
                }
            }
            this.theoryCardId = Math.max(...theoryCardIdArr) + 1;
            this.theoryCardId = this.theoryCardId < -Number.MAX_SAFE_INTEGER ? this.currentCard : this.theoryCardId;
        } else this.theoryCardId = this.currentCard;

        this.cardContentOrderList.push(this.componentId + "_" + this.theoryCardId);
    }

    /**
     * create card-content component
     *
     * @param {*} [loadData]
     * @memberof QaCardComponent
     */
    createCardContent(loadData?) {
        const elem = this.body.nativeElement;
        const childCount = elem.childElementCount;
        this.count = childCount + 1;
        this.currentCard = childCount;
        if (childCount !== 0) this.canDelete = true;
        if (this.count <= this.maxCard) {
            for (let i = 0; i < childCount; i++) elem.children[i].style.display = "none";
            if (loadData) this.loadComponent(CardContentComponent, loadData);
            else this.loadComponent(CardContentComponent);
            this.generateDot("add");
        }

        const cardbodyElem = this.cardbody.nativeElement;
        if (this.count > this.minCard) {
            const iconTrashElem = cardbodyElem.querySelector(".img-trash");
            iconTrashElem.style.visibility = "visible";
        }
    }

    /**
     * delete card-content
     *
     * @memberof QaCardComponent
     */
    deleteCardContent() {
        if (this.count > this.minCard) {
            const channel = this.data.channel;
            delete this.cardContentObj.result[channel];
            this.cardContentOrderList.splice(this.currentCard, 1);
            this.viewContainerRef.remove(this.currentCard);
            if (this.currentCard === 0) {
                this.selectCardContent("next");
                this.currentCard--;
            } else this.selectCardContent("prev");

            this.count--;
            if (this.count === 1) this.canDelete = false;
            this.generateDot("delete");
        }

        // hidden trash icon when CARD_MIN
        const cardbodyElem = this.cardbody.nativeElement;
        if (this.count === this.minCard) {
            const iconTrashElem = cardbodyElem.querySelector(".img-trash");
            iconTrashElem.style.visibility = "hidden";
        }
    }

    /**
     * select card by click dot or arrow
     *
     * @param {*} [action=null]
     * @param {*} [index=null]
     * @memberof QaCardComponent
     */
    selectCardContent(action = null, index = null) {
        if (!action && !index) return;

        const elem = this.body.nativeElement;
        const childCount = elem.childElementCount;

        if (action === "prev" && this.currentCard >= this.minCard) this.currentCard--;
        if (action === "next" && this.currentCard < this.maxCard - 1) this.currentCard++;
        if (action === "index") this.currentCard = index;

        for (let i = 0; i < childCount; i++) elem.children[i].style.display = "none";

        elem.children[this.currentCard].style.display = "block";

        this.isCardClick = true;
    }

    /**
     * generate dot for card-content
     *
     * @param {*} [action=null]
     * @memberof QaCardComponent
     */
    generateDot(action = null) {
        if (action === "add") this.dots.push(DotComponent);
        else if (action === "delete") this.dots.shift();

        this.qaCardService.setState({
            selectDot: { action, index: this.currentCard, id: this.componentId },
        });

        this.cardfloatLeft = this.count > this.minCard && this.currentCard > 0 ? true : false;
        this.cardfloatRight =
            this.count === this.currentCard + 1 && this.count < this.maxCard
                ? null
                : this.currentCard + 1 < this.count
                ? true
                : false;
    }

    /**
     * append card content for load
     *
     * @memberof QaCardComponent
     */
    appendToComponent() {
        const isCloneAction = !!~["clone", "cloneActivity"].indexOf(this.data.openMode);

        this.changeDetectorRef.detach();
        this.data.loadData.FQACardColumn.forEach((item, idx) => {
            item.channel = this.data.loadData.channel;
            item.imageAspectRatio = this.data.loadData.imageAspectRatio;
            item.type = this.data.loadData.type;

            this.createCardContent(item);
        });
        this.imageAspectRatio = this.data.loadData.imageAspectRatio;
        this.qaCardService.setImgAspectRatio(this.imageAspectRatio);

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

        // resolve from ngAfterViewChecked issue
        setTimeout(() => {
            this.changeDetectorRef.reattach();
        }, SET_TIMEOUT.REATTACH);

        this.setResultState();
    }

    /**
     * set state of component
     *
     * @memberof QaCardComponent
     */
    setResultState() {
        this.data.stateObject = this.qaEditorService.stateObject;
        let result = {};
        let cardContentResult = !!this.cardContentObj ? this.cardContentObj.result || {} : {};
        const channel = this.data.channel;
        cardContentResult = cardContentResult[channel] || {};
        let FQACardColumn = [];
        for (const theoryCardId in cardContentResult) {
            if (!!~theoryCardId.indexOf(this.componentId)) {
                FQACardColumn = [];
                for (const cardOrderIdx of this.cardContentOrderList)
                    FQACardColumn.push(cardContentResult[cardOrderIdx]);
            }
        }

        const resultObj: IAnsCardsJson = {
            channelId: this.channelId,
            channel,
            FQACardColumn,
            type: "Cards",
            version: "v770",
            imageAspectRatio: this.imageAspectRatio,
        };

        result = Object.assign(this.qaCardObj.result || {}, { [this.data.id]: resultObj }, {});

        if (!!Object.keys(result).length) {
            this.qaCardService.setState({
                data: { result },
            });
        }
    }

    /**
     * change aspect ratio of card-content image
     *
     * @param {*} event
     * @memberof QaCardComponent
     */
    imgAspectRatioChange(event) {
        this.imageAspectRatio = this.imageAspectRatio === "rectangle" ? "square" : "rectangle";
        this.qaCardService.setImgAspectRatio({ [this.componentId]: this.imageAspectRatio });
    }

    /**
     * lifecycle hook [ngOnInit]
     *
     * @memberof QaCardComponent
     */
    ngOnInit(): void {
        this.count = 1;
        this.currentCard = 0;
        this.data.stateObject = this.qaEditorService.stateObject;
        this.componentId = this.data.id;
        if (!!this.data.loadData) this.channelId = this.data.loadData.channelId || "";

        this.QaCardState = this.qaCardService.qaCardState$.subscribe((resp) => {
            this.qaCardObj = resp.data || {};

            const operate = resp.operate;
            if (!!operate && !!Object.keys(operate).length) {
                if (operate.id === this.componentId) {
                    this.selectCardContent("index", operate.index);
                    this.generateDot();
                }
            }
        });

        this.CardContentState = this.cardContentService.cardContentState$.subscribe((resp) => {
            this.cardContentObj = resp.data || {};
        });

        // Processing data from load api
        if (!!this.data.loadData) {
            this.isLoad = true;
        } else {
            this.loadComponent(CardContentComponent);
            this.generateDot("add");
        }

        this.setResultState();

        this.minCard = !!~this.data.channel.indexOf("google") ? CARD_GOOGLE.MIN : CARD.MIN;
        this.maxCard = !!~this.data.channel.indexOf("google") ? CARD_GOOGLE.MAX : CARD.MAX;

        this.isResizeHidden = !!~["google", "instagram"].indexOf(this.data.channel.split("_")[0]);
    }

    /**
     * lifecycle hook [ngAfterViewChecked]
     *
     * @memberof QaCardComponent
     */
    ngAfterViewChecked() {
        if (!!this.isLoad) {
            this.appendToComponent();
            this.isLoad = false;
        } else this.setResultState();
    }

    /**
     * lifecycle hook [ngAfterViewInit]
     *
     * @memberof QaCardComponent
     */
    ngAfterViewInit() {
        setTimeout(() => {
            const channel = this.data.channel;
            const dotArr = this.qaCardService.cardValObj[channel]["dot"];
            const dotComponent = new DotComponent(this.qaCardService);
            for (const i of dotArr) dotComponent.onSelect(i, true);
        }, SET_TIMEOUT.NORMAL);
    }

    /**
     * lifecycle hook [ngOnDestroy]
     *
     * @memberof QaCardComponent
     */
    ngOnDestroy(): void {
        if (!!this.QaCardState) this.QaCardState.unsubscribe();
        if (!!this.CardContentState) this.QaCardState.unsubscribe();
    }
}

/**
 * DotComponent for QaCardComponent
 *
 * @export
 * @class DotComponent
 */
@Component({
    template: `<div #dot class="dot selected" (click)="onSelect($event)"></div>`,
    styleUrls: ["./qa-card.component.scss"],
})
export class DotComponent {
    /**
     * @ignore
     */
    constructor(private qaCardService: QaCardService) {}

    @ViewChild("dot") dot: ElementRef;

    QaCardState: any;

    @Input() data: any;

    /**
     * set dot properties
     *
     * @param {*} [idx=null]
     * @param {*} [self=null]
     * @param {*} [id=null]
     * @memberof DotComponent
     */
    setDot(idx = null, self = null, id = null) {
        const dotArea = self.parentElement;
        const componentId = self.classList[2];

        if (componentId === id) {
            for (let i = 0; i < dotArea.querySelectorAll(".dot").length; i++)
                dotArea.querySelectorAll(".dot")[i].className = "dot";

            if (idx !== null) {
                if (dotArea.querySelectorAll(".dot")[idx])
                    dotArea.querySelectorAll(".dot")[idx].className = "dot selected";
            }
        }
    }

    /**
     * dot event on select
     *
     * @param {*} [elem=null]
     * @param {boolean} [isLoad=false]
     * @memberof DotComponent
     */
    onSelect(elem = null, isLoad = false) {
        const element = isLoad ? elem.nativeElement : elem.target;
        const selfElement = element.parentElement.parentElement;
        const elemList = selfElement.classList;
        const idx = elemList[1];
        const componentId = elemList[2];

        this.qaCardService.setState({
            operate: { action: "index", index: isLoad ? 0 : +idx, id: componentId },
        });

        this.setDot(isLoad ? 0 : idx, selfElement, componentId);
    }

    /**
     * lifecycle hook [ngOnInit]
     *
     * @memberof DotComponent
     */
    ngOnInit(): void {
        this.QaCardState = this.qaCardService.qaCardState$.subscribe((resp) => {
            const selectDot = resp.selectDot;

            if (!!selectDot && !!Object.keys(selectDot).length) {
                // get dot element
                const dotElem = this.dot.nativeElement;
                const selfElement = dotElem.parentElement.parentElement;

                // dot properties setting
                this.setDot(selectDot.action !== "add" ? selectDot.index : null, selfElement, selectDot.id);
            }
        });
    }

    /**
     * lifecycle hook [ngAfterViewInit]
     *
     * @memberof DotComponent
     */
    ngAfterViewInit() {
        if (!!this.dot) {
            const elem = this.dot.nativeElement;
            const parentElem = elem.parentElement.parentElement;
            const elemList = parentElem.classList;
            const idx = elemList[1];
            const channel = elemList[3];

            if (idx === "0") this.qaCardService.cardValObj[channel].dot.push(this.dot);
        }
    }

    /**
     * lifecycle hook [ngOnDestroy]
     *
     * @memberof DotComponent
     */
    ngOnDestroy(): void {
        if (!!this.QaCardState) this.QaCardState.unsubscribe();
    }
}
