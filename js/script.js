$.ajax({
    url: "http://coincap.io/global",
    type: "GET",
    dataType: "json",
    success: function (data) {
        var format1 = data.btcCap.toLocaleString("en").split('.')[0];
        var format2 = data.btcPrice.toLocaleString("en").split('.')[0];
        var format3 = data.totalCap.toLocaleString("en").split('.')[0];
        var format4 = data.altCap.toLocaleString("en").split('.')[0];
        var html = "";
        html += '<div><span class="bold">Total Market Cap:</span> $' + format3 + ' <span class="bold">Bitcoin Price:</span> $' + format2 + '' + ' <span class="bold">Bitcoin Cap:</span> $' + format1 + ' <span class="bold">Alt Cap:</span> $' + format4 + '</div>' ;
        $(".body_centered_outer").append(html);
    }
});
$.ajax({
    url: "http://coincap.io/front",
    type: "GET",
    dataType: "json",
    success: function (data) {
        var items = [];
        var len = data.length;
        for (var i = 0; i < len; i++) {
            var numFormat = data[i].price.toFixed(Math.max(2, (data[i].price.toString().split('.')[1] || []).length));
            var numFormat1 = data[i].mktcap.toLocaleString("en").split('.')[0];
            var numFormat2 = data[i].supply.toLocaleString("en");
            var lowerCaseName = data[i].long.toLowerCase();
            var dayChange = data[i].cap24hrChange.toLocaleString("en");
            if(dayChange.indexOf('-') > -1){
                items.push("<tr><td>" + [i+1] + "</td><td> <a href='#' onclick='showGraph(this);' data-short='"+data[i].short+"'><span class='sprite sprite-" + lowerCaseName + " small_coin_logo'></span>" + data[i].long + " - " + data[i].short + "</a></td><td><a class='red' href='#' onclick='showGraph(this);' style='text-decoration: none;' data-short='"+data[i].short+"'> $" + numFormat + "</a></td><td><a href='#' onclick='showGraph(this);' style='color:#777;text-decoration: none;' data-short='"+data[i].short+"'> $" + numFormat1 + "</a></td><td><a href='#' onclick='showGraph(this);' style='color:#777;text-decoration: none;' data-short='"+data[i].short+"'>" + numFormat2 + "</a></td><td><a class='red' href='#' onclick='showGraph(this);' style='text-decoration: none;' data-short='"+data[i].short+"'>" + data[i].cap24hrChange.toFixed(2) + "% </a></td></tr>");
            } else {
                items.push("<tr><td>" + [i+1] + "</td><td> <a href='#' onclick='showGraph(this);' data-short='"+data[i].short+"'><span class='sprite sprite-" + lowerCaseName + " small_coin_logo'></span>" + data[i].long + " - " + data[i].short + "</a></td><td><a class='green' href='#' onclick='showGraph(this); ' style='text-decoration: none;' data-short='"+data[i].short+"'> $" + numFormat + "</a></td><td><a href='#' onclick='showGraph(this);' style='color:#777;text-decoration: none;' data-short='"+data[i].short+"'> $" + numFormat1 + "</a></td><td><a href='#' onclick='showGraph(this);' style='color:#777;text-decoration: none;' data-short='"+data[i].short+"'>" + numFormat2 + "</a></td><td><a class='green' href='#' onclick='showGraph(this);' style='text-decoration: none;' data-short='"+data[i].short+"'>" + data[i].cap24hrChange.toFixed(2) + "% </a></td></tr>");
            }
        }
        $("<tbody/>", {
            "class": "mainTable",
            html: items.join("")
        }).insertAfter("#tableHeader");
    },
    complete: function() {
        $("#loading").addClass("hide");
        $('#dataTable').DataTable({
            fixedHeader: true,
            "lengthMenu": [ 20, 50, 100 ],
            "pageLength": 50,
            "order": [[ 3, "desc" ]],
            language: { search: ""}
        });
        $('#dataTable_filter input[type="search"]').attr('placeholder', 'Search for coins');
        $('#dataTable_filter input[type="search"]').css("padding-left","9px");
    }
});

var showGraph = function(element) {
    var shortName = $(element).data('short');
    var basicLineptions = {
        chart: {
            renderTo: 'graphData',
            type: 'line',
            marginRight: 130,
            marginBottom: 55
        },
        title: {
            text: '30 Day History',
            x: -20
        },
        subtitle: {
            text: '',
            x: -20
        },
        yAxis: {
            title: {
                text: 'Value'
            },
            labels: {
                formatter: function () {
                    var newVal = Highcharts.numberFormat(this.value, 0, '.', ',');
                    return "$" + newVal;
                }
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        colors: ['#0000FF', '#0fec5a', '#ffa500'],
        xAxis: {
            type: 'datetime',
            labels: {
                formatter: function() {
                    return Highcharts.dateFormat('%a %d %b', this.value);
                }
            },
            dataLabels: {
                enabled: true,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                style: {
                    textShadow: '0 0 3px black',
                    fontSize: '18px'
                },
                formatter: function() {
                    // numberFormat takes your label's value and the decimal places to show
                    return Highcharts.numberFormat(this.y, 2) + '%';
                }
            }
        },
        tooltip: {
            valuePrefix: '$'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -10,
            y: 100,
            borderWidth: 0
        },
        series: [],
        exporting: {
            enabled: false
        }
    };
    $.ajax({
        url : 'http://coincap.io/history/30day/' + shortName,
        datatype : 'json',
        success : function (data) {
            $.each(data, function(key, value) {
                var series = {};
                series.name = key;
                series.data = value;
                basicLineptions.series.push(series);
            });
            var chart = new Highcharts.Chart(basicLineptions);
            $("#graphContainer").removeClass("hide");
            $("#cryptoName").html(shortName);
        }
    });
};

var changeGraph = function(string) {
    var cryptoName2 = $("#cryptoName").text();
    var daysOut = "";
    if(string == "7day"){
        daysOut = "7 Day History";
    } else if(string == "365day"){
        daysOut = "1 Year History";
    } else {
        daysOut = "30 Day History";
    }
    var basicLineptions = {
        chart: {
            renderTo: 'graphData',
            type: 'line',
            marginRight: 130,
            marginBottom: 55
        },
        title: {
            text: daysOut,
            x: -20
        },
        subtitle: {
            text: '',
            x: -20
        },
        yAxis: {
            title: {
                text: 'Value'
            },
            labels: {
                formatter: function () {
                    var newVal = Highcharts.numberFormat(this.value, 0, '.', ',');
                    return "$" + newVal;
                }
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        colors: ['#0000FF', '#0fec5a', '#ffa500'],
        xAxis: {
            type: 'datetime',
            labels: {
                formatter: function() {
                    return Highcharts.dateFormat('%a %d %b', this.value);
                }
            },
            dataLabels: {
                enabled: true,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                style: {
                    textShadow: '0 0 3px black',
                    fontSize: '18px'
                },
                formatter: function() {
                    // numberFormat takes your label's value and the decimal places to show
                    return Highcharts.numberFormat(this.y, 2) + '%';
                }
            }
        },
        tooltip: {
            valuePrefix: '$'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -10,
            y: 100,
            borderWidth: 0
        },
        series: [],
        exporting: {
            enabled: false
        }
    };
    $.ajax({
        url : 'http://coincap.io/history/' + string + '/' + cryptoName2,
        datatype : 'json',
        success : function (data) {
            $.each(data, function(key, value) {
                var series = {};
                series.name = key;
                series.data = value;
                basicLineptions.series.push(series);
            });
            var chart = new Highcharts.Chart(basicLineptions);
        }
    });
};