import { Component, OnInit, Input, ElementRef } from "@angular/core";
import { QaEditorService } from "@core/state";
import { EditorService } from "@core/services/editor.service";

/**
 * OperatorComponent
 *
 * @export
 * @class OperatorComponent
 * @implements {OnInit}
 */
@Component({
    selector: "cbe-shared-operator",
    templateUrl: "./operator.component.html",
    styleUrls: ["./operator.component.scss"],
})
export class OperatorComponent implements OnInit {
    /**
     * @ignore
     */
    constructor(
        private elementRef: ElementRef,
        private qaEditorService: QaEditorService,
        private editorService: EditorService
    ) {}

    @Input() data: any;

    operatorConfig: any = {};

    isAlone: boolean = true;

    qaSideMenu: any;

    /**
     * ### operator Icon
     *
     * @private
     * @param {*} elemChildList
     * @param {number} [removeIdx=0]
     * @memberof OperatorComponent
     */
    private operatorIcon(elemChildList: any, removeIdx = 0) {
        if (elemChildList.length <= this.operatorConfig.MIN_AFTER_REMOVE) {
            let count = 0;
            let pos = 0;
            for (const i of elemChildList) {
                if (i.children[0].id === this.data.id) pos = count;
                count++;
            }

            // only one answer component remaining
            const operator = elemChildList[pos === 0 ? 1 : 0].querySelector(".operator");
            for (const elem in operator.children) {
                if (!isNaN(+elem) && +elem !== 0) operator.children[elem].style.visibility = "hidden";
            }
        } else {
            // get the first component - for arrow up
            const firstElemIdx = 0;
            const firstOperatorIdx = firstElemIdx === removeIdx ? 1 : 0;
            const firstOperator = elemChildList[firstOperatorIdx].querySelector(".operator");
            firstOperator.children[2].style.visibility = "hidden";
            firstOperator.children[2].style.position = "absolute";

            // get the last component - for arrow down
            let lastElemIdx = 0;
            for (const i in elemChildList) {
                if (elemChildList[i].className === "qaMenu-btn") lastElemIdx = +i;
            }
            lastElemIdx -= 1;
            const operatorIdx = lastElemIdx - (lastElemIdx === removeIdx ? 1 : 0);
            const lastOperator = elemChildList[operatorIdx].querySelector(".operator");
            lastOperator.children[3].style.visibility = "hidden";
            lastOperator.children[3].style.position = "absolute";
        }
    }

    /**
     * ### instagram channel快速回覆顯示控制
     *
     * @private
     * @param {*} channel
     * @param {*} orderList
     * @memberof OperatorComponent
     */
    private getIsTextAtLast(channel: any, orderList: any) {
        if (channel.split("_Activity")[0] === "instagram") {
            const lastId = orderList[channel][orderList[channel].length - 1];
            const isTextAns = !!this.data?.stateObject?.["qaTextObj"]?.result[lastId] ? true : false;
            this.qaEditorService.setIsTextAtLast({
                channel,
                isTextAns,
            });
        }
    }

    /**
     * ### on Remove
     *
     * @memberof OperatorComponent
     */
    onRemove() {
        const qaEditorBodyElem = this.elementRef.nativeElement.closest(".editorBody");
        const elemChildList = qaEditorBodyElem.children;
        let removeIdx = 0;
        this.qaEditorService.setIsClickMenu(true);
        if (elemChildList.length > this.operatorConfig.MIN_AFTER_CLEAR) {
            const channel = this.data.channel;
            const orderList = this.data.orderList;

            for (const i in elemChildList) {
                const child = elemChildList[i].children;
                if (!!child) {
                    if (child[0].id === this.data.id) {
                        const state = this.editorService.onSelectStateParser(this.data.selector);
                        const removedObj = this.data.stateObject[state].result[this.data.id];

                        delete this.data.stateObject[state].result[this.data.id];
                        this.data.viewContainerRef.remove(+i);
                        orderList[channel].splice(+i, 1);

                        this.qaEditorService.setGlobal({ orderList });
                        this.qaEditorService.setIsRemove(channel, child[0].id, removedObj.type);

                        removeIdx = +i;
                    }
                }
            }

            this.getIsTextAtLast(channel, orderList);
        }

        this.operatorIcon(elemChildList, removeIdx);
    }

    /**
     * ### 答案往上移動
     *
     * @memberof OperatorComponent
     */
    onUp() {
        const qaEditorBodyElem = this.elementRef.nativeElement.closest(".editorBody");
        const elemChildList = qaEditorBodyElem.children;
        const viewContainerRef = this.data.viewContainerRef;
        const channel = this.data.channel;
        const orderList = this.data.orderList;

        for (const i in elemChildList) {
            const child = elemChildList[i].children;
            if (!!child) {
                if (child[0].id === this.data.id) {
                    const elemCount = elemChildList.length - this.operatorConfig.MIN_DOWNWARD;
                    const elemIndex = +i;
                    const posIdx = elemIndex - 1;
                    const viewRef = viewContainerRef.get(elemIndex);

                    if (this.operatorConfig.CONFIG_MODULE === "greeting-editor" && orderList.web.length > elemCount) {
                        // hotfix for greeting-editor - redundancy elements on greeting
                        const removeCount = orderList.web.length - elemCount;
                        for (let count = 0; count < removeCount; count++) orderList.web.shift();
                    }

                    const orderListArr = orderList[channel];
                    if (posIdx < elemCount) {
                        const temp1 = orderListArr[elemIndex];
                        const temp2 = orderListArr[posIdx];
                        orderListArr[elemIndex] = temp2;
                        orderListArr[posIdx] = temp1;
                        orderList[channel] = orderListArr;

                        this.qaEditorService.setGlobal({ orderList });

                        viewContainerRef.move(viewRef, posIdx);
                    }

                    break;
                }
            }
        }

        this.getIsTextAtLast(channel, orderList);

        // scan for operator icon status
        this.editorService.setOperatorStatus(elemChildList, this.operatorConfig, "onUp");
    }

    /**
     * ### 答案往下移動
     *
     * @memberof OperatorComponent
     */
    onDown() {
        const qaEditorBodyElem = this.elementRef.nativeElement.closest(".editorBody");
        const elemChildList = qaEditorBodyElem.children;
        const viewContainerRef = this.data.viewContainerRef;
        const channel = this.data.channel;
        const orderList = this.data.orderList;

        for (const i in elemChildList) {
            const child = elemChildList[i].children;
            if (!!child) {
                if (child[0].id === this.data.id) {
                    const elemCount = elemChildList.length - this.operatorConfig.MIN_DOWNWARD;
                    const elemIndex = +i;
                    const posIdx = elemIndex + 1;
                    const viewRef = viewContainerRef.get(elemIndex);

                    if (this.operatorConfig.CONFIG_MODULE === "greeting-editor" && orderList.web.length > elemCount) {
                        // hotfix for greeting-editor - redundancy elements on greeting
                        const removeCount = orderList.web.length - elemCount;
                        for (let count = 0; count < removeCount; count++) orderList.web.shift();
                    }

                    const orderListArr = orderList[channel];
                    if (posIdx < elemCount) {
                        const temp1 = orderListArr[elemIndex];
                        const temp2 = orderListArr[posIdx];
                        orderListArr[elemIndex] = temp2;
                        orderListArr[posIdx] = temp1;
                        orderList[channel] = orderListArr;

                        this.qaEditorService.setGlobal({ orderList });

                        viewContainerRef.move(viewRef, posIdx);
                    }

                    break;
                }
            }
        }

        this.getIsTextAtLast(channel, orderList);

        // scan for operator icon status
        this.editorService.setOperatorStatus(elemChildList, this.operatorConfig, "onDown");
    }

    ngOnInit(): void {
        this.qaSideMenu = [];

        this.operatorConfig = this.data.operatorConfig;

        const qaMenu = this.data.qaMenu;
        for (const i of qaMenu) {
            this.qaSideMenu.push({
                title: i.title,
                icon: i.icon,
                tag: i.tag,
                data: this.data,
            });
        }

        this.isAlone = this.data.isAlone;
    }
}
