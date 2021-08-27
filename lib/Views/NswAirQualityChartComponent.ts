import { DomElement } from "domhandler";
import { runInAction } from "mobx";
import React, { ReactElement } from "react";
import DeveloperError from "terriajs-cesium/Source/Core/DeveloperError";
import CommonStrata from "terriajs/lib/Models/Definition/CommonStrata";
const ChartExpandAndDownloadButtons: any = require("terriajs/lib/ReactViews/Custom/Chart/ChartExpandAndDownloadButtons")
  .default;
const FeatureInfoPanelChart: any = require("terriajs/lib/ReactViews/Custom/Chart/FeatureInfoPanelChart")
  .default;

import CustomComponent, {
  ProcessNodeContext
} from "terriajs/lib/ReactViews/Custom/CustomComponent";
import NswAirQualityCatalogItem from "../Models/NswAirQualityCatalogItem";
import ChartPreviewStyles from "terriajs/lib/ReactViews/Custom/Chart/chart-preview.scss";
import filterOutUndefined from "terriajs/lib/Core/filterOutUndefined";

/**
 * A `<nswairqualitychart>` custom component. It displays an interactive chart along with
 * "expand" buttons. The expand button adds a catalog item with
 * the data to the workbench, causing it to be displayed on the Chart Panel.
 * The chart detects if it appears in the second column of a <table> and, if so,
 * rearranges itself to span two columns.
 *
 * A `<nswairqualitychart>` component may have the following attributes:
 * - [title]: The title of the chart. If not supplied, defaults to the name of the context-supplied feature, if available, or else simply "Chart".
 * - [expand-days]: List of days that should appear in the expand menu. eg: expand-days="1,7,14"
 * - [hide-expand-button]: When `true` hides the expand button; `false` by default.
 */
export default class NswAirQualityChartComponent extends CustomComponent {
  readonly name = "nswairqualitychart";
  readonly attributes = ["title", "expand-days", "hide-expand-button"];

  processNode(
    context: ProcessNodeContext,
    node: DomElement,
    children: ReactElement[],
    index: number
  ): ReactElement | undefined {
    if (this.isChart(node)) {
      return this.processChart(context, node, children, index);
    } else if (this.isFirstColumnOfChartRow(node)) {
      return this.processFirstColumn(context, node, children, index);
    } else if (this.isSecondColumnOfChartRow(node)) {
      return this.processSecondColumn(context, node, children, index);
    }
    throw new DeveloperError("processNode called unexpectedly.");
  }

  /**
   * Is this node the chart element itself?
   * @param node The node to test.
   */
  private isChart(node: DomElement): boolean {
    return node.name === this.name;
  }

  private processChart(
    context: ProcessNodeContext,
    node: DomElement,
    _children: ReactElement[],
    _index: number
  ): ReactElement | undefined {
    if (!(context.catalogItem instanceof NswAirQualityCatalogItem)) {
      return;
    }

    if (node.attribs === undefined) {
      return undefined;
    }

    checkAllPropertyKeys(node.attribs, this.attributes);
    const catalogItem = context.catalogItem;
    const expandDays = (splitStringIfDefined(node.attribs["expand-days"]) || [])
      .map(s => parseInt(s))
      .filter(d => !isNaN(d));
    const expandNames = expandDays.map(d => `${d}d`);
    const id = context.feature.properties["Site_Id"].getValue();
    const xColumn = "DateTime";
    const yColumns = filterOutUndefined([catalogItem.activeStyle]);
    const title = node.attribs["title"];
    const parameterName = catalogItem.nameFromParameterCode(
      catalogItem.activeStyle || ""
    );
    const sourceItems = expandDays.map((day, i) => {
      const id = `${context.catalogItem.uniqueId}:${context.feature.id}:${day}`;
      const item = this.createChartItem(
        id,
        context,
        catalogItem,
        day,
        xColumn,
        yColumns
      );
      let name = `${title} - ${parameterName} values (${expandNames[i]})`;
      runInAction(() => {
        item.setTrait(CommonStrata.user, "name", name);
      });
      return item;
    });

    const chartElements = [];
    if (node.attribs["hide-expand-button"] !== "true") {
      chartElements.push(
        React.createElement(ChartExpandAndDownloadButtons, {
          key: "button",
          terria: context.terria,
          catalogItem: context.catalogItem,
          title: title,
          feature: context.feature,
          canDownload: false,
          sourceItems: sourceItems,
          sourceNames: expandNames,
          id: id,
          raiseToTitle: !!getInsertedTitle(node)
        })
      );
    }

    const item = this.createChartItem(
      undefined,
      context,
      catalogItem,
      expandDays[0] || 1,
      xColumn,
      yColumns
    );
    chartElements.push(
      React.createElement(FeatureInfoPanelChart, {
        key: "chart",
        terria: item.terria,
        item,
        height: 110
      })
    );

    return React.createElement(
      "div",
      {
        key: "chart-wrapper",
        className: ChartPreviewStyles.previewChartWrapper
      },
      chartElements
    );
  }

  /**
   * Is this node the first column of a two-column table where the second
   * column contains a `<chart>`?
   * @param node The node to test
   */
  private isFirstColumnOfChartRow(node: DomElement): boolean {
    return (
      node.name === "td" &&
      node.children !== undefined &&
      node.children.length === 1 &&
      node.parent !== undefined &&
      node.parent.name === "tr" &&
      node.parent.children !== undefined &&
      node.parent.children.length === 2 &&
      node === node.parent.children[0] &&
      node.parent.children[1].name === "td" &&
      node.parent.children[1].children !== undefined &&
      node.parent.children[1].children.length === 1 &&
      node.parent.children[1].children[0].name === "chart"
    );
  }

  private processFirstColumn(
    context: ProcessNodeContext,
    node: DomElement,
    children: ReactElement[],
    index: number
  ): ReactElement | undefined {
    // Do not return a node.
    return undefined;
  }

  /**
   * Is this node the second column of a two-column table where the second
   * column contains a `<chart>`?
   * @param node The node to test
   */
  private isSecondColumnOfChartRow(node: DomElement): boolean {
    return (
      node.name === "td" &&
      node.children !== undefined &&
      node.children.length === 1 &&
      node.children[0].name === "chart" &&
      node.parent !== undefined &&
      node.parent.name === "tr" &&
      node.parent.children !== undefined &&
      node.parent.children.length === 2
    );
  }

  private processSecondColumn(
    context: ProcessNodeContext,
    node: DomElement,
    children: ReactElement[],
    index: number
  ): ReactElement | undefined {
    const title = node.parent!.children![0].children![0].data;
    const revisedChildren: ReactElement[] = [
      React.createElement(
        "div",
        {
          key: "title",
          className: ChartPreviewStyles.chartTitleFromTable
        },
        title
      ) as ReactElement
    ].concat(children);
    return React.createElement(
      "td",
      { key: "chart", colSpan: 2, className: ChartPreviewStyles.chartTd },
      node.data,
      revisedChildren
    );
  }

  private createChartItem(
    id: string | undefined,
    context: ProcessNodeContext,
    catalogItem: NswAirQualityCatalogItem,
    numberOfDaysOfDataToFetch: number,
    xColumn: string,
    yColumns: string[]
  ) {
    const chartItem = new NswAirQualityCatalogItem(id, context.terria);
    const siteId: number = context.feature.properties["Site_Id"].getValue();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - numberOfDaysOfDataToFetch);
    const observationParams = {
      StartDate: startDate.toISOString().slice(0, 10),
      EndDate: endDate.toISOString().slice(0, 10),
      Sites: [siteId],
      Parameters: yColumns,
      Categories: ["Averages"],
      SubCategories: ["Hourly"],
      Frequency: ["Hourly average"]
    };

    runInAction(() => {
      chartItem.setTrait(CommonStrata.user, "url", catalogItem.url);
      chartItem.setTrait(
        CommonStrata.user,
        "siteDetailsUrl",
        catalogItem.siteDetailsUrl
      );
      chartItem.setTrait(
        CommonStrata.user,
        "observationParameters",
        observationParams
      );
      chartItem.setTrait(CommonStrata.user, "createColumnStyles", false);
      chartItem.setTrait(CommonStrata.user, "isChartItem", true);
      const chartStyle = chartItem.addObject(
        CommonStrata.user,
        "styles",
        "chart"
      )!;
      chartStyle.chart.setTrait(CommonStrata.user, "xAxisColumn", xColumn);
      if (yColumns) {
        yColumns.forEach(column => {
          chartStyle.chart.addObject(CommonStrata.user, "lines", column);
        });
      }
      chartItem.setTrait(CommonStrata.user, "activeStyle", "chart");
    });
    return chartItem;
  }
}

function splitStringIfDefined(s: string) {
  return s !== undefined ? s.split(",") : undefined;
}

function checkAllPropertyKeys(object: any, allowedKeys: string[]) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      if (allowedKeys.indexOf(key) === -1) {
        console.log("Unknown attribute " + key);
        throw new DeveloperError("Unknown attribute " + key);
      }
    }
  }
}

function getInsertedTitle(node: DomElement) {
  // Check if there is a title in the position 'Title' relative to node <chart>:
  // <tr><td>Title</td><td><chart></chart></tr>
  if (
    node.parent !== undefined &&
    node.parent.name === "td" &&
    node.parent.parent !== undefined &&
    node.parent.parent.name === "tr" &&
    node.parent.parent.children !== undefined &&
    node.parent.parent.children[0] !== undefined &&
    node.parent.parent.children[0].children !== undefined &&
    node.parent.parent.children[0].children[0] !== undefined
  ) {
    return node.parent.parent.children[0].children[0].data;
  }
}
