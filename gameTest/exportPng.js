const fs = require("fs");
const { JSDOM } = require("jsdom");
const d3 = require("d3");
const svg2png = require("svg2png");
const XMLSerializer = require("xmlserializer");
const util = require("util");

console.log("start main...");

// #pre. D3 사용하기 위한 사전 작업: 가상의 DOM을 생성해 웹 페이지를 파싱하고 조작할 수 있게 해준다.
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  features: {
    FetchExternalResources: ["img"],
    ProcessExternalResources: ["img"],
  },
});

// global 객체에 JSDOM으로 만든 가상의 DOM 속성들을 설정한다.
global.document = dom.window.document;
global.window = dom.window;
global.Image = dom.window.Image;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.HTMLImageElement = dom.window.HTMLImageElement;
global.HTMLVideoElement = dom.window.HTMLVideoElement;

// #1. Import data
const filePath = "in/data.csv";

const csvData = fs.readFileSync(filePath, "utf8");
const parsedData = d3.csvParse(csvData);

const inputData = parsedData;

// console.log(util.inspect(inputData, { depth: null }));

// #2. Data 가공
const hostName_index = new Map();
const processedData = []; // 가공된 데이터

inputData.forEach((data) => {
  const hostName = data["hostname"];
  if (!hostName_index.has(hostName)) {
    hostName_index.set(hostName, processedData.length);
    processedData.push({ hostName: hostName, data: [] });
  }

  const index = hostName_index.get(hostName);
  processedData[index].data.push(data);

  // console.log(hostName);
  // console.log(data);
});

// console.log(util.inspect(processedData, { depth: null }));

// #3. SVG로 그리기(함수 추가)
const generateBarSVG = (data) => {
  const svgWidth = 1920;
  const svgHeight = 1080;

  // svg element를 body에 추가
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // 흰색 배경을 그리기 위한 rect 요소를 추가합니다.
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("fill", "white"); // 흰색 배경

  // 레이블을 가로로는 왼쪽에 위치, 세로로는 중앙에 위치하도록 설정
  const hostName = "ryulurala";

  svg
    .append("text")
    .attr("x", 10) // x 좌표를 조정하여 가로 위치 설정
    .attr("y", svgHeight / 2) // y 좌표를 조정하여 세로 위치 설정 (가운데로 가려면 svgHeight/2)
    .attr("text-anchor", "start") // 가로로 왼쪽 정렬
    .attr("alignment-baseline", "middle") // 세로로 중앙 정렬
    .text(hostName)
    .attr("font-size", "20px") // 원하는 폰트 크기 설정
    .attr("fill", "black"); // 원하는 텍스트 색상 설정

  // 오른쪽에 밝은 회색 사각형을 그립니다.
  const rectWidth = svgWidth * 0.75; // 사각형의 가로 길이
  const rectHeight = svgHeight * 0.9; // 사각형의 세로 길이
  const rectX = 20 + hostName.length * 10; // Label 텍스트의 가로 위치 뒤에 20px 간격

  svg
    .append("rect")
    .attr("x", rectX)
    .attr("y", 10)
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("fill", "#f0f0f0"); // 밝은 회색

  return svg;
};

// #4. svg를 .png로 만들기(함수 추가)
const svgToPng = (svg) => {
  const svgString = XMLSerializer.serializeToString(svg.node());

  const width = svg.attr("width");
  const height = svg.attr("height");

  const pngData = svg2png.sync(svgString, { width: width, height: height });

  return pngData;
};

// #5. 실행
const testData = [
  { elapsedTime: 10, color: "blue" },
  { elapsedTime: 30, color: "red" },
];

const svgData = generateBarSVG(testData);
// const pngData = svgToPng(svgData);

// fs.writeFileSync("out/testData.png", pngData);

console.log("end main...");
