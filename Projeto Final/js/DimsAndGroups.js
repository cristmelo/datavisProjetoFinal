//shuf -n 100 2015_1o_trim_edit.csv > output_trim1_2015.csv


// Relacionado aos mapas
var map = L.map('mapid').setView([-11.6500,-52.9500], 4);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                maxZoom: 17
            }).addTo(map);



var geojson = L.geoJson(brasilData, {
//            style: style,
//            onEachFeature: onEachFeature
    }).addTo(map); 



var barChart1 = dc.barChart('#chart1'); /* Numero de reclamações registradas por 100 mil hab. */
var barChart2 = dc.barChart('#chart2'); /* Distribuição dos reclamantes por faixa etária */
//var barChart3 = dc.barChart('#chart3'); /* Empresas mais denunciadas */
var rowChart1 = dc.rowChart('#chart4'); /* Empresas mais denunciadas */
var rowChart2 = dc.rowChart('#chart5'); /* Grupos de problema mais denunciados */
var rowChart3 = dc.rowChart('#chart6'); /* Setores mais denunciados */
var barChart4 = dc.barChart('#chart7'); /* Número de reclamações mensais */


var popByUFmap = d3.map();
d3.csv("populacaoPorEstado.csv", function(data){
    data.forEach(function(d) {
        popByUFmap.set( d.UF, +d.populacao.replace(".","") );
    });
});


var dsv = d3.dsv(";","text/plain");

dsv("Teste1.csv", function(data){
    var dtgFormat = d3.time.format("%Y-%m-%d %H:%M:%S"); // ex: 2013-08-17 19:52:50
    data.forEach(function(d){
            d.AnoAtendimento = +d.AnoAtendimento;
            d.TrimestreAtendimento = +d.TrimestreAtendimento;
            d.MesAtendimento = +d.MesAtendimento;
            d.DataAtendimentoFormatado = dtgFormat.parse( d.DataAtendimento.substr(0,18) ); 
            d.CodigoRegiao = +d.CodigoRegiao;
            d.Regiao = d.Regiao;
            d.UF = d.UF;
            d.CodigoTipoAtendimento = +d.CodigoTipoAtendimento;
            d.CodigoAssunto = +d.CodigoAssunto;
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


    ////////////////////////////////////////////////////////////////////////////
        /* Numero de reclamações registradas por 100 mil hab. */

    var UFDim = facts.dimension(function(d){ return d.UF; });

    var UFGroupRelativo = UFDim.group().reduceSum(function(d){
                            return 1/(popByUFmap.get(d.UF)/100000);
                        });
    var UFOrdenadosPorReclamacao = UFGroupRelativo.top(Infinity).map(function(d){return d.key})

    barChart1 /* dc.barChart('#volume-month-chart', 'chartGroup') */
        .width(600)
        .height(250)
        //.margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(UFDim)
        .group(UFGroupRelativo)
        .gap(2)
        .x(d3.scale.ordinal().domain(UFOrdenadosPorReclamacao))
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .renderHorizontalGridLines(true);

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

    var SexoConsumidorDim = facts.dimension(function(d){
      return d.SexoConsumidor;
    });

    var SexoConsumidorGroup = SexoConsumidorDim.group();

    barChart2 
        .width(600)
        .height(250)
        //.margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(FaixaEtariaConsumidorDim)
        .group(FaixaEtariaConsumidorGroup)
        .gap(3)
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
        .width(600)
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
        .width(600)
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
        .width(600)
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

    var MesAtendimentoGroup = MesAtendimentoDim.group();

    barChart4 /* dc.barChart('#volume-month-chart', 'chartGroup') */
        .width(600)
        .height(250)
        //.margins({top: 10, right: 50, bottom: 20, left: 50})
        .dimension(MesAtendimentoDim)
        .group(MesAtendimentoGroup)
        .gap(2)
        .x(d3.scale.ordinal().domain(MesAtendimentoGroup))
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .renderHorizontalGridLines(true);


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
