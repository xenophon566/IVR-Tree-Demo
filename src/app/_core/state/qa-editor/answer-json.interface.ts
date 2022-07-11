/**
 * type: Text,
 * FQATextAnswer: Text area,
 *
 * @export
 * @interface IAnsTextJson
 */
export interface IAnsTextJson {
    channelId: string;
    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsTextJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsTextJson
     */
    type: string;

    /**
     * text
     *
     * @type {*}
     * @memberof IAnsTextJson
     */
    text: any;

    /**
     * textToSpeech
     *
     * @type {*}
     * @memberof IAnsTextJson
     */
    textToSpeech: any;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsTextJson
     */
    version: string;
}

/**
 * type: Image,
 * imageMode: url/upload,
 * imageUrl: 原圖的位置,
 * thumbnailMode: url/upload/system,
 * thumbnailUrl: 預覽圖的位置,
 * name: 原圖檔案名稱(含副檔名),
 * height: 原圖高度(px),
 * width: 原圖寬度(px),
 * size: 原圖大小
 *
 * @export
 * @interface IAnsImageJson
 */
export interface IAnsImageJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    type: string;

    /**
     * imageMode
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    imageMode: string;

    /**
     * imageUrl
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    imageUrl: string;

    /**
     * thumbnailMode
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    thumbnailMode: string;

    /**
     * imageClickText
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    imageClickText: string;

    /**
     * thumbnailUrl
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    thumbnailUrl: string;

    /**
     * name
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    name: string;

    /**
     * width
     *
     * @type {number}
     * @memberof IAnsImageJson
     */
    width: number;

    /**
     * height
     *
     * @type {number}
     * @memberof IAnsImageJson
     */
    height: number;

    /**
     * size
     *
     * @type {number}
     * @memberof IAnsImageJson
     */
    size: number;

    /**
     * gWUploadFormData
     *
     * @type {*}
     * @memberof IAnsImageJson
     */
    gWUploadFormData: any;

    /**
     * gWUploadThumbnailFormData
     *
     * @type {*}
     * @memberof IAnsImageJson
     */
    gWUploadThumbnailFormData: any;

    /**
     * gWUploadSysFormData
     *
     * @type {*}
     * @memberof IAnsImageJson
     */
    gWUploadSysFormData: any;

    /**
     * sysThumbnailUrl
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    sysThumbnailUrl: string;

    /**
     * thumbnailSize
     *
     * @type {number}
     * @memberof IAnsImageJson
     */
    thumbnailSize?: number;

    /**
     * imageClickUrl
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    imageClickUrl: string;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsImageJson
     */
    version: string;
}

/**
 * type: Audio,
 * uploadMode: url/upload,
 * originalContentUrl: 音訊的網址,
 * duration: 實體檔案的時長(ms),
 * size: 12345,
 * name: 實體檔案的名稱
 *
 * @export
 * @interface IAnsAudioJson
 */
export interface IAnsAudioJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsAudioJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsAudioJson
     */
    type: string;

    /**
     * uploadMode
     *
     * @type {string}
     * @memberof IAnsAudioJson
     */
    uploadMode: string;

    /**
     * originalContentUrl
     *
     * @type {string}
     * @memberof IAnsAudioJson
     */
    originalContentUrl: string;

    /**
     * duration
     *
     * @type {number}
     * @memberof IAnsAudioJson
     */
    duration: number;

    /**
     * size
     *
     * @type {number}
     * @memberof IAnsAudioJson
     */
    size: number;

    /**
     * name
     *
     * @type {string}
     * @memberof IAnsAudioJson
     */
    name: string;

    /**
     * gWUploadFormData
     *
     * @type {*}
     * @memberof IAnsAudioJson
     */
    gWUploadFormData: any;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsAudioJson
     */
    version: string;

    /**
     * googleAudio
     *
     * @type {*}
     * @memberof IAnsAudioJson
     */
    googleAudio: any;
}

/**
 * type: Video,
 * uploadMode: url/upload,
 * originalContentUrl: 影片的位置,
 * thumbnailMode: url/upload/system,
 * thumbnailUrl: 預覽圖的位置,
 * sysThumbnailUrl: 系統生成預覽圖的位置
 *
 * @export
 * @interface IAnsVideoJson
 */
export interface IAnsVideoJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsVideoJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsVideoJson
     */
    type: string;

    /**
     * uploadMode
     *
     * @type {string}
     * @memberof IAnsVideoJson
     */
    uploadMode: string;

    /**
     * originalContentUrl
     *
     * @type {string}
     * @memberof IAnsVideoJson
     */
    originalContentUrl: string;

    /**
     * thumbnailMode
     *
     * @type {string}
     * @memberof IAnsVideoJson
     */
    thumbnailMode: string;

    /**
     * thumbnailUrl
     *
     * @type {string}
     * @memberof IAnsVideoJson
     */
    thumbnailUrl: string;

    /**
     * sysThumbnailUrl
     *
     * @type {string}
     * @memberof IAnsVideoJson
     */
    sysThumbnailUrl: string;

    /**
     * name
     *
     * @type {string}
     * @memberof IAnsVideoJson
     */
    name: string;

    /**
     * gWUploadFormData
     *
     * @type {*}
     * @memberof IAnsVideoJson
     */
    gWUploadFormData: any;

    /**
     * gWUploadThumbnailFormData
     *
     * @type {*}
     * @memberof IAnsVideoJson
     */
    gWUploadThumbnailFormData: any;

    /**
     * gWUploadSysFormData
     *
     * @type {*}
     * @memberof IAnsVideoJson
     */
    gWUploadSysFormData: any;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsVideoJson
     */
    version: string;
}

/**
 * type: External;
 * url: 輸入框的網址;
 *
 * @export
 * @interface IAnsExternalJson
 */
export interface IAnsExternalJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsExternalJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsExternalJson
     */
    type: string;

    /**
     * url
     *
     * @type {string}
     * @memberof IAnsExternalJson
     */
    url: string;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsExternalJson
     */
    version: string;
}

/**
 * type: Quote
 *
 * @export
 * @interface IAnsQuote
 */
export interface IAnsQuote {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsJson
     */
    type: string;

    /**
     * content
     *
     * @type {string}
     * @memberof IAnsJson
     */
    content: string;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsJson
     */
    version: string;
}

/**
 * type: Json;
 * url: 輸入框的網址;
 *
 * @export
 * @interface IAnsJson
 */
export interface IAnsJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsJson
     */
    type: string;

    /**
     * content
     *
     * @type {string}
     * @memberof IAnsJson
     */
    content: string;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsJson
     */
    version: string;
}

/**
 * type: External;
 * url: 輸入框的網址;
 *
 * @export
 * @interface IAnsFileJson
 */
export interface IAnsFileJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsFileJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsFileJson
     */
    type: string;

    /**
     * name
     *
     * @type {string}
     * @memberof IAnsFileJson
     */
    name: string;

    /**
     * size
     *
     * @type {number}
     * @memberof IAnsFileJson
     */
    size: number;

    /**
     * url
     *
     * @type {string}
     * @memberof IAnsFileJson
     */
    url: string;

    /**
     * gWUploadFormData
     *
     * @type {*}
     * @memberof IAnsFileJson
     */
    gWUploadFormData: any;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsFileJson
     */
    version: string;
}

/**
 * type: Cards;
 * imageAspectRatio: <square|rectangle>;
 * FQACardColumn: [];
 *
 * @export
 * @interface IAnsCardsJson
 */
export interface IAnsCardsJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsCardsJson
     */
    channel: string;

    /**
     * FQACardColumn
     *
     * @type {*}
     * @memberof IAnsCardsJson
     */
    FQACardColumn?: any;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsCardsJson
     */
    type?: string;

    /**
     * title
     *
     * @type {string}
     * @memberof IAnsCardsJson
     */
    title?: string;

    /**
     * thumbnailImageUrl
     *
     * @type {string}
     * @memberof IAnsCardsJson
     */
    thumbnailImageUrl?: string;

    /**
     * imageClickUrl
     *
     * @type {string}
     * @memberof IAnsCardsJson
     */
    imageClickUrl?: string;

    /**
     * FMsgAnswer
     *
     * @type {string}
     * @memberof IAnsCardsJson
     */
    FMsgAnswer?: string;

    /**
     * imageAspectRatio
     *
     * @type {string}
     * @memberof IAnsCardsJson
     */
    imageAspectRatio?: string;

    /**
     * mediaType
     *
     * @type {*}
     * @memberof IAnsCardsJson
     */
    mediaType?: any;

    /**
     * mediaMode
     *
     * @type {*}
     * @memberof IAnsCardsJson
     */
    mediaMode?: any;

    /**
     * originalContentUrl
     *
     * @type {*}
     * @memberof IAnsCardsJson
     */
    originalContentUrl?: any;

    /**
     * fbId
     *
     * @type {*}
     * @memberof IAnsCardsJson
     */
    fbId?: any;

    /**
     * name
     *
     * @type {*}
     * @memberof IAnsCardsJson
     */
    name?: any;

    /**
     * size
     *
     * @type {*}
     * @memberof IAnsCardsJson
     */
    size?: any;

    /**
     * gWUploadFormData
     *
     * @type {*}
     * @memberof IAnsCardsJson
     */
    gWUploadFormData?: any;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsCardsJson
     */
    version: string;
}

/**
 * type: Media Cards;
 * imageAspectRatio: <square|rectangle>;
 * FQACardColumn: [];
 *
 * @export
 * @interface IAnsMediaCardsJson
 */
export interface IAnsMediaCardsJson {
    channelId: string;

    /**
     * FQACardColumn
     *
     * @type {*}
     * @memberof IAnsMediaCardsJson
     */
    FQACardColumn?: any;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsMediaCardsJson
     */
    type?: string;

    /**
     * title
     *
     * @type {string}
     * @memberof IAnsMediaCardsJson
     */
    title?: string;

    /**
     * thumbnailImageUrl
     *
     * @type {string}
     * @memberof IAnsMediaCardsJson
     */
    thumbnailImageUrl?: string;

    /**
     * imageClickUrl
     *
     * @type {string}
     * @memberof IAnsMediaCardsJson
     */
    imageClickUrl?: string;

    /**
     * FMsgAnswer
     *
     * @type {string}
     * @memberof IAnsMediaCardsJson
     */
    FMsgAnswer?: string;

    /**
     * imageAspectRatio
     *
     * @type {string}
     * @memberof IAnsMediaCardsJson
     */
    imageAspectRatio?: string;

    /**
     * mediaType
     *
     * @type {*}
     * @memberof IAnsMediaCardsJson
     */
    mediaType?: any;

    /**
     * mediaMode
     *
     * @type {*}
     * @memberof IAnsMediaCardsJson
     */
    mediaMode?: any;

    /**
     * originalContentUrl
     *
     * @type {*}
     * @memberof IAnsMediaCardsJson
     */
    originalContentUrl?: any;

    /**
     * fbId
     *
     * @type {*}
     * @memberof IAnsMediaCardsJson
     */
    fbId?: any;

    /**
     * name
     *
     * @type {*}
     * @memberof IAnsMediaCardsJson
     */
    name?: any;

    /**
     * size
     *
     * @type {*}
     * @memberof IAnsMediaCardsJson
     */
    size?: any;

    /**
     * gWUploadFormData
     *
     * @type {*}
     * @memberof IAnsMediaCardsJson
     */
    gWUploadFormData?: any;
}

/**
 * Card Content
 *
 * @export
 * @interface IAnsCardContentJson
 */
export interface IAnsCardContentJson {
    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    channel: string;

    /**
     * ### card content id
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    id?: string;

    /**
     * FQACardAnswer
     *
     * @type {*}
     * @memberof IAnsCardContentJson
     */
    FQACardAnswer: any;

    /**
     * thumbnailImageUrl
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    thumbnailImageUrl?: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    type?: string;

    /**
     * reply
     *
     * @type {*}
     * @memberof IAnsCardContentJson
     */
    reply?: any;

    /**
     * imageAspectRatio
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    imageAspectRatio?: string;

    /**
     * imageClickUrl
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    imageClickUrl?: string;

    /**
     * title
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    title?: string;

    /**
     * FMsgAnswer
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    FMsgAnswer?: string;

    /**
     * mediaMode
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    mediaMode?: string;

    /**
     * mediaType
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    mediaType?: string;

    /**
     * originalContentUrl
     *
     * @type {*}
     * @memberof IAnsCardContentJson
     */
    originalContentUrl?: any;

    /**
     * fbId
     *
     * @type {*}
     * @memberof IAnsCardContentJson
     */
    fbId?: any;

    /**
     * name
     *
     * @type {*}
     * @memberof IAnsCardContentJson
     */
    name?: any;

    /**
     * size
     *
     * @type {*}
     * @memberof IAnsCardContentJson
     */
    size?: any;

    /**
     * gWUploadFormData
     *
     * @type {*}
     * @memberof IAnsCardContentJson
     */
    gWUploadFormData?: any;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsCardContentJson
     */
    version?: string;

    textToSpeech?: string;

    imgHint?: string;
}

/**
 * ShowText: Quick Reply Button Name,
 * Option: QA,
 * ImageUrl: ,
 * DisplayText: 你知道GIOC嗎,
 * Code: {\"keyId\":\"84459043-01~172e0cb8-09a0-09db-13d7-00155da82b04\"}
 *
 * @export
 * @interface IAnsReplyContentJson
 */
export interface IAnsReplyContentJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    type?: string;

    /**
     * ShowText
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    ShowText?: string;

    /**
     * Option
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    Option?: string;

    /**
     * DisplayText
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    DisplayText?: string;

    /**
     * Code
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    Code?: string;

    /**
     * FName
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    FName?: string;

    /**
     * FShowText
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    FShowText?: string;

    /**
     * FOption
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    FOption?: string;

    /**
     * FDisplayText
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    FDisplayText?: string;

    /**
     * componentId
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    componentId?: string;

    /**
     * FCode
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    FCode?: string;

    /**
     * ImageUrl
     *
     * @type {string}
     * @memberof IAnsReplyContentJson
     */
    ImageUrl?: string;
}

/**
 * Quick Reply
 *
 * @export
 * @interface IAnsReplyJson
 */
export interface IAnsReplyJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsReplyJson
     */
    channel?: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsReplyJson
     */
    type?: string;

    /**
     * reply
     *
     * @type {*}
     * @memberof IAnsReplyJson
     */
    reply?: any;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsReplyJson
     */
    version: string;
}

/**
 * Webview
 *
 * @export
 * @interface IAnsWebviewJson
 */
export interface IAnsWebviewJson {
    channelId: string;

    /**
     * channel
     *
     * @type {string}
     * @memberof IAnsWebviewJson
     */
    channel: string;

    /**
     * type
     *
     * @type {string}
     * @memberof IAnsWebviewJson
     */
    type: string;

    /**
     * webview
     *
     * @type {string}
     * @memberof IAnsWebviewJson
     */
    webview: string;

    /**
     * version
     *
     * @type {string}
     * @memberof IAnsWebviewJson
     */
    version: string;
}
