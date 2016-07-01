//shuf -n 100 2015_1o_trim_edit.csv > output_trim1_2015.csv


var loadDSV = function(file){

            var barChart1 = dc.barChart('#chart1');

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

            var UFDim = facts.dimension(function(d){
                  return d.UF;
            });
            var UFGroup = UFDim.group();

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

            var FaixaEtariaConsumidorDim = facts.dimension(function(d){
                  return d.FaixaEtariaConsumidor;
            });
            var FaixaEtariaConsumidorGroup = FaixaEtariaConsumidorDim.group();

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

            ///////////////////////////////////////////////////////////////

            var popByUFmap = d3.map();

            d3.csv("populacaoPorEstado.csv", function(data){
              data.forEach(function(d) {
                  popByUFmap.set( d.UF, +d.populacao.replace(".","") );
              });
            });

            
            var UFOrdenadosPorReclamacao = [];
            var UFNumeroDeReclamantes = UFGroup.top(Infinity);


            var UFNumeroDeReclamantesMap = d3.map();



            for(var i = 0; i < UFGroup.size(); i++){
              UFOrdenadosPorReclamacao.push(UFNumeroDeReclamantes[i].key);
              UFNumeroDeReclamantesMap.set(UFNumeroDeReclamantes[i].key, UFNumeroDeReclamantes[i].value)
            }

            ///////////////////////
            console.log(UFGroup);

            var popByUF_relative = d3.map();            



            //var sortedReclamacao = UFGroup.all().sort(function(a,b){return a.value < b.value});
            //var reclamacaoSortedUf = sortedReclamacao.map(function(d){return d.key});
            //console.log(UFGroup.all());


            barChart1 /* dc.barChart('#volume-month-chart', 'chartGroup') */
                .width(1000)
                .height(600)
                .margins({top: 10, right: 50, bottom: 20, left: 40})
                .dimension(UFDim)
                .group(UFGroup)
                .gap(5)
                .x(d3.scale.ordinal().domain(UFOrdenadosPorReclamacao))
                .xUnits(dc.units.ordinal)
                .renderHorizontalGridLines(true)
      

                dc.renderAll();

            ///////////////////////////////////////////////////////////////

      });

};


loadDSV("Teste1.csv");
//loadDSV("2015_1o_trim_edit.csv");
//loadDSV("2015_2o_trim_edit.csv");
console.log("foi")