/**
 * interface of state
 *
 * @export
 * @interface IState
 */
export interface IState {
    /**
     * QaTextState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaTextState: { unsubscribe?: any };

    /**
     * QaImageState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaImageState: { unsubscribe?: any };

    /**
     * QaCardState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaCardState: { unsubscribe?: any };

    /**
     * QaAudioState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaAudioState: { unsubscribe?: any };

    /**
     * QaFileState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaFileState: { unsubscribe?: any };

    /**
     * QaVideoState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaVideoState: { unsubscribe?: any };

    /**
     * QaLinkState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaLinkState: { unsubscribe?: any };

    /**
     * QaJsonState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaJsonState: { unsubscribe?: any };

    /**
     * QaMediaCardState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaMediaCardState: { unsubscribe?: any };

    /**
     * QaReplyState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaReplyState?: { unsubscribe?: any };

    /**
     * QaWebviewState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaWebviewState?: { unsubscribe?: any };

    /**
     * QaRobotState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaRobotState?: { unsubscribe?: any };

    /**
     * QaPlayState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaPlayState?: { unsubscribe?: any };

    /**
     * QaQuoteState
     *
     * @type {{ unsubscribe?: any }}
     * @memberof IState
     */
    QaQuoteState: { unsubscribe?: any };
}

/**
 * interface of state ocject
 *
 * @export
 * @interface IStateObject
 */
export interface IStateObject {
    /**
     * qaTextObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaTextObj: { result?: any };

    /**
     * qaImageObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaImageObj: { result?: any };

    /**
     * qaCardObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaCardObj: { result?: any };

    /**
     * qaAudioObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaAudioObj: { result?: any };

    /**
     * qaFileObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaFileObj: { result?: any };

    /**
     * qaVideoObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaVideoObj: { result?: any };

    /**
     * qaLinkObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaLinkObj: { result?: any };

    /**
     * qaJsonObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaJsonObj: { result?: any };

    /**
     * qaMediaCardObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaMediaCardObj: { result?: any };

    /**
     * qaReplyObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaReplyObj?: { result?: any };

    /**
     * qaWebviewObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaWebviewObj?: { result?: any };

    /**
     * qaPlayObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaPlayObj?: { result?: any };

    /**
     * qaQuoteObj
     *
     * @type {{ result?: any }}
     * @memberof IStateObject
     */
    qaQuoteObj: { result?: any };
}
