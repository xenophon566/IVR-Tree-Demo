import { Component, OnInit } from '@angular/core';
import { HttpService } from '@core/services';
import { GLOBAL } from '@core/services';

import * as go from 'gojs';

@Component({
    selector: 'cbe-icr-flow',
    templateUrl: './icr-flow.component.html',
    styleUrls: ['./icr-flow.component.scss'],
})
export class IcrFlowComponent implements OnInit {
    constructor(private httpService: HttpService) {
        this.getDraw('22E8i_T_-C1~180eeb80-1bd0-009a-3f4a-00155dae811f');
    }

    channelName = GLOBAL.CHANNEL_NAME;

    gojsIVRModel = null;

    nodePalette = {
        start: '#ecededcf',
        genernal: '#ecededcf',
        end: '#ecededcf',
    };

    nodeBorderPalette = {
        node: '#ecededcf',
        next: '#72778133',
    };

    moduleTypePalette = {
        default: '#198754',
        activity: '#ffc107',
    };

    moduleType = {
        default: '常態',
        activity: '活動',
    };

    connectionPalette = {
        text: '#9ec5fe',
        image: '#8540f5',
        card: '#a6e9d5',
        audio: '#d63384',
        file: '#a18c0182',
        video: '#ea868f',
        link: '#0d6efd',
        json: '#0f5132',
        mediaCard: '#ff000182',
        quote: '#fd7e14',
        qaReply: '#ffcd39',
    };

    answerType = {
        text: '文字',
        image: '圖片',
        card: '卡片',
        audio: '音訊',
        file: '檔案',
        video: '影片',
        link: '外部連結',
        json: 'JSON',
        mediaCard: '多媒體卡片',
        quote: '轉問',
        qaReply: '快速回覆',
    };

    questions = [];

    questionId = null;

    questionChannel = 'web';

    questionEvents = 'default';

    questionTitle = '';

    isResultExist = false;

    nodePaletteArr = [];

    moduleTypePaletteArr = [];

    connectionPaletteArr = [];

    getDraw(id, channel = 'web', events = '') {
        this.questionId = id;
        this.questionChannel = channel;
        this.questionEvents = events || this.questionEvents || 'default';
        for (const question of this.questions) {
            if (question.qId === id) this.questionTitle = question.qTitle;
        }

        this.drawGojsIVR(id);
    }

    getLegend() {
        // this.nodePaletteArr = Object.keys(this.nodePalette).map((key) => {
        //     return { key, value: this.nodePalette[key] };
        // });

        // this.moduleTypePaletteArr = Object.keys(this.moduleTypePalette).map((key) => {
        //     return { key, value: this.moduleTypePalette[key] };
        // });

        this.connectionPaletteArr = Object.keys(this.connectionPalette).map((key) => {
            return { key, value: this.connectionPalette[key] };
        });
    }

    nodeSelected($event) {
        if ($event.qb?.FNode === 'next') {
            if (!!$event.qb?.FNodeNextKey) this.getDraw($event.qb?.FNodeNextKey);
        }
    }

    async drawGojsIVR(id = '') {
        if (!id) return;

        const gojsResp = await this.httpService.httpGET('/robot/ivrTree');
        const data = gojsResp?.['data'][id];
        this.isResultExist = !!data;

        const nodeArr = data?.['nodes'] || null;
        const connectionArr = data?.['connections'] || null;
        if (!nodeArr || !connectionArr) return;

        for (const node of nodeArr) {
            const questionPartsArr = node.question.match(/.{1,18}/g);
            const moduleType = node['FModuleType'].toLowerCase();
            node.question = questionPartsArr.join('\n').substr(0, 36);
            // node.question = node.key + node.question;
            if (node.question.length === 36) node.question += '...';
            node['color'] = this.nodePalette[node['FNodeType']];
            node['borderWidth'] = node['FNode'] === 'next' ? 4 : 3;
            node['borderColor'] = this.nodeBorderPalette[node['FNode']];
            node['channel'] = [
                { figure: 'Ellipse', fill: this.moduleTypePalette[moduleType], text: this.channelName[node.FChannel] },
                {
                    figure: 'Ellipse',
                    fill: this.moduleTypePalette[moduleType],
                    text: '(' + this.moduleType[moduleType] + ')',
                },
            ];
            node['actions'] = node['FAnswerType'].map((item) => {
                return {
                    figure: 'Ellipse',
                    fill: this.connectionPalette[item],
                    text: this.answerType[item],
                };
            });
        }

        const connectArr = [];
        for (const connect of connectionArr) {
            connectArr.push({
                from: connect.from,
                to: connect.to,
                color: this.connectionPalette[connect.ffaType],
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 10,
            });
        }

        this.gojsIVRModel = new go.GraphLinksModel({
            copiesArrays: true,
            copiesArrayObjects: true,
            nodeDataArray: nodeArr,
            linkDataArray: connectArr,
        });

        this.getLegend();
    }

    async ngOnInit(): Promise<void> {
        const resp = await this.httpService.httpGET('/robot/questions');
        this.questions = resp['data'];

        const activityData = await this.httpService.httpGET('/smart-qa-editor/activitiesList');
        const qaEditorAnswer = await this.httpService.httpGET('/smart-qa-editor/qaEditorAnswersIVR');
        const smartQAData = qaEditorAnswer[0].FSmartQAData;
        const ivrData = JSON.stringify({
            activityData,
            qaEditorAnswer,
            smartQAData,
            directory: 'smartqa',
            type: 'smartQA',
            tenantId: 'mock-tenantId',
            tokenId: 'mock-tokenId',
        });

        localStorage.setItem('ivrData', ivrData);
    }
}
