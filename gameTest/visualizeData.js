// LOG_ID를 비교하기 위해 정의
const logComment_logId = {
  ON: "0_0",

  Tutorial: "1_0",
  "Get Homerun": "1_1",
  "Frog with Flowers": "1_2",

  "Enter Town": "2_0",
  "Across the River": "2_1",
  "Splash Combat": "2_2",
  "Cave Entrance": "2_3",
  "Secret Room": "2_3b",
  "Find Fruit": "2_4",

  "Out of the Cave": "3_0",
  "Town Cave": "3_1",
  "Bomb & Fruit": "3_2",
  "Get Key": "3_3",

  Boss: "4_0",

  Clear: "5_0",

  OFF: "6_0",

  f1: "7_0",
  f2: "7_0",

  Dead: "8_0",
};

const logId_logComment = {
  "0_0": "ON",

  "1_0": "Tutorial",
  "1_1": "Get Homerun",
  "1_2": "Frog with Flowers",

  "2_0": "Enter Town",
  "2_1": "Across the River",
  "2_2": "Splash Combat",
  "2_3": "Cave Entrance",
  "2_3b": "Secret Room",
  "2_4": "Find Fruit",

  "3_0": "Out of the Cave",
  "3_1": "Town Cave",
  "3_2": "Bomb & Fruit",
  "3_3": "Get Key",

  "4_0": "Boss",

  "5_0": "Clear",

  "6_0": "OFF",

  "7_0": "f1",
  "7_0": "f2",

  "8_0": "Dead",
};

const logId_colorPalette = {
  "1_0": "#F5495B", // Tutorial
  "1_1": "#D9415D", // Get homerun
  "1_2": "#B53656", // Frog with flowers

  "2_0": "#368ABF", // Enter town
  "2_1": "#3378B5", // Across the river
  "2_2": "#2F66A8", // Splash combat
  "2_3": "#284E8F", // Cave (Get bomber)
  "2_3b": "#284E8F", // Secret room
  "2_4": "#23447D", // Find fruit

  "3_0": "#34AD81", // Out of the cave
  "3_1": "#32a685", // Town cave
  "3_2": "#2B8F7B", // Bomb & Fruit
  "3_3": "#268075", // Get key

  "4_0": "#f2b544", // Boss

  "5_0": "white", // Clear
  "7_0": "black", // f1
  "8_0": "red", // Dead
};

const drawBarSegmentIdentifiers = [
  logComment_logId.ON, // PlayHistory 시작

  logComment_logId.Tutorial,
  logComment_logId["Get Homerun"],
  logComment_logId["Frog with Flowers"],
  logComment_logId["Enter Town"],
  logComment_logId["Across the River"],
  logComment_logId["Splash Combat"],
  logComment_logId["Cave Entrance"],
  logComment_logId["Secret Room"],
  logComment_logId["Find Fruit"],
  logComment_logId["Out of the Cave"],
  logComment_logId["Town Cave"],
  logComment_logId["Bomb & Fruit"],
  logComment_logId["Get Key"],
  logComment_logId.Boss,
  logComment_logId.Clear,

  logComment_logId.OFF, // PlayHistory 종료
];

// # Data 가공 함수
const processData = (dataArray) => {
  const hostName_index = new Map();
  const userDataArray = []; // 가공된 데이터

  dataArray.forEach((data) => {
    const hostName = data.hostName;

    if (!hostName_index.has(hostName)) {
      hostName_index.set(hostName, userDataArray.length);
      userDataArray.push({ hostName: hostName, dataArray: [] });
    }

    const index = hostName_index.get(hostName);

    userDataArray[index].dataArray.push(data);
  });

  // updateTime으로 오름차순 정렬.
  userDataArray.forEach((data) => {
    data.dataArray.sort((a, b) => a.updateTime - b.updateTime);
  });

  // 여러 번 플레이 가능하므로 회차 별로 정리(logComment가 ON ~ OFF를 1번의 시도)
  userDataArray.forEach((userData) => {
    const playHistories = [];
    let isOn = false;

    userData.dataArray.forEach((data) => {
      if (data.logID === logComment_logId.ON) {
        // ON
        if (!isOn) {
          // isOn이 중복해서 들어온 상태를 제외하기 위해
          isOn = true;

          playHistories.push([data]);
        } else {
          console.warn(
            `[LOG] Duplicated ${logComment_logId.ON} data: ${JSON.stringify(
              data
            )}`
          );

          // 새로운 data로 생각
          playHistories.push([data]);
        }
      } else if (data.logID === logComment_logId.OFF) {
        // OFF
        if (isOn) {
          isOn = false;

          playHistories[playHistories.length - 1].push(data);
        } else {
          console.warn(
            `[LOG] No ${logComment_logId.ON} data but ${
              logComment_logId.OFF
            } data: ${JSON.stringify(data)}`
          );
        }
      } else {
        // 나머지 Datas
        if (isOn) {
          // ON이 켜져야 데이터를 추가함.
          playHistories[playHistories.length - 1].push(data);
        } else {
          console.warn(
            `[LOG] No ${logComment_logId.ON} data ${
              logComment_logId.OFF
            } data: ${JSON.stringify(data)}`
          );
        }
      }
    });

    // 새롭게 속성과 데이터 추가
    userData.playHistories = playHistories;
  });

  return userDataArray;
};

const dynamicTextSize = (element, limitSize, defaultSize = 20) => {
  // 예외 처리
  if (limitSize === undefined) {
    console.warn(`[LOG] dynamicTextSize func error: check the limitSize`);

    return;
  } else if (limitSize.width === undefined && limitSize.height === undefined) {
    console.warn(`[LOG] dynamicTextSize func error: check the limitSize`);

    return;
  }

  if (limitSize.width !== undefined && limitSize.height !== undefined) {
    // 텍스트가 width, height을 넘어가면 동적으로 조절
    let currentFontSize = defaultSize;
    while (true) {
      const textWidth = element.node().getBBox().width;
      const textHeight = element.node().getBBox().height;

      if (textWidth <= limitSize.width && textHeight <= limitSize.height) break;

      currentFontSize -= 0.5;

      element.style("font-size", currentFontSize);
    }
  } else if (limitSize.width !== undefined) {
    // 텍스트가 width를 넘어가면 동적으로 조절
    let currentFontSize = defaultSize;
    while (true) {
      const textWidth = element.node().getBBox().width;

      if (textWidth <= limitSize.width) break;

      currentFontSize -= 0.5;

      element.style("font-size", currentFontSize);
    }
  } else if (limitSize.height !== undefined) {
    // 텍스트가 width를 넘어가면 동적으로 조절
    let currentFontSize = defaultSize;
    while (true) {
      const textWidth = element.node().getBBox().height;

      if (textWidth <= limitSize.height) break;

      currentFontSize -= 0.5;

      element.style("font-size", currentFontSize);
    }
  }
};

const drawHostNameText = (userData, element, transform, size) => {
  const gElement = element.append("g").attr("transform", transform);

  const DEFAULT_FONT_SIZE = 20; // 기본

  // Host-name 텍스트
  const hostNameText = gElement
    .append("text")
    .style("font-size", DEFAULT_FONT_SIZE)
    .attr("text-anchor", "end") // 텍스트 오른쪽 정렬
    .attr("dominant-baseline", "middle") // 기준선을 텍스트의 중간
    .text(` ${userData.hostName} - `);

  // 텍스트가 width를 넘어가면 동적으로 조절
  dynamicTextSize(hostNameText, { width: size.width }, DEFAULT_FONT_SIZE);
};

const drawPlayTimeText = (userData, element, transform, size) => {
  const gElement = element.append("g").attr("transform", transform);

  const DEFAULT_FONT_SIZE = 25;

  // play time text 그리기
  gElement
    .append("text")
    .attr("text-anchor", "middle") // 텍스트 오른쪽 정렬
    .attr("dominant-baseline", "text-before-edge") // 기준선을 텍스트의 상단
    .style("font-size", DEFAULT_FONT_SIZE)
    .text("Play Time(s)");
};

const drawLogCommentDesc = (userData, element, transform, size) => {
  const gElement = element.append("g").attr("transform", transform);

  const TITLE_WIDTH_RATIO = 0.7;

  const TITLE_POS_X_RATIO = 0.05; // 약간 0에서 띄우기
  const TITLE_POS_Y_RATIO = 0.025; // 약간 0에서 띄우기

  // Title
  const TITLE_TEXT_DEFAULT_FONT_SIZE = 20;

  const titleTextWidthMax = size.width * TITLE_WIDTH_RATIO;

  const titleTextPosX = size.width * TITLE_POS_X_RATIO;
  const titleTextPosY = size.height * TITLE_POS_Y_RATIO;

  const titleText = gElement
    .append("text")
    .attr("x", titleTextPosX)
    .attr("y", titleTextPosY)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "middle")
    .style("font-size", TITLE_TEXT_DEFAULT_FONT_SIZE)
    .text("Check Point");

  // 동적으로 텍스트 크기 결정
  dynamicTextSize(
    titleText,
    { width: titleTextWidthMax },
    TITLE_TEXT_DEFAULT_FONT_SIZE
  );

  // Color + logComment
  const LINE_SPACE = 5;
  const RECT_COMMENT_SPACE = 5;

  // 정사각형
  const colorBoxWidth = titleText.node().getBBox().width * 0.25;
  const colorBoxHeight = colorBoxWidth;

  const colorBoxPosX = titleTextPosX;
  let colorBoxPosY = titleTextPosY + colorBoxHeight;

  const commentPosX = colorBoxPosX + colorBoxWidth + RECT_COMMENT_SPACE;
  const commentWidthMax = size.width - commentPosX;
  const commentHeightMax = colorBoxHeight;

  drawBarSegmentIdentifiers.forEach((logId) => {
    const colorString = logId_colorPalette[logId];
    const logComment = logId_logComment[logId];

    if (colorString === undefined) return; // continue

    // color box 그리기
    gElement
      .append("rect")
      .attr("width", colorBoxWidth)
      .attr("height", colorBoxHeight)
      .attr("x", colorBoxPosX)
      .attr("y", colorBoxPosY)
      .attr("fill", colorString) // 흰색 배경
      .style("stroke", "black")
      .style("stroke-width", 1);

    // logComment text 그리기
    const logCommentText = gElement
      .append("text")
      .attr("x", commentPosX)
      .attr("y", colorBoxPosY)
      .attr("dominant-baseline", "text-before-edge")
      .style("font-size", 15)
      .text(logComment);

    dynamicTextSize(
      logCommentText,
      { width: commentWidthMax, height: commentHeightMax },
      TITLE_TEXT_DEFAULT_FONT_SIZE
    );

    colorBoxPosY += colorBoxHeight + LINE_SPACE;
  });
};

const drawBarWithLine = (playHistoryData, element, transform, size) => {
  const gElement = element.append("g").attr("transform", transform);

  // 제일 마지막 Data를 기준으로 크기를 정하기.(OFF Data가 없을 수도 있으므로)
  const lastElapsedSec = playHistoryData[playHistoryData.length - 1].elapsedSec;
  const elaspedWidthRatio = size.width / lastElapsedSec;

  const ELAPSED_SEC_TAG_LINE_LENGTH = 35;

  const elapsedSecLineDownStartPosY = size.height;
  const elapsedSecLineDownEndPosY = size.height + ELAPSED_SEC_TAG_LINE_LENGTH;

  const elapsedSecLineUpStartPosY = 0;
  const elapsedSecLineUpEndPosY = 0 - ELAPSED_SEC_TAG_LINE_LENGTH;

  let barSegmentColor = logId_colorPalette[logComment_logId.Tutorial];
  let barSegmentPosX = 0;
  let prevElapsedSec = 0;

  let isDownElapsedTimeTag = false; // elapsedTime은 up, down 번갈아 그리기 위해

  // # Bar Segment 그리기
  playHistoryData.forEach((data) => {
    const logID = data.logID;

    if (drawBarSegmentIdentifiers.includes(logID)) {
      if (logID !== drawBarSegmentIdentifiers[0]) {
        // 사각형을 next posX 까지 그리기 때문에 1부터 시작
        const barSegmentWidth =
          (data.elapsedSec - prevElapsedSec) * elaspedWidthRatio;

        // 막대 차트의 사각형 조각 그리기
        gElement
          .append("rect")
          .attr("x", barSegmentPosX)
          .attr("y", 0)
          .attr("width", barSegmentWidth)
          .attr("height", size.height)
          .attr("fill", barSegmentColor)
          .style("stroke", "black")
          .style("stroke-width", 1);

        // for. next
        barSegmentPosX += barSegmentWidth;
        prevElapsedSec = data.elapsedSec;
        barSegmentColor = logId_colorPalette[logID];
      }

      // elapsedTime 태그 걸기
      if (isDownElapsedTimeTag) {
        // 점선 그리기
        gElement
          .append("line")
          .attr("x1", barSegmentPosX) // 시작 x 좌표
          .attr("y1", elapsedSecLineDownStartPosY) // 시작 y 좌표
          .attr("x2", barSegmentPosX) // 끝 x 좌표
          .attr("y2", elapsedSecLineDownEndPosY) // 끝 y 좌표
          .attr("stroke", "black")
          .attr("stroke-dasharray", "2.5, 5") // 2.5픽셀 길이의 선, 5픽셀 간격의 공백
          .attr("stroke-width", 1); // 선 굵기

        // Elapsed Time Text
        gElement
          .append("text")
          .attr("x", barSegmentPosX)
          .attr("y", elapsedSecLineDownEndPosY)
          .attr("text-anchor", "middle") // 텍스트 가운데 정렬
          .attr("dominant-baseline", "text-before-edge") // 기준선을 텍스트의 상단으로 설정
          .text(data.elapsedSec);
      } else {
        // 점선 그리기
        gElement
          .append("line")
          .attr("x1", barSegmentPosX) // 시작 x 좌표
          .attr("y1", elapsedSecLineUpStartPosY) // 시작 y 좌표
          .attr("x2", barSegmentPosX) // 끝 x 좌표
          .attr("y2", elapsedSecLineUpEndPosY) // 끝 y 좌표
          .attr("stroke", "black")
          .attr("stroke-dasharray", "2.5, 5") // 2.5픽셀 길이의 선, 5픽셀 간격의 공백
          .attr("stroke-width", 1); // 선 굵기

        // Elapsed Time Text
        gElement
          .append("text")
          .attr("x", barSegmentPosX)
          .attr("y", elapsedSecLineUpEndPosY)
          .attr("text-anchor", "middle") // 텍스트 가운데 정렬
          .attr("dominant-baseline", "text-after-edge") // 기준선을 텍스트의 하단으로 설정
          .text(data.elapsedSec);
      }

      isDownElapsedTimeTag = !isDownElapsedTimeTag; // switching
    }
  });

  // Line 그리기
  const LINE_OFFSET = 10;

  const lineStartPosY = 0 - LINE_OFFSET;
  const lineEndPosY = size.height + LINE_OFFSET;

  // # line 그리기: 그리는 순서 지키기 위해 반복문을 또 실행
  playHistoryData.forEach((data) => {
    const logID = data.logID;
    const logComment = data.logComment;

    if (!drawBarSegmentIdentifiers.includes(logID)) {
      // Only. tagging: ex. Dead, f1, f2
      const linePosX = data.elapsedSec * elaspedWidthRatio;

      if (logID === logComment_logId.Dead) {
        // Line
        gElement
          .append("line")
          .attr("x1", linePosX) // 시작 x 좌표
          .attr("y1", lineStartPosY) // 시작 y 좌표
          .attr("x2", linePosX) // 끝 x 좌표
          .attr("y2", lineEndPosY) // 끝 y 좌표
          .attr("stroke", "red")
          .attr("stroke-width", 2); // 선 굵기

        // Text
        gElement
          .append("text")
          .attr("x", linePosX)
          .attr("y", lineEndPosY)
          .attr("fill", "red")
          .attr("text-anchor", "middle") // 텍스트 가운데 정렬
          .attr("dominant-baseline", "text-before-edge") // 기준선을 텍스트의 상단
          .text("Die");
      } else {
        // Line
        gElement
          .append("line")
          .attr("x1", linePosX) // 시작 x 좌표
          .attr("y1", lineStartPosY) // 시작 y 좌표
          .attr("x2", linePosX) // 끝 x 좌표
          .attr("y2", lineEndPosY) // 끝 y 좌표
          .attr("stroke", "black")
          .attr("stroke-dasharray", "5, 2.5") // 2.5픽셀 길이의 선, 5픽셀 간격의
          .attr("stroke-width", 2); // 선 굵기

        // Text
        gElement
          .append("text")
          .attr("x", linePosX)
          .attr("y", lineEndPosY)
          .attr("fill", "black")
          .attr("text-anchor", "middle") // 텍스트 가운데 정렬
          .attr("dominant-baseline", "text-before-edge") // 기준선을 텍스트의 상단
          .text(logComment);
      }
    }
  });
};

const drawPlayChart = (
  userData,
  element,
  transform,
  size,
  playHistoryIndex
) => {
  const gElement = element.append("g").attr("transform", transform);

  const playHistory = userData.playHistories[playHistoryIndex];

  // 차트 전체 배경
  gElement
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", size.width)
    .attr("height", size.height)
    .attr("fill", "white") // 흰색 배경
    .style("stroke", "gray")
    .style("stroke-width", 1);

  // 막대 차트 배경 범위(를 기준으로 모든 width, height 결정)
  const BAR_CHART_WIDTH_RATIO = 0.7;
  const BAR_CHART_HEIGHT_RATIO = 0.9;

  const BAR_CHART_POS_X_RATIO = 0.125;
  const BAR_CHART_POS_Y_RATIO = 0.01; // 약간 0에서 띄우기

  const barChartWidth = size.width * BAR_CHART_WIDTH_RATIO;
  const barChartHeight = size.height * BAR_CHART_HEIGHT_RATIO;

  const barChartPosX = size.width * BAR_CHART_POS_X_RATIO;
  const barChartPosY = size.height * BAR_CHART_POS_Y_RATIO;

  // Host-name Text
  const hostNamePosX = barChartPosX; // 오른쪽 정렬로 인해서
  const hostNamePosY = barChartPosY + barChartHeight * 0.5; // 막대 차트의 중앙 지점

  const suffixHostName = `(P${playHistoryIndex + 1})`;
  userData.hostName += suffixHostName;
  drawHostNameText(
    userData,
    gElement,
    `translate(${hostNamePosX}, ${hostNamePosY})`,
    { width: barChartPosX }
  );
  userData.hostName = userData.hostName.slice(
    0,
    userData.hostName.length - suffixHostName.length
  );

  // Play Time Text
  const playTimeTextPosX = barChartPosX + barChartWidth * 0.5;
  const playTimeTextPosY = barChartPosY + barChartHeight;

  drawPlayTimeText(
    userData,
    gElement,
    `translate(${playTimeTextPosX}, ${playTimeTextPosY})`
  );

  const logCommentDescWidth = size.width - (barChartPosX + barChartWidth);
  const logCommentDescHeight = barChartHeight;

  const logCommentDescPosX = barChartPosX + barChartWidth;
  const logCommentDescPosY = barChartPosY;

  drawLogCommentDesc(
    userData,
    gElement,
    `translate(${logCommentDescPosX}, ${logCommentDescPosY})`,
    { width: logCommentDescWidth, height: logCommentDescHeight }
  );

  // 막대 차트 배경 그리기
  gElement
    .append("rect")
    .attr("x", barChartPosX)
    .attr("y", barChartPosY)
    .attr("width", barChartWidth)
    .attr("height", barChartHeight)
    .attr("fill", "lightgray");

  // 막대 차트 범위
  const BAR_WIDTH_RATIO = 0.9;
  const BAR_HEIGHT_RATIO = 0.15;

  const BAR_POS_X_RATIO = 0.5 - BAR_WIDTH_RATIO * 0.5; // for. 가운데 위치하도록
  const BAR_POS_Y_RATIO = 0.5 - BAR_HEIGHT_RATIO * 0.5; // for. 가운데 위치하도록

  const barWidth = barChartWidth * BAR_WIDTH_RATIO;
  const barHeight = barChartHeight * BAR_HEIGHT_RATIO;

  const barPosX = barChartPosX + barChartWidth * BAR_POS_X_RATIO;
  const barPosY = barChartPosY + barChartHeight * BAR_POS_Y_RATIO;

  drawBarWithLine(playHistory, gElement, `translate(${barPosX}, ${barPosY})`, {
    width: barWidth,
    height: barHeight,
  });

  return userData.playHistories.length;
};

const drawChart = (
  userDataArray,
  svg,
  transform,
  size,
  hostName,
  playHistoryValue
) => {
  svg.selectAll(null).remove(); // 전에 있던 svg 모두 지우기

  if (hostName === "All") {
    // 모든 hostName과 이에 해당하는 Play History
    let playHistoryCount = 0;
    userDataArray.forEach((userData) => {
      playHistoryCount += userData.playHistories.length;
    });

    // svg의 width, height 설정(= 전체 차트의 범위 설정)
    const svgWidth = size.width;
    const svgHeight = size.height * playHistoryCount;

    svg.attr("width", svgWidth).attr("height", svgHeight);

    playHistoryCount = 0;
    userDataArray.forEach((userData, userDataIndex) => {
      userData.playHistories.forEach((playhistory, playhistoryIndex) => {
        const startChartPosY = playHistoryCount * size.height;
        playHistoryCount++;

        drawPlayChart(
          userData,
          svg,
          `translate(0, ${startChartPosY})`,
          size,
          playhistoryIndex // PlayHistoryIndex로 넘겨주기
        );
      });
    });
  } else if (playHistoryValue === "All") {
    // hostName에 해당하는 모든 Play History
    const foundUserData = userDataArray.find(
      (userData) => userData.hostName === hostName
    );

    if (foundUserData) {
      // svg의 width, height 설정(= 전체 차트의 범위 설정)
      const svgWidth = size.width;
      const svgHeight = size.height * foundUserData.playHistories.length;

      svg.attr("width", svgWidth).attr("height", svgHeight);

      foundUserData.playHistories.forEach((playhistory, index) => {
        const startChartPosY = index * size.height;

        drawPlayChart(
          foundUserData,
          svg,
          `translate(0, ${startChartPosY})`,
          size,
          index // PlayHistoryIndex로 넘겨주기
        );
      });
    }
  } else {
    // hostName에 해당하는 Play History 하나
    const foundUserData = userDataArray.find(
      (userData) => userData.hostName === hostName
    );

    if (foundUserData) {
      // svg의 width, height 설정(= 전체 차트의 범위 설정)
      const svgWidth = size.width;
      const svgHeight = size.height;

      svg.attr("width", svgWidth).attr("height", svgHeight);

      drawPlayChart(foundUserData, svg, transform, size, playHistoryValue - 1); // PlayHistoryIndex로 넘겨주기
    }
  }
};

// 속성, 타입 수정 함수
const initRowData = (rowData) => {
  // console.dir(rowData);

  return {
    createdTime: rowData.createdTime,
    hostName: rowData.hostname,
    logID: rowData.logID,
    logComment: rowData.logComment,
    updateTime: rowData["updateTime(s)"], // 오름차순 정렬: data가 순차적으로 안 들어올 수도 있으므로
    elapsedSec: rowData.elapsedSec,
    count: rowData.count,
    outlier: rowData.outlier,
    logType: rowData.logType,
    dev: rowData.dev,
  };
};

const draw = (userDataArray, body) => {
  const CHART_WIDTH = 1080;
  const CHART_HEIGHT = 720;

  const CHART_SIZE = { width: CHART_WIDTH, height: CHART_HEIGHT };

  // hostNameArray와 playHistoryCountArray는 같은 인덱스로 짝을 맞춤
  const hostNameOptions = ["All"];
  const hostName_playHistoryCount = new Map();
  hostName_playHistoryCount.set("All", 0);

  userDataArray.forEach((userData) => {
    const hostName = userData.hostName;
    const playHistoryCount = userData.playHistories.length;

    hostNameOptions.push(hostName);
    hostName_playHistoryCount.set(hostName, playHistoryCount);
  });

  // 콤보 박스 옵션 추가: body에 추가. svg는 캡쳐용
  const comboBoxGroup = body.append("div").append("g"); // div는 block 태그용
  const svg = body.append("svg");

  const hostNameBox = comboBoxGroup.append("select");
  hostNameBox
    .selectAll("option")
    .data(hostNameOptions)
    .enter()
    .append("option")
    .text((t) => t);

  // 스타일 지정
  hostNameBox
    .style("height", "30px")
    .style("width", "150px")
    .style("margin", "10px")
    .style("padding", "5px");

  const playHistoryCountBox = comboBoxGroup.append("select");
  playHistoryCountBox
    .style("height", "30px")
    .style("width", "50px")
    .style("margin", "10px")
    .style("padding", "5px")
    .style("display", "none"); // 처음에는 디폴트로 안 보이도록

  hostNameBox.on("change", (event) => {
    // 바뀌었을 때, 이벤트
    const selectedHostName = event.target.value;

    if (selectedHostName === "All") {
      playHistoryCountBox.style("display", "none");

      // 모든 hostName 그리기
      drawChart(userDataArray, svg, `translate(0, 0)`, CHART_SIZE, "All");
    } else {
      const playHistoryCount = hostName_playHistoryCount.get(selectedHostName);
      const playHistoriesOptions = ["All"];
      for (let i = 0; i < playHistoryCount; i++) {
        playHistoriesOptions.push(`${i + 1}`);
      }

      playHistoryCountBox.selectAll("option").remove(); // 전에 있던 옵션 제거
      playHistoryCountBox
        .property("value", "All") // hostName 바뀌었을 경우, value는 "All"부터
        .style("display", "inline")
        .selectAll("option")
        .data(playHistoriesOptions)
        .enter()
        .append("option")
        .text((t) => t);

      // 새로운 hostName으로 그리기
      drawChart(
        userDataArray,
        svg,
        `translate(0, 0)`,
        CHART_SIZE,
        selectedHostName,
        "All" // hostName이 바뀌었을 때는 All
      );
    }
  });

  playHistoryCountBox.on("change", (event) => {
    // 바뀌었을 때, 이벤트
    // 새로운 playHistoryValue 그리기
    const selectedHostName = hostNameBox.property("value");
    const selectedPlayHistoryValue = event.target.value;

    drawChart(
      userDataArray,
      svg,
      `translate(0, 0)`,
      CHART_SIZE,
      selectedHostName,
      selectedPlayHistoryValue
    );
  });

  // Draw Chart. Default.
  const selectedHostName = hostNameBox.property("value");
  const selectedPlayHistoryValue = playHistoryCountBox.property("value");

  drawChart(
    userDataArray,
    svg,
    `translate(0, 0)`,
    CHART_SIZE,
    selectedHostName,
    selectedPlayHistoryValue
  );

  return svg;
};

// Export
// - initRowData: Row type casting
// - processData: data 가공 잘 되었는지 확인
// - draw: draw chart depends on combo-box
export { initRowData, processData, draw };
