var ndx;
var tokenDim;
var filteredToken;
var genderDim;
var maritalDim;
var educationDim;
var ageDim;
var minAge;
var maxAge;
var words_total;
var grouped;

//Color scale for d3
//var fill = d3.scale.ordinal().range(["#1abc9c","#16a085","#2c3e50","#34495e","#7f8c8d","#2ecc71","#27ae60"])
var fill = d3.scale.linear(function(d){return d.size;}).domain([15, 35, 132]).range(["#43719e", "#2ecc71", "#93ffbc"]).interpolate(d3.interpolateHcl);
//var tokenToFilter = "get"; // Filter le mot
var tokenToFilter;

function showWord(e) {
  $("#displayed-word").text(e.text)
  $(".bottom-panel").toggleClass("visible");
  tokenToFilter=e.text
  console.log(ageDim.bottom(1))
  DrawCharts(e.text)

}

function draw(words) {
  if(d3.select('#wordcloud').selectAll("svg")[0].length>0){
    d3.select("#wordcloud").select("svg").remove();
  }

  d3.select("#wordcloud").append("svg")
    .attr("width", screen.availWidth)
    .attr("height", screen.availHeight)
    .append("g")
    .attr("transform", "translate(500,350)")
    .selectAll("text")
    .data(words)
    .enter().append("text")
    .on("click", showWord)
    .style("font-size", function(d) {
      return d.size + "px";
    })
    .style("font-family", "RobotoDraft")
    .style("fill", function(d, i) {
      return fill(i);
    })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function(d) {
      return d.text;
    });
}

function bigDraw(grouped){
  d3.layout.cloud().size([screen.availWidth, screen.availHeight])
  .words(grouped.map(function(d) {

    console.log(d.value);
    if (d.value > 0) {
      return {

        text: d.key,
        size: 20 + d.value / 100
      };
    } else {
      return {}
    }
  }))
  .padding(1)
  .rotate(function() {
    return ~~(Math.random() * 2) * 90;
  })
  .font("Impact")
  .fontSize(function(d) {
    return d.size;
  })
  .on("end", draw)
  .start();
}

function DrawCharts(tokenToFilter){
  console.log(tokenToFilter)
  tokenDim.filter(null)
  tokenDim = ndx.dimension(function(d) {return d.token;});
  var m = tokenDim.groupAll().reduceSum(function(d) {return +d.values;}).value();
  // nombre de lignes filtrées TO DO: si n=0 ??
  filteredToken = tokenDim.filter(tokenToFilter);
  var n = filteredToken.top(Infinity).length;
  //var n = data.length
  educationDim.filter(null);
  educationDim  = ndx.dimension(function(d) {return d.education;});
  var education_total = educationDim.group().reduceSum(function(d) {return +d.values;});
  var education_freq = educationDim.group().reduceSum(function(d) {return +d.values/n;});

  //        genderDim  = ndx.dimension(function(d) {return d.gender;}).filterAll();
  genderDim.filter(null);
  var gender_total = genderDim.group().reduceSum(function(d) {return +d.values;});
  var gender_freq = genderDim.group().reduceSum(function(d) {return +d.values/n;});

  maritalDim.filter(null);
  maritalDim  = ndx.dimension(function(d) {return d.marital_status;});
  var marital_total = maritalDim.group().reduceSum(function(d) {return +d.values;});
  var marital_freq = maritalDim.group().reduceSum(function(d) {return +d.values/n;});

  //vageDim  = ndx.dimension(function(d) {return +d.age;}).filterAll();
  ageDim.filter(null);
  var age_total = ageDim.group().reduceSum(function(d) {return +d.values;});
  var age_freq = ageDim.group().reduceSum(function(d) {return +d.values/n;});

  minAge = ageDim.bottom(1)[0].age;
  maxAge = ageDim.top(1)[0].age;

  // afficher un titre
  var fluctuationChart = dc.barChart('#fluctuation-chart');
  fluctuationChart
  .width(420).height(180)
  .gap(60)
  //.margins({top: 10, right: 50, bottom: 30, left: 40})
  .dimension(ageDim)
  .group(age_total)
  .x(d3.scale.linear().domain([minAge,maxAge]))
  .xUnits(function(){return 5;})
  .elasticY(true)
  .xAxis().tickFormat();

  // pie char of gender
  var genderRingChart = dc.pieChart("#chart-ring-gender");
  genderRingChart
  .width(100).height(100)
  .dimension(genderDim)
  .group(gender_total)
  .innerRadius(10);

  // bar chart of education
  var educationRowChart = dc.rowChart("#chart-row-education");
  educationRowChart
  .width(350).height(200)
  .dimension(educationDim)
  .group(education_freq)
  .elasticX(true);

  // pie chart of marital status
  var MaritalRingChart   = dc.pieChart("#chart-ring-status");
  MaritalRingChart
  .width(100).height(100)
  .dimension(maritalDim)
  .group(marital_freq)
  .innerRadius(10);

  dc.renderAll();

  //tokenDim.filter(null)
}

//Configuration of the cloud
d3.csv('data/wordcount_v2.csv', function(data) {
  ndx = crossfilter(data);

  ageDim = ndx.dimension(function(d) {
    return +d.age;
  });

  genderDim = ndx.dimension(function(d) {
    return d.gender;
  });

  maritalDim = ndx.dimension(function(d) {
    return d.marital_status;
  });

  educationDim = ndx.dimension(function(d) {
    return d.education;
  });

  tokenDim = ndx.dimension(function(d) {
    return d.token;
  });

  words_total = tokenDim.group().reduceSum(function(d) {
    return +d.values;
  });

  grouped = words_total.top(100)

  bigDraw(grouped);
});


// Interaction
/*Selection Gender*/
$('#genderMale, #genderFemale').change(function(){
  var MaleChecked = ($('#genderMale:checked').val() == "Male")
  var FemaleChecked = ( $('#genderFemale:checked').val() =="Female")
  if ((MaleChecked && FemaleChecked )|| (!MaleChecked && !FemaleChecked)){
    genderDim.filter(null);
    bigDraw(grouped);
  }

  else if(MaleChecked){
    genderDim.filter(null);
    genderDim.filter("Male");
    bigDraw(grouped);
  }
  else  if(FemaleChecked){
    genderDim.filter(null);
    genderDim.filter("Female");
    bigDraw(grouped);
  }
});

/*Selection MArital Status*/
$('#maritalSingle, #maritalMarried, #maritalDivorced, #maritalWidow').change(function(){
  var maritalStatus =[];
  var SingleChecked=($('#maritalSingle:checked').val() == "Single")
  var MarriedChecked=($('#maritalMarried:checked').val() == "Married")
  var DivorcedChecked=($('#maritalDivorced:checked').val() == "Divorced")
  var WidowedChecked=($('#maritalWidow:checked').val() == "Widowed")

  if(SingleChecked){maritalStatus.push("Single");}
  if(MarriedChecked){maritalStatus.push("Married");}
  if(DivorcedChecked){maritalStatus.push("Divorced");}
  if(WidowedChecked){maritalStatus.push("Widowed");}
  if(maritalStatus.length ==0){maritalStatus = ["Single","Married","Divorced","Widowed"];}
  //console.log(maritalStatus);
  maritalDim.filter(null);
  maritalDim.filter(function(d){
    return maritalStatus.indexOf(d) > -1;
  });
  bigDraw(grouped);
});

/*Selection Education Status*/
$('#educationLess, #educationHigh, #educationBC, #educationPH').change(function(){
  var educationStatus =[];
  var LessChecked=($('#educationLess:checked').val() == "Less than High School")
  var HighChecked=($('#educationHigh:checked').val() == "High School degree")
  var bcChecked=($('#educationBC:checked').val() == "Associate/Bachelor Degree")
  var phChecked=($('#educationPH:checked').val() == "MS/PhD")

  if(LessChecked){educationStatus.push("Less than High School");}
  if(HighChecked){educationStatus.push("High School degree");}
  if(bcChecked){educationStatus.push("Associate/Bachelor Degree");}
  if(phChecked){educationStatus.push("MS/PhD");}
  if(educationStatus.length ==0){educationStatus = ["Less than High School","High School degree","Associate/Bachelor Degree","MS/PhD"];}
  //console.log(educationStatus);
  educationDim.filter(null);
  educationDim.filter(function(d){
    return educationStatus.indexOf(d) > -1;
  });
  bigDraw(grouped);
});

$('#AgeSlider').change(function(){
  var lower = parseInt($('#AgeSlider').val()[0]);
  var higher = parseInt($('#AgeSlider').val()[1]);
  ageDim.filter(null);
  ageDim.filter([lower,higher]);
  bigDraw(grouped);
});
