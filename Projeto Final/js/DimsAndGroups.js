//shuf -n 100 2015_1o_trim_edit.csv > output_trim1_2015.csv


var loadDSV = function(file){

                var barChart1 = dc.barChart('#chart1');

                var barChart2 = dc.barChart('#chart2');


                var popByUFmap = d3.map();

                d3.csv("populacaoPorEstado.csv", function(data){
                  data.forEach(function(d) {
                      popByUFmap.set( d.UF, +d.populacao.replace(".","") );
                  });
                });



        		var dsv = d3.dsv(";","text/plain");
        		dsv(file, function(data){

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

            //criando um crossfilter
            var facts = crossfilter(data);

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

            var MesAtendimentoDim = facts.dimension(function(d){
                  return d.MesAtendimento;
            });
            var MesAtendimentoGroup = MesAtendimentoDim.group();

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

            var CodigoProblemaDim = facts.dimension(function(d){
                  return d.CodigoProblema;
            });
            var CodigoProblemaGroup = CodigoProblemaDim.group();

            var GrupoProblemaDim = facts.dimension(function(d){
                  return d.GrupoProblema;
            });
            var GrupoProblemaGroup = GrupoProblemaDim.group();

            var SexoConsumidorDim = facts.dimension(function(d){
                  return d.SexoConsumidor;
            });
            var SexoConsumidorGroup = SexoConsumidorDim.group();

            

            var TipoFornecedorDim = facts.dimension(function(d){
                  return d.TipoFornecedor;
            });
            var TipoFornecedorGroup = TipoFornecedorDim.group();

            var RazaoSocialSindecDim = facts.dimension(function(d){
                  return d.RazaoSocialSindec; 
            });
            var RazaoSocialSindecGroup = RazaoSocialSindecDim.group();

            var NomeFantasiaSindecDim = facts.dimension(function(d){
                  return d.NomeFantasiaSindec; 
            });
            var NomeFantasiaSindecGroup = NomeFantasiaSindecDim.group();


            ////////////////////////////////////////////////
            
            var UFDim = facts.dimension(function(d){
                  return d.UF;
            });
            var UFGroup = UFDim.group();

            var UFGroupRelativo = UFDim.group()
                                .reduceSum(function(d){
                                    return 1/(popByUFmap.get(d.UF)/100000);
                                });
            
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

            console.log(FaixaEtariaConsumidorGroup.all());


            //////////////////////////////////////////////////////////////////////////

            var UFOrdenadosPorReclamacao = UFGroupRelativo.top(Infinity).map(function(d){return d.key})
            
            ////////////////////////////////////////////////////////////////////////////


            //Grafico de barras Qtd relativa de reclamaçoes por estado.
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



            dc.renderAll();

      });

};


loadDSV("Teste1.csv");
//loadDSV("2015_1o_trim_edit.csv");
//loadDSV("2015_2o_trim_edit.csv");
console.log("foi")