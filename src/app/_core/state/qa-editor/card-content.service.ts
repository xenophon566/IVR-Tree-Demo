import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * card content service
 *
 * @export
 * @class CardContentService
 */
@Injectable({
    providedIn: "root",
})
export class CardContentService {
    constructor() {}

    /**
     * Behavior Subject RxJS for card content state
     *
     * @memberof CardContentService
     */
    public cardContentState = new BehaviorSubject<any>({});
    cardContentState$ = this.cardContentState.asObservable();

    /**
     * set RxJS state
     *
     * @param {*} value
     * @memberof CardContentService
     */
    setState(value: any): void {
        this.cardContentState.next(value);
    }

    /**
     * Behavior Subject RxJS for card pic state
     *
     * @memberof CardContentService
     */
    public cardPicState = new BehaviorSubject<any>({});
    cardPicState$ = this.cardPicState.asObservable();

    /**
     * set RxJS card pic state
     *
     * @param {*} value
     * @param {boolean} [isRmove=false]
     * @memberof CardContentService
     */
    setCardPicState(value: any, isRmove = false) {
        const curState = Object.assign({}, this.cardPicState.getValue());

        if (curState[value.groupId]) {
            if (curState[value.groupId] && curState[value.groupId][value.id] && isRmove)
                delete curState[value.groupId][value.id];
            else {
                let isExist: boolean = false;
                curState[value.groupId].forEach((item) => {
                    if (item.index === value.index) {
                        item.hasPic = value.hasPic;
                        isExist = true;
                    }
                });
                if (!isExist) curState[value.groupId].push(value);
            }
        } else {
            curState[value.groupId] = [value];
        }

        this.cardPicState.next(curState);
    }

    /**
     * ### RxJS for Card Content Move
     *
     * @memberof CardContentService
     */
    public cardContentMove = new BehaviorSubject<any>({});
    cardContentMove$ = this.cardContentMove.asObservable();

    /**
     * ### 用於處理卡片內容左右移動
     *
     * @param {number} cardIdx 卡片內容位置Index
     * @param {string} currentCardId 卡片內容Id
     * @param {string} action 卡片內容移動方向(left/right)
     * @memberof CardContentService
     */
    setCardContentMove(cardIdx: number, cardId: string, action: string) {
        this.cardContentMove.next({
            cardIdx,
            cardId,
            action,
        });
    }
}
