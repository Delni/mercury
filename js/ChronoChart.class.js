class ChronoChart {
  constructor(ctx, accounts) {
    this.colors = [
      {backgroundColor: 'rgba(50, 115, 221,0.2)', borderColor: '#3273dc'},
      {backgroundColor: 'rgba(50, 221, 72, 0.2)', borderColor: '#32dd61'},
      {backgroundColor: 'rgba(125, 50, 221, 0.2)', borderColor: '#5e32dd'},
      {backgroundColor: 'rgba(221, 188, 50, 0.2)', borderColor: '#d9dd32'}
    ];
    this.config = {
      type: 'line',
      data: null,
      options: {
        legend: {
          display: false
        },
        fill: 'bottom',
        scales: {
					xAxes: [{
						type: "time",
						time: {
              parser: 'DD/MM/YYYY',
							tooltipFormat: 'DD/MM/YYYY'
						},
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'value'
						}
					}],
        }
      }
    };
    this.ctx = ctx;
    this.config.data = { datasets: []};
    for (var i = 0; i < accounts.length; i++) {
      let colors = this.colorsPicker();
      let data= global.db.exec(`SELECT date, amount FROM ChronoBase WHERE account="${accounts[i].name}" AND date>="${moment().subtract(1,'months').format('YYYY-MM-DD')}" AND date<="${moment()/*.add(10,'days')*/.format('YYYY-MM-DD')}" GROUP BY date`)
      let newDataset = {
        label: this.currencyConverter(accounts[i].currency),
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
        data: []
      }
      for (var j = 0; j < data.length; j++) {
        newDataset.data.push(
          {
            x: moment(data[j].Date,'YYYY-MM-DD').format('DD/MM/YYYY'),
            y: data[j].amount.toFixed(2)
          })
      }
      let newforeDataset = {
        label: this.currencyConverter(accounts[i].currency),
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
        data: [],
        fill: false,
      }
      let foredata= global.db.exec(`SELECT date, amount FROM ChronoBase WHERE account="${accounts[i].name}" AND date>="${moment()/*.subtract(1,'months').format('YYYY-MM-DD')}" AND date<="${moment().add(10,'days')*/.format('YYYY-MM-DD')}" GROUP BY date`)
      for (var j = 0; j < foredata.length; j++) {
        newforeDataset.data.push(
          {
            x: moment(foredata[j].Date,'YYYY-MM-DD').format('DD/MM/YYYY'),
            y: foredata[j].amount.toFixed(2)
          })
      }
      this.config.data.datasets.push(newDataset);
      this.config.data.datasets.push(newforeDataset);
    }
    this.chart = new Chart(ctx, this.config);
    this.chart.render();
  }

  colorsPicker(){
    let tmp = this.colors.shift();
    this.colors.push(tmp);
    return tmp;
  }

  currencyConverter(cur){
    switch (cur) {
      case 'eur':
        return '€';
        break;
      case 'usd':
        return '$';
        break;
      case 'gbp':
        return '£';
        break;
      default:
        return cur;
    }
  }

  refresh(accounts){
    this.chart.data = { datasets: []};
    for (var i = 0; i < accounts.length; i++) {
      let colors = this.colorsPicker();
      let data= global.db.exec(`SELECT date, amount FROM ChronoBase WHERE account="${accounts[i].name}" GROUP BY date`)
      let newDataset = {
        label: this.currencyConverter(accounts[i].currency),
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
        data: []
      }
      for (var j = 0; j < data.length; j++) {
        newDataset.data.push(
          {
            x: moment(data[j].Date,'YYYY-MM-DD').format('DD/MM/YYYY'),
            y: data[j].amount.toFixed(2)
          })
      }
      this.chart.data.datasets.push(newDataset);
    }
    this.chart.update();
  }
}
