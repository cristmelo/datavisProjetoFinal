//shuf -n 100 2015_1o_trim_edit.csv > output_trim1_2015.csv


// Relacionado aos mapas
var map = L.map('mapid').setView([-14.500,-52.9500], 4);

var UFsOnMap = d3.map();

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {    
                attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                maxZoom: 17,
                minZoom: 4
            }).addTo(map);

var mapMaxBounds = L.latLngBounds(L.latLng(5.09,-30.32), L.latLng(-32.54,-75.58));

map.setMaxBounds(mapMaxBounds);

map.on('drag', function() {
    map.panInsideBounds(mapMaxBounds, { animate: false, noMoveStart:true });
});

var geojson = L.geoJson(brasilData, {
                style: style,
                onEachFeature: onEachFeature   
    }).addTo(map);


//Funcoes usadas pelo mapa

    var estadosSelecionados = d3.map();

    function style(feature) {
         return {
                    weight: 2,
                    opacity: 0.5,
                    color: 'white',
                    dashArray: '4',
                    fillOpacity: 0.3,
                    fillColor: 'gray'
                };
    }


    function highlightFeature(e) {
        var layer = e.target;
        console.log(e.target)

        layer.setStyle({
                    weight: 4,
                    color: '#665',
                    dashArray: '',
                    fillOpacity: 0.8
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }

        //info.update(layer.feature);
    }

    function resetHighlight(e) {
        if(estadosSelecionados.get(e.target.feature.properties.L2) == undefined){
            geojson.resetStyle(e.target);
        }
        else{
            selectedFeature(e.target)
        }
        
        //info.update();
    }

    function onEachFeature(feature, layer) {
        layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: clickAction
                });
        UFsOnMap.set(layer.feature.properties.L2, layer);
    }


    function selectedFeature(layer) {
        layer.setStyle({
                    weight: 3,
                    color: '',
                    dashArray: '',
                    fillOpacity: 0.6
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }

        //info.update(layer.feature);
    }


    function clickAction(e){
        var layer = e.target
        console.log(layer.feature.properties.L2);
        if(estadosSelecionados.get(layer.feature.properties.L2) == undefined){       
            estadosSelecionados.set(layer.feature.properties.L2, layer);
            selectedFeature(layer);
        }
        else{
            estadosSelecionados.remove(layer.feature.properties.L2);
            highlightFeature(e);   
        }

        updateFilters();
    }

    function updateFilters(){
        barChart1.on("filtered", null);
        if(estadosSelecionados.empty()){
            barChart1.filter(null);
        }
        else{
            console.log([estadosSelecionados.keys()]);
            barChart1.replaceFilter([estadosSelecionados.keys()]);
        }
        barChart1.on("filtered", function(chart, filter){updateMap();});
        dc.redrawAll();
    }

    function selectRegion(regiao){
        var filters = barChart1.filters();
        var estadoAindaNaoEstaSelecionado = [];

        regiao.forEach(function(d){
            if(filters.indexOf(d) == -1){
                estadoAindaNaoEstaSelecionado.push(d);
            }
        });


        console.log(estadoAindaNaoEstaSelecionado);
        if(estadoAindaNaoEstaSelecionado.length == 0){
            console.log('ali')
            barChart1.replaceFilter([
                filters.filter(function(d){
                    return regiao.indexOf(d) == -1;
                })
            ]);
        }
        else{
            console.log('Aqui');
            barChart1.filter([estadoAindaNaoEstaSelecionado]);   
        }
    }





    function updateMap(){
        selecionadosKeys = estadosSelecionados.keys();
        var filters = barChart1.filters();

        if(selecionadosKeys.length == filters.length){
            //Nao precisa fazer nada
        }
        else if (selecionadosKeys.length > filters.length){
            selecionadosKeys.forEach(function(d){
                if(filters.indexOf(d) == -1){
                    geojson.resetStyle(estadosSelecionados.get(d));
                    estadosSelecionados.remove(d);
                }
            });
        }
        else{
            console.log(filters);
            filters.forEach(function(d){

                if(selecionadosKeys.indexOf(d) == -1){
                    var l = UFsOnMap.get(d);
                    estadosSelecionados.set(d, l);
                    selectedFeature(l);
                }
            });
        }
        
    }

///////////////////////////////////






var barChart1 = dc.barChart('#chart1'); /* Numero de reclamações registradas por 100 mil hab. */
var barChart2 = dc.barChart('#chart2'); /* Distribuição dos reclamantes por faixa etária */
//var barChart3 = dc.barChart('#chart3'); /* Empresas mais denunciadas */
var rowChart1 = dc.rowChart('#chart4'); /* Empresas mais denunciadas */
var rowChart2 = dc.rowChart('#chart5'); /* Grupos de problema mais denunciados */
var rowChart3 = dc.rowChart('#chart6'); /* Setores mais denunciados */
var barChart4 = dc.barChart('#monthChart'); /* Número de reclamações mensais */
var lineChart = dc.lineChart('#timeLineChart');
var pieChart1 = dc.pieChart('#pieChart'); 


var UFDim;
var UFGroupRelativo;
var UFOrdenadosPorReclamacao;

var popByUFmap = d3.map();
d3.csv("populacaoPorEstado.csv", function(data){
    data.forEach(function(d) {
        popByUFmap.set( d.UF, +d.populacao.replace(".","") );
    });
});


var dsv = d3.dsv(";","text/plain");

dsv("output_40000_2015.csv", function(data){
    var dtgFormat = d3.time.format("%Y-%m-%d %H:%M:%S"); // ex: 2013-08-17 19:52:50
    data.forEach(function(d){
            //d.AnoAtendimento = +d.AnoAtendimento;
            //d.TrimestreAtendimento = +d.TrimestreAtendimento;
            //d.MesAtendimento = +d.MesAtendimento;
            d.DataAtendimentoFormatado = dtgFormat.parse( d.DataAtendimento.substr(0,18) ); 
            d.CodigoRegiao = +d.CodigoRegiao;
            d.Regiao = d.Regiao;
            d.UF = d.UF;
            //d.CodigoTipoAtendimento = +d.CodigoTipoAtendimento;
            //d.CodigoAssunto = +d.CodigoAssunto;
            d.GrupoAssunto = d.GrupoAssunto;
            d.CodigoProblema = +d.CodigoProblema;
            d.DescricaoProblema = d.DescricaoProblema;
            d.GrupoProblema = d.GrupoProblema;
            d.SexoConsumidor = d.SexoConsumidor;
            d.FaixaEtariaConsumidor = d.FaixaEtariaConsumidor;
            d.TipoFornecedor = +d.TipoFornecedor;
            d.RazaoSocialSindec = d.RazaoSocialSindec;
            d.NomeFantasiaSindec = d.NomeFantasiaSindec;                 
    });


    var facts = crossfilter(data);          

    console.log(facts.all()); 




    /////////////////////////////////////////////////////////////////////////
    
    

    DataAtendimentoDim = facts.dimension(function(d){
        return d3.time.day(d.DataAtendimentoFormatado);
    });

    var DataAtendimentoGroup = DataAtendimentoDim.group();

    lineChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
        .renderArea(true)
        .height(200)
        .transitionDuration(1000)
        .dimension(DataAtendimentoDim)
        .group(DataAtendimentoGroup)
        .mouseZoomable(true)
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 11, 31)]))
        .round(d3.time.month.round)
        .xUnits(d3.time.days)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .brushOn(false)
        .title( function(d){
                  return d3.time.day(d.key) + ":\n Numero de Reclamações: " + d.value;
                }
        )
        .rangeChart(barChart4);

/*
    var MesAtendimentoDim = facts.dimension(function(d){
      if( d.MesAtendimento == "1" ){return "Jan";}
      else if( d.MesAtendimento == "2" ){return "Fev";}
      else if( d.MesAtendimento == "3" ){return "Mar";}
      else if( d.MesAtendimento == "4" ){return "Abr";}
      else if( d.MesAtendimento == "5" ){return "Mai";}
      else if( d.MesAtendimento == "6" ){return "Jun";}
      else if( d.MesAtendimento == "7" ){return "Jul";}
      else if( d.MesAtendimento == "8" ){return "Ago";}
      else if( d.MesAtendimento == "9" ){return "Set";}
      else if( d.MesAtendimento == "10" ){return "Out";}
      else if( d.MesAtendimento == "11" ){return "Nov";}
      else if( d.MesAtendimento == "12" ){return "Dec";}
    });
*/


    barChart4 
        //.width(600)
        .height(60)
        //.margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(DataAtendimentoDim)
        .group(DataAtendimentoGroup)
        .gap(1)
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 11, 31)]))
        .xUnits(d3.time.days)
        .centerBar(true)
        .round(d3.time.days.round)
        .brushOn(true)
        .alwaysUseRounding(true);

    barChart4.yAxis().ticks(0);

    var SexoConsumidorDim = facts.dimension(function(d){
      return d.SexoConsumidor;
    });

    var SexoConsumidorGroup = SexoConsumidorDim.group();

    pieChart1
        .height(180)
        .radius(70)
        .dimension(SexoConsumidorDim)
        .group(SexoConsumidorGroup);

    ////////////////////////////////////////////////////////////////////////////
            /* Numero de reclamações registradas por 100 mil hab. */

    UFDim = facts.dimension(function(d){ return d.UF; });
    

    UFGroupRelativo = UFDim.group().reduceSum(function(d){
                            return 1/(popByUFmap.get(d.UF)/100000);
                        });
    UFOrdenadosPorReclamacao = UFGroupRelativo.top(Infinity).map(function(d){return d.key})

    barChart1 /* dc.barChart('#volume-month-chart', 'chartGroup') */
        //.width(600)
        .height(250)
        //.margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(UFDim)
        .group(UFGroupRelativo)
        .gap(2)
        .x(d3.scale.ordinal().domain(UFOrdenadosPorReclamacao))
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .on("filtered", function(chart, filter){updateMap();});

    ////////////////////////////////////////////////////////////////////////////
      /* Distribuição dos reclamantes por faixa etária */

    var FaixaEtariaConsumidorDim = facts.dimension(function(d){
        if(d.FaixaEtariaConsumidor == "até 20 anos"){return "≤ 20"}
        else if(d.FaixaEtariaConsumidor == "entre 21 a 30 anos"){return "21 a 30";}
        else if(d.FaixaEtariaConsumidor == "entre 31 a 40 anos"){return "31 a 40";}
        else if(d.FaixaEtariaConsumidor == "entre 41 a 50 anos"){return "41 a 50";}
        else if(d.FaixaEtariaConsumidor == "entre 51 a 60 anos"){return "51 a 60";}
        else if(d.FaixaEtariaConsumidor == "entre 61 a 70 anos"){return "61 a 70";}
        else if(d.FaixaEtariaConsumidor == "mais de 70 anos"){return "70 ≥";}
        else {return "Não informado"}
    });

    var FaixaEtariaConsumidorGroup = FaixaEtariaConsumidorDim.group();

 

    barChart2 
        //.width(600)
        .height(250)
        .margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(FaixaEtariaConsumidorDim)
        .group(FaixaEtariaConsumidorGroup)
        .gap(2)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(["≤ 20", "21 a 30", "31 a 40", "41 a 50", "51 a 60", "61 a 70", "70 ≥", "Não informado"]))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true);


    ///////////////////////////////////////////////////////////////////////////////
      /* Empresas mais denunciadas */

      // GRÁFICO DE BARRAS

    var NomeFantasiaSindecDim = facts.dimension(function(d){
      if(d.NomeFantasiaSindec == "NULL" || d.NomeFantasiaSindec == "" ){
        return d.RazaoSocialSindec;
      }else{
        return d.NomeFantasiaSindec;
      }
    });
    var NomeFantasiaSindecGroup = NomeFantasiaSindecDim.group();
//    var NomeFantasiaSindecGroup = NomeFantasiaSindecDim.top(10).map(function(d){return d.key});
    var NomeFantasiaSindecSorted = NomeFantasiaSindecDim.group().top(10);
    var NomeFantasiaSindec_Axis = NomeFantasiaSindecSorted.map(function(d){return d.key})  


    /*barChart3 
        .width(600)
        .height(250)
        //.margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(NomeFantasiaSindecDim)
        .group(NomeFantasiaSindecGroup)
        .gap(3)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(NomeFantasiaSindec_Axis))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true);*/


    // GRÁFICO DE LINHAS

    function getTops(source_group) {
        return {
            all: function () {
                return source_group.top(10);
            }
        };
    }
    var NomeFantasiaGroupTop = getTops(NomeFantasiaSindecGroup);

    rowChart1  
        //.width(600)
        .height(250)
        //.margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(NomeFantasiaSindecDim)
        .group(NomeFantasiaGroupTop)
        .ordinalColors(['#276897'])
        .gap(3)
        .renderLabel(true)
        .title(function (d) { return d.value })
        .ordering(function(d) { return -d.value })

    ///////////////////////////////////////////////////////////////////////////////

    /* Grupos de problema mais denunciados */

    var GrupoProblemaDim = facts.dimension(function(d){
      return d.GrupoProblema;
    });

    var GrupoProblemaGroup = GrupoProblemaDim.group();

    function getTops(source_group) {
        return {
            all: function () {
                return source_group.top(10);
            }   
        };
    }
    var GrupoProblemaGroupTop = getTops(GrupoProblemaGroup);

    rowChart2  
        //.width(600)
        .height(250)
        //.margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(GrupoProblemaDim)
        .group(GrupoProblemaGroupTop)
        .ordinalColors(['#276897'])
        .gap(3)
        .renderLabel(true)
        .title(function (d) { return d.value })
        .ordering(function(d) { return -d.value })

    ///////////////////////////////////////////////////////////////////////////////

    /* Setores mais denunciados */


    var GrupoAssuntoDim = facts.dimension(function(d){
          return d.GrupoAssunto;
    });

    var GrupoAssuntoGroup = GrupoAssuntoDim.group();

    function getTops(source_group) {
        return {
            all: function () {
                return source_group.top(10);
            }
        };
    }
    var GrupoAssuntoGroupTop = getTops(GrupoAssuntoGroup);

    rowChart3  
        //.width(600)
        .height(250)
        //.margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(GrupoAssuntoDim)
        .group(GrupoAssuntoGroupTop)
        .ordinalColors(['#276897'])
        .gap(3)
        .renderLabel(true)
        .title(function (d) { return d.value })
        .ordering(function(d) { return -d.value })

    ///////////////////////////////////////////////////////////////////////////////
    /* Número de reclamações mensais */

    

    dc.renderAll();

});






/*


console.log(facts.all()); //all() retorna todos os registros brutos

// DIMENSIONS AND GROUPS

var AnoAtendimentoDim = facts.dimension(function(d){
      return d.AnoAtendimento;
});

var AnoAtendimentoGroup = AnoAtendimentoDim.group();

var TrimestreAtendimentoDim = facts.dimension(function(d){
      return d.TrimestreAtendimento;
});

var TrimestreAtendimentoGroup = TrimestreAtendimentoDim.group();



var HourDim = facts.dimension(function(d){
      return d3.time.hour( d.DataAtendimentoFormatado );
});

var HourGroup = HourDim.group();

var CodigoRegiaoDim = facts.dimension(function(d){
      return d.CodigoRegiao ;
});

var CodigoRegiaoGroup = CodigoRegiaoDim.group();

var RegiaoDim = facts.dimension(function(d){
      return d.Regiao;
});

var RegiaoGroup = RegiaoDim.group();

var CodigoTipoAtendimentoDim = facts.dimension(function(d){
      return d.CodigoTipoAtendimento;
});

var CodigoTipoAtendimentoGroup = CodigoTipoAtendimentoDim.group();

var CodigoAssuntoDim = facts.dimension(function(d){
      return d.CodigoAssunto;
});

var CodigoAssuntoGroup = CodigoAssuntoDim.group();

var GrupoAssuntoDim = facts.dimension(function(d){
      return d.GrupoAssunto;
});

var GrupoAssuntoGroup = GrupoAssuntoDim.group();



var TipoFornecedorDim = facts.dimension(function(d){
      return d.TipoFornecedor;
});

var TipoFornecedorGroup = TipoFornecedorDim.group();



//loadDSV("Teste1.csv");
//loadDSV("2015_1o_trim_edit.csv");
//loadDSV("2015_2o_trim_edit.csv");

*/
