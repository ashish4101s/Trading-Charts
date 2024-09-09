const getData = async (filePath) => {
    try {
      const res = await fetch(filePath);
      const resp = await res.text();
      const rows = resp.split('\n').filter(row => row.trim().length > 0).slice(1); // Filter out empty rows and skip header
  
      const cdata = rows.map((row, index) => {
        row = row.trim();
        const columns = row.split(',');
  
        const [open, high, low, close, volume] = columns.slice(2);
        const datetime = columns[1];
        // Check if the row has all the expected columns
        if (!datetime || !open || !high || !low || !close || !volume) {
          console.error(`Row ${index} in ${filePath} is malformed: ${row}`);
          return null;
        }
  
        const datePart = datetime.slice(0, 8).trim();
        const timePart = datetime.slice(9).trim();
  
        const year = parseInt(datePart.slice(0, 4), 10);
        const month = parseInt(datePart.slice(4, 6), 10) - 1; // Month should be zero-indexed
        const day = parseInt(datePart.slice(6, 8), 10);
        const [hour, minute, second] = timePart.split(':').map(Number);
  
        const date = new Date(year, month, day, hour, minute, second);
  
        if (isNaN(date.getTime())) {
          console.error(`Invalid date format in row ${index} of ${filePath}: ${datetime}`);
          return null;
        }
  
        return {
          time: Math.floor(date.getTime() / 1000) + 19800,
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
          volume: parseInt(volume, 10)
        };
      }).filter(row => row !== null);
  
      console.log('Data from file:', filePath, cdata); // Log data from file
      return cdata;
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      return [];
    }
  };
  
  const calculateSMA = (data, period) => {
    let sma = [];
    for (let i = 0; i < data.length; i++) {
      if (i >= period - 1) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += data[i - j].close;
        }
        sma.push({
          time: data[i].time,
          value: sum / period
        });
      }
    }
    return sma;
  };
  
  const displayChart = async (elementId, titleId, filePath) => {
    const chartProperties = {
        width: 350,
        height: 150,
        layout: {
          backgroundColor:  'rgb(0, 255, 157)', // Chart background color
          textColor: '#301904' // Text color
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    };
  
    const domElement = document.getElementById(elementId);
    const titleElement = document.getElementById(titleId);
    const fileName = filePath.split('/').pop().split('.')[0];
    // titleElement.innerText = fileName;
  
    const chart = LightweightCharts.createChart(domElement, chartProperties);
    const klinedata = await getData(filePath);
    const candleseries = chart.addCandlestickSeries();
    console.log('Kline Data:', klinedata); // Log Kline data
    candleseries.setData(klinedata);

    const firstTime = klinedata[1].time;
    const lastTime = klinedata[2].time;
    const timeDifference = (lastTime - firstTime)/60;

    titleElement.innerText = `${fileName} - Time: ${timeDifference} min`;
  
    const smaShort = calculateSMA(klinedata, 5); // Short-term SMA
    const smaLong = calculateSMA(klinedata, 20); // Long-term SMA
  
    const smaShortSeries = chart.addLineSeries({ color: 'blue', lineWidth: 1.5 });
    smaShortSeries.setData(smaShort);
  
    const smaLongSeries = chart.addLineSeries({ color: 'orange', lineWidth: 1.5 });
    smaLongSeries.setData(smaLong);

    domElement.addEventListener('click', () => {
        const fullscreenTitle = document.createElement('div');
        fullscreenTitle.classList.add('fullscreen-title');
        fullscreenTitle.innerText = `${fileName} - Time: ${timeDifference} min`;
        if (domElement.classList.contains('fullscreen')) {
          domElement.classList.remove('fullscreen');
          document.body.removeChild(document.querySelector('.fullscreen-title'));
        } else {
          domElement.classList.add('fullscreen');
          document.body.appendChild(fullscreenTitle);
        }
        chart.resize(domElement.clientWidth, domElement.clientHeight);
      });
  };
  
  
  displayChart('tvchart1', 'title1', 'dummy data/ABB.csv');
  displayChart('tvchart2', 'title2', 'dummy data/AARTIIND.csv');
  displayChart('tvchart3', 'title3', 'dummy data/CUB.csv');
  displayChart('tvchart4', 'title4', 'dummy data/BEL.csv');
  displayChart('tvchart5', 'title5', 'dummy data/BAJAJ-AUT.csv');
  displayChart('tvchart6', 'title6', 'dummy data/BHARATFOR.csv');
  displayChart('tvchart7', 'title7', 'dummy data/BHEL.csv');
  displayChart('tvchart8', 'title8', 'dummy data/DIXON.csv');
  displayChart('tvchart9', 'title9', 'dummy data/DLF.csv');
  displayChart('tvchart10', 'title10', 'dummy data/EXIDEIND.csv');
  displayChart('tvchart11', 'title11', 'dummy data/ESCORTS.csv');
  displayChart('tvchart12', 'title12', 'dummy data/COFORGE.csv');
  