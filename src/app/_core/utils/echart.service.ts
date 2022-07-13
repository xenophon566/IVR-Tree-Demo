import { Injectable } from "@angular/core";
import { SeparatorPipe } from "@shared/pipes/separator.pipe";
import { GLOBAL_STYLES } from "@core/services";
import { UtilitiesService } from "@core/utils";

@Injectable({
    providedIn: "root",
})
export class EchartService {
    constructor(private separatorPipe: SeparatorPipe, private utilitiesService: UtilitiesService) {}

    echart = {
        title: {
            show: false,
            text: "",
            textAlign: "left",
            left: "1%",
            textStyle: {
                fontFamily: GLOBAL_STYLES.FONT.FAMILY,
                fontSize: GLOBAL_STYLES.FONT.SIZE_20,
            },
            subtext: "",
            subtextStyle: {
                fontFamily: GLOBAL_STYLES.FONT.FAMILY,
                fontSize: GLOBAL_STYLES.FONT.SIZE_16,
                lineHeight: 16,
                width: 940,
                overflow: "breakAll",
            },
        },
    };

    bar = {
        barYaxis: {
            axisLabel: {
                show: true,
                color: "#000",
                fontFamily: GLOBAL_STYLES.FONT.FAMILY,
                fontSize: GLOBAL_STYLES.FONT.SIZE_14,
                formatter: (v) => {
                    return v.length > 38 ? v.slice(0, 38) + "..." : v;
                },
            },
        },
        barLegend: {
            textStyle: {
                fontFamily: GLOBAL_STYLES.FONT.FAMILY,
                fontSize: GLOBAL_STYLES.FONT.SIZE_14,
                fontWeight: GLOBAL_STYLES.FONT.WEIGHT_BOLD,
            },
        },
    };

    line = {
        lineStyleEvent: {
            mouseover: {
                emphasis: {
                    lineStyle: {
                        width: 4,
                    },
                },
                itemStyle: {
                    emphasis: {
                        borderWidth: 8,
                    },
                },
            },
            mouseout: {
                emphasis: {
                    lineStyle: {
                        width: 2,
                    },
                },
                itemStyle: {
                    emphasis: {
                        borderWidth: 4,
                    },
                },
            },
        },
        lineTooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
            },
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            position: this.positionFormatter,
            formatter: (...params) => {
                const self = this;
                const paramArr = Array.isArray(params[0]) ? params[0] : [params[0]];
                let sortedArr = [];
                sortedArr = [...paramArr];
                sortedArr.sort((a, b) => b.value - a.value);
                const tooltipStr = [];
                sortedArr.forEach((v) => {
                    const content = `${v.marker} ${v.seriesName} ${self.separatorPipe.transform(v.value)}<br/>`;
                    tooltipStr.push(content);
                });

                return tooltipStr.join("");
            },
        },
        linePercentTooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
            },
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            position: this.positionFormatter,
            formatter: (...params) => {
                const self = this;
                const paramArr = Array.isArray(params[0]) ? params[0] : [params[0]];
                let sortedArr = [];
                sortedArr = [...paramArr];
                sortedArr.sort((a, b) => b.value - a.value);
                const tooltipStr = [];
                sortedArr.forEach((v) => {
                    const content = `${v.marker} ${v.seriesName} ${v.value}%<br/>`;
                    tooltipStr.push(content);
                });

                return tooltipStr.join("");
            },
        },
        lineYaxis: {
            type: "value",
            interval: 10,
            axisPointer: {
                label: {
                    precision: 1,
                    formatter: (v) => {
                        return v.value.toFixed(1);
                    },
                },
            },
            axisLabel: {
                color: "#000",
                fontFamily: GLOBAL_STYLES.FONT.FAMILY,
                fontSize: GLOBAL_STYLES.FONT.SIZE_14,
                margin: 24,
                formatter: (v) => {
                    return this.separatorPipe.transform(v);
                },
            },
        },
        linePercentYaxis: {
            type: "value",
            interval: 10,
            axisPointer: {
                label: {
                    formatter: (v) => {
                        return v.value.toFixed(1);
                    },
                },
            },
            axisLabel: {
                color: "#000",
                fontFamily: GLOBAL_STYLES.FONT.FAMILY,
                fontSize: GLOBAL_STYLES.FONT.SIZE_14,
                margin: 24,
                formatter: (v) => {
                    return v + "%";
                },
            },
        },
        lineLegend: {
            type: "scroll",
            padding: [0, 0, 0, 0],
            orient: "vertical",
            left: "82%",
            data: [],
            textStyle: {
                fontFamily: GLOBAL_STYLES.FONT.FAMILY,
                fontSize: GLOBAL_STYLES.FONT.SIZE_14,
                fontWeight: GLOBAL_STYLES.FONT.WEIGHT_BOLD,
            },
            formatter: (v) => {
                return v.length > 16 ? v.slice(0, 16) + "..." : v;
            },
        },
        lineGrid: {
            top: 20,
            left: "8%",
            width: "72%",
            height: 240,
        },
    };

    getEchartTitle(...params) {
        const text = params[0];
        const subtext = params[1];
        const obj = this.echart.title;
        obj["text"] = text;
        obj["subtext"] = subtext;

        return obj;
    }

    getMaxOfData(seriesArr: any[]) {
        let maxValue = 0;
        for (const i of seriesArr) {
            if (maxValue < Math.max(...i.data)) maxValue = Math.max(...i.data);
        }

        return maxValue;
    }

    /**
     * getOptionInterval
     *
     * @param {(number | string)} yAxisMaxVal
     * @return {*}  {number}
     * @memberof EchartService
     */
    getOptionInterval(yAxisMaxVal: number | string): number {
        const yMaxVal = 0 | +yAxisMaxVal || 0;
        let intervalVal = 1;

        if (yMaxVal > 10 && yMaxVal <= 100) intervalVal = 0 | (yMaxVal / 10 + 1);
        else if (yMaxVal > 100) {
            const digits = ("" + (yMaxVal - 0)).length - 1;
            const first = +("" + (yMaxVal - 0))[0] + 1;
            const maxVal = Math.pow(10, digits) * first;
            intervalVal = 0 | (maxVal / 5);
        }

        return intervalVal;
    }

    positionFormatter(...params) {
        const pos = params[0];
        const size = params[4];
        const obj = { top: "10%" };
        obj["left"] = pos[0] < size.viewSize[0] / 2 ? pos[0] + 50 : pos[0] - (size.contentSize[0] + 50);

        return obj;
    }

    getLineLegend(...params) {
        const legendPadding = params[0];
        const obj = this.line.lineLegend;
        obj["padding"] = [legendPadding, 0, 0, 0];

        return obj;
    }

    getLineGrid(...params) {
        const compareDateObj = params[0];
        const obj = this.line.lineGrid;
        obj["top"] = !!compareDateObj ? 68 : 20;

        return obj;
    }

    getLineDrawCanvas(...params) {
        const canvasOption = params[0];
        const option = params[1];
        const subtextContentLength = params[2];
        const compareDateObj = params[3];
        const gridTop = !!compareDateObj ? 56 : 24;

        canvasOption["title"]["show"] = true;
        canvasOption["series"] = option["series"];
        canvasOption["legend"] = option["legend"];
        canvasOption["grid"]["top"] = Math.max(80 * (subtextContentLength / 80) + gridTop, gridTop);
        canvasOption["legend"]["top"] = Math.max(80 * (subtextContentLength / 80) + gridTop, gridTop);

        return canvasOption;
    }

    /**
     * treeNodeParser
     *
     * @param {*} object
     * @return {*}
     * @memberof UtilitiesService
     */
    treeNodeParser(object, total = 0) {
        const objArr = [];
        let othersIdx = null;
        for (const i in Object.keys(object)) {
            const k = Object.keys(object)[i];
            if (k === "others") othersIdx = +i;
            objArr.push({
                key: k,
                value: object[k].value || 0,
            });
        }
        let othersTmp = null;
        if (othersIdx !== null) othersTmp = objArr.splice(othersIdx, 1);
        this.utilitiesService.sortObjArrByKey(objArr, "value", "DESC");
        if (othersIdx !== null) objArr.push(othersTmp[0]);

        const sortedObj = {};
        for (const i of objArr) sortedObj[i.key] = object[i.key];
        return Object.entries(sortedObj).map(([key, value]) =>
            Object.assign(
                key === "value" || key === "data" ? { name: "" } : { name: key },
                !!value && !!Object.keys(value["data"]).length
                    ? {
                          path: value["path"] || "",
                          value: value["value"],
                          rate: value["value"] / (total || value["value"]),
                          lineStyle: {
                              curveness: 0.9,
                              width: 0 | ((30 * value["value"]) / (total || value["value"])) || 1,
                          },
                          children: this.treeNodeParser(value["data"], total || value["value"]) || null,
                      }
                    : {
                          path: value["path"] || "",
                          value: value["value"],
                          rate: value["value"] / (total || value["value"]),
                          lineStyle: {
                              curveness: 0.9,
                              width: 0 | ((30 * value["value"]) / (total || value["value"])) || 1,
                          },
                          children: null,
                      }
            )
        );
    }
}
