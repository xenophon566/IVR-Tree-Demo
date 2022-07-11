import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { GuidedDraggingTool } from './GuidedDraggingTool';

import * as go from 'gojs';

@Component({
    selector: 'cbe-gojs-ivr',
    templateUrl: './gojs-ivr.component.html',
    styleUrls: ['./gojs-ivr.component.scss'],
})
export class GojsIvrComponent implements OnInit {
    diagram: go.Diagram = new go.Diagram();

    @ViewChild('diagramDiv') diagramRef: ElementRef<HTMLDivElement>;

    @Input() get model(): go.Model {
        return this.diagram.model;
    }
    set model(val: go.Model) {
        this.diagram.model = val;
    }

    @Output() nodeSelected = new EventEmitter<go.Node | null>();

    @Output() modelChanged = new EventEmitter<go.ChangedEvent>();

    constructor() {
        const $ = go.GraphObject.make;
        this.diagram = new go.Diagram();
        this.diagram.initialContentAlignment = go.Spot.Left;
        this.diagram.allowDrop = true;
        this.diagram.toolManager.draggingTool = new GuidedDraggingTool();

        // diagram
        this.diagram = $(go.Diagram, {
            allowCopy: false,
            'draggingTool.dragsTree': true,
            'commandHandler.deletesTree': true,
            'undoManager.isEnabled': true,
            layout: $(go.TreeLayout, { angle: 90, arrangement: go.TreeLayout.ArrangementFixedRoots }),
        });

        // tooltiptemplate
        const tooltiptemplate = $(
            'ToolTip',
            { 'Border.fill': 'whitesmoke' },
            $(
                go.TextBlock,
                {
                    font: 'bold 12px Helvetica',
                    wrap: go.TextBlock.WrapFit,
                    margin: 16,
                },
                new go.Binding('text', 'description')
            )
        );

        // subTitleTemplate
        const subTitleTemplate = $(
            go.Panel,
            'Horizontal',
            { margin: new go.Margin(0, 0, 4, 0) },
            $(go.TextBlock, { margin: new go.Margin(0, 4, 0, 0) }, new go.Binding('text'))
        );

        // actionTemplate
        const actionTemplate = $(
            go.Panel,
            'Horizontal',
            { margin: new go.Margin(0, 0, 4, 0) },
            $(
                go.Shape,
                { width: 12, height: 12, margin: new go.Margin(0, 4, 0, 0) },
                new go.Binding('figure'),
                new go.Binding('fill')
            )
        );

        // nodeTemplate
        this.diagram.nodeTemplate = $(
            go.Node,
            'Vertical',
            { selectionAdorned: false }, // 選擇節點外框高亮關閉
            // { toolTip: tooltiptemplate }, // tooltip功能暫時關閉
            new go.Binding('isTreeExpanded').makeTwoWay(), // remember the expansion state for
            new go.Binding('wasTreeExpanded').makeTwoWay(), // when the model is re-loaded
            { selectionObjectName: 'BODY' },
            $(
                go.Panel,
                'Auto',
                { name: 'BODY', width: 240 },

                // 節點樣式設定
                $(
                    go.Shape,
                    'RoundedRectangle',
                    new go.Binding('fill', 'color'),
                    new go.Binding('strokeWidth', 'borderWidth'),
                    new go.Binding('stroke', 'borderColor')
                ),

                // 節點內容顯示
                $(
                    go.Panel,
                    'Vertical',
                    { margin: new go.Margin(8, 0) },

                    // 節點主標題
                    $(go.TextBlock, 'Horizontal', new go.Binding('text', 'question'), {
                        margin: new go.Margin(2, 0, 4, 6),
                        alignment: go.Spot.Left,
                        stretch: go.GraphObject.Horizontal,
                        font: 'bold 12px sans-serif',
                    }),

                    // 節點內容排版
                    $(
                        go.Panel,
                        'Vertical',

                        // 節點副標題
                        $(
                            go.Panel,
                            'Horizontal',
                            {
                                width: 212,
                                margin: 8,
                                defaultAlignment: go.Spot.Left,
                                itemTemplate: subTitleTemplate,
                            },
                            new go.Binding('itemArray', 'channel')
                        ),
                        new go.Binding('visible', 'actions', (acts) => Array.isArray(acts) && acts.length > 0),
                        $(
                            go.Panel,
                            'Horizontal',
                            {
                                width: 212,
                                margin: 8,
                                defaultAlignment: go.Spot.Left,
                                itemTemplate: actionTemplate,
                            },
                            new go.Binding('itemArray', 'actions')
                        )
                    )
                )
            ),
            $(
                go.Panel, // this is underneath the "BODY"
                { height: 17 }, // always this height, even if the TreeExpanderButton is not visible
                $('TreeExpanderButton')
            )
        );

        // linkTemplate
        this.diagram.linkTemplate = $(
            go.Link,
            go.Link.Orthogonal,
            new go.Binding('routing'),
            new go.Binding('corner'),
            new go.Binding('curve'),

            // 連線寬度與顏色
            $(go.Shape, { strokeWidth: 4 }, new go.Binding('stroke', 'color')),
            $(
                go.Shape,
                { toArrow: 'Standard', scale: 1 },
                new go.Binding('fill', 'color'),
                new go.Binding('stroke', 'color')
            ),
            $(
                go.TextBlock,
                go.Link.OrientUpright,
                {
                    background: 'white',
                    visible: false,
                    segmentIndex: -2,
                    segmentOrientation: go.Link.None,
                },
                new go.Binding('text', 'answer'),
                new go.Binding('visible', 'answer', (a) => (a ? true : false))
            )
        );

        // addDiagramListener
        this.diagram.addDiagramListener('ChangedSelection', (e) => {
            const node = e.diagram.selection.first();
            this.nodeSelected.emit(node instanceof go.Node ? node : null);
        });

        this.diagram.addModelChangedListener((e) => e.isTransactionFinished && this.modelChanged.emit(e));
    }

    ngOnInit() {}

    ngAfterViewInit() {
        this.diagram.div = this.diagramRef.nativeElement;
    }
}
