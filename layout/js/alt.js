function wordCloud(urldata,sizew,sizeh,id){
  this.grouped;
  this.layout;
  this.background;
  this.vis;
  this.DOMelement;
  this.DOMid = id;
  this.urldata = urldata;
  this.sizew = sizew;
  this.sizeh = sizeh;
  this.words;
  this.ndx;
  this.ageDim;
  this.genderDim;
  this.maritalDim;
  this.tokenDim;
  this.filteredToken;
  this.educationDim;
  this.minAge;
  this.maxAge;
  this.words_total;

}

wordCloud.prototype.init = function(){
  var self = this;
  this.layout = d3.layout.cloud();
  //this.layout.size([screen.availWidth, screen.availHeight])

  this.layout.size([this.sizew, this.sizeh])
  this.layout.words(this.grouped.map(function(d) {
    if (d.value > 0) {
      return {
        text: d.key,
        size: 20 + d.value / 100
      };
    } else {
      return {}
    }
  }))
  this.layout.padding(1)
  this.layout.rotate(function() {
    return ~~(Math.random() * 2) * 90;
  })
  this.layout.font("Impact")
  this.layout.fontSize(function(d) {
    return d.size;
  })
  this.layout.on("end", function(words){
     self.draw(words);
  })
  //this.layout.start();
  this.DOMelement = d3.select(this.DOMid).append("svg");
  this.DOMelement
    .transition()
    .duration(1000)
    .attr("width", this.sizew)
    .attr("height", this.sizeh)

  this.background = this.DOMelement.append("g")
  var w = this.sizew / 2;
  this.vis = this.DOMelement.append("g")
  .attr("transform", "translate("+w+","+250+")");

}

wordCloud.prototype.update = function(){
  var scaler = d3.scale.linear().domain([0,this.grouped[0].value]).range([10,80])
  this.layout.stop()
  console.log("max size :",this.grouped[0].value);
  this.layout.words(this.grouped.map(function(d) {
    if (d.value > 0) {
      return {
        text: d.key,
        size: scaler(d.value)
      };
    } else {
      return {}
    }
  }))
  this.layout.start();
}

wordCloud.prototype.draw = function(words){
    var self = this;
    var text = this.vis
    .selectAll("text")
    .data(words);

    text.transition()
      .duration(1000)
      .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
      .style("font-size", function(d) { return d.size + "px"; });

    text.enter().append("text")
    .on("click", function(e){
      self.showWord(e);
    })
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

    var exitGroup = this.background.append("g")
      .attr("transform", this.vis.attr("transform"));
    var exitGroupNode = exitGroup.node();
    text.exit().each(function() {
      exitGroupNode.appendChild(this);
    });
    exitGroup.transition()
      .duration(1000)
      .style("opacity", 1e-6)
      .remove();

}

wordCloud.prototype.load = function(cb){
  var self = this;
  d3.csv(self.urldata, function(data) {
    self.ndx = crossfilter(data);
    self.apply_filters();
    return cb(self);
  });
}

wordCloud.prototype.apply_filters = function(){
  var self = this;

  self.ageDim = self.ndx.dimension(function(d) {
    return +d.age;
  });

  self.genderDim = self.ndx.dimension(function(d) {
    return d.gender;
  });

  self.maritalDim = self.ndx.dimension(function(d) {
    return d.marital_status;
  });

  self.educationDim = self.ndx.dimension(function(d) {
    return d.education;
  });

  self.tokenDim = self.ndx.dimension(function(d) {
    return d.token;
  });

  self.words_total = self.tokenDim.group().reduceSum(function(d) {
    return +d.values;
  });

  self.grouped = self.words_total.top(100)
}

wordCloud.prototype.hide = function () {
  this.sizew = 0;
  this.layout.stop()
  this.layout.size([this.sizew,this.sizeh])
  this.DOMelement
    .attr("width",this.sizew)
};

wordCloud.prototype.collapse = function () {
  this.sizew = (screen.availWidth / 2) - 10
  this.layout.stop();
  this.layout.size([(screen.availWidth)*0.75, this.sizew]);

  this.DOMelement
    .attr("width",this.sizew)

  this.vis.attr("transform","translate("+(this.sizew/2)+","+250+")");
  this.layout.start();
};

wordCloud.prototype.showWord = function(e){
  $("#displayed-word").text(e.text);
  $(".bottom-panel").toggleClass("visible");
  this.tokenToFilter=e.text;
  console.log(e);
  this.DrawCharts();
}

wordCloud.prototype.DrawCharts = function(){
  //console.log(tokenToFilter)
  var self = this;
  self.tokenDim.filter(null)
  self.tokenDim = self.ndx.dimension(function(d) {return d.token;});
  var m = self.tokenDim.groupAll().reduceSum(function(d) {return +d.values;}).value();
  // nombre de lignes filtrées TO DO: si n=0 ??
  self.filteredToken = self.tokenDim.filter(this.tokenToFilter);
  var n = self.filteredToken.top(Infinity).length;
  //var n = data.length

  self.educationDim.filter(null);
  self.educationDim  = self.ndx.dimension(function(d) {return d.education;});
  var education_total = self.educationDim.group().reduceSum(function(d) {return +d.values;});
  var education_freq = self.educationDim.group().reduceSum(function(d) {return +d.values/n;});

  self.genderDim.filter(null);
  self.genderDim  = self.ndx.dimension(function(d) {return d.gender;});
  var gender_total = self.genderDim.group().reduceSum(function(d) {return +d.values;});
  var gender_freq = self.genderDim.group().reduceSum(function(d) {return +d.values/n;});

  self.maritalDim.filter(null);
  self.maritalDim  = self.ndx.dimension(function(d) {return d.marital_status;});
  var marital_total = self.maritalDim.group().reduceSum(function(d) {return +d.values;});
  var marital_freq = self.maritalDim.group().reduceSum(function(d) {return +d.values/n;});

  self.ageDim.filter(null);
  self.ageDim  = self.ndx.dimension(function(d) {return +d.age;});
  var age_total = self.ageDim.group().reduceSum(function(d) {return +d.values;});
  var age_freq = self.ageDim.group().reduceSum(function(d) {return +d.values/n;});

  self.minAge = self.ageDim.bottom(1)[0].age;
  self.maxAge = self.ageDim.top(1)[0].age;

  // afficher un titre
  var fluctuationChart = dc.barChart('#fluctuation-chart');
  fluctuationChart
  .width(420).height(180)
  .gap(60)
  //.margins({top: 10, right: 50, bottom: 30, left: 40})
  .dimension(self.ageDim)
  .group(age_total)
  .x(d3.scale.linear().domain([self.minAge,self.maxAge]))
  .xUnits(function(){return 5;})
  .elasticY(true)
  .xAxis().tickFormat();

  // pie char of gender
  var genderRingChart = dc.pieChart("#chart-ring-gender");
  genderRingChart
  .width(100).height(100)
  .dimension(self.genderDim)
  .group(gender_total)
  .innerRadius(10);

  // bar chart of education
  var educationRowChart = dc.rowChart("#chart-row-education");
  educationRowChart
  .width(350).height(200)
  .dimension(self.educationDim)
  .group(education_freq)
  .elasticX(true);

  // pie chart of marital status
  var MaritalRingChart   = dc.pieChart("#chart-ring-status");
  MaritalRingChart
  .width(100).height(100)
  .dimension(self.maritalDim)
  .group(marital_freq)
  .innerRadius(10);

  dc.renderAll();
}

/*wordCloud.prototype.expand = function () {
  this.sizew = (screen.availWidth)

  this.
}*/

wordCloud.prototype.scale = function () {
  return d3.scale().linear().domain([0,this.grouped[0].value]).range([0,100])
};

wordCloud.prototype.swag = function(){
  this.sizew = (screen.availWidth / 2) - 10
  this.layout.stop();
  this.layout.size([screen.availWidth,screen.availHeight])

  this.DOMelement
    .attr("width",this.sizew)

  this.vis.attr("transform", "translate("+(this.sizew/2)+","+250+")");

  this.layout.start();
}

//Color scale for d3

var fill = d3.scale.linear(function(d){return d.size;}).domain([15, 35, 132]).range(["#43719e", "#2ecc71", "#93ffbc"]).interpolate(d3.interpolateHcl);

function enableComparison(){
  wc1.collapse();
  wc2.collapse();
}

function showWord(e) {
  $("#displayed-word").text(e.text)
  $(".bottom-panel").toggleClass("visible");
  tokenToFilter=e.text
  console.log(ageDim.bottom(1))
  DrawCharts(e.text)
}


var wc1 = new wordCloud('data/wordcount_v3.csv',screen.availWidth,600,'#wordcloud1');
var wc2 = new wordCloud('data/wordcount_v3.csv',600,600,'#wordcloud2');

wc1.load(function(wc){
  wc.init();
  setTimeout(function(){ wc.layout.start()},1000)
});

wc2.load(function(wc){
  wc.init();
  //setTimeout(function(){ wc.layout.start()},1000)
})



// Interaction
/*Selection Gender*/
$('#genderMale, #genderFemale').change(function(){
  var MaleChecked = ($('#genderMale:checked').val() == "Male")
  var FemaleChecked = ( $('#genderFemale:checked').val() =="Female")
  if ((MaleChecked && FemaleChecked )|| (!MaleChecked && !FemaleChecked)){
    wc1.genderDim.filter(null);
    wc1.update();
  }

  else if(MaleChecked){
    wc1.genderDim.filter(null);
    wc1.genderDim.filter("Male");
    wc1.update();
  }
  else  if(FemaleChecked){
    wc1.genderDim.filter(null);
    wc1.genderDim.filter("Female");
    wc1.update();
  }
});

$('#genderMale2, #genderFemale2').change(function(){
  var MaleChecked = ($('#genderMale2:checked').val() == "Male")
  var FemaleChecked = ( $('#genderFemale2:checked').val() =="Female")
  if ((MaleChecked && FemaleChecked )|| (!MaleChecked && !FemaleChecked)){
    wc2.genderDim.filter(null);
    wc2.update();
  }

  else if(MaleChecked){
    wc2.genderDim.filter(null);
    wc2.genderDim.filter("Male");
    wc2.update();
  }
  else  if(FemaleChecked){
    wc2.genderDim.filter(null);
    wc2.genderDim.filter("Female");
    wc2.update();
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

  wc1.maritalDim.filter(null);
  wc1.maritalDim.filter(function(d){
    return maritalStatus.indexOf(d) > -1;
  });
  wc1.update();
});

$('#maritalSingle2, #maritalMarried2, #maritalDivorced2, #maritalWidow2').change(function(){
  var maritalStatus =[];
  var SingleChecked=($('#maritalSingle2:checked').val() == "Single")
  var MarriedChecked=($('#maritalMarried2:checked').val() == "Married")
  var DivorcedChecked=($('#maritalDivorced2:checked').val() == "Divorced")
  var WidowedChecked=($('#maritalWidow2:checked').val() == "Widowed")

  if(SingleChecked){maritalStatus.push("Single");}
  if(MarriedChecked){maritalStatus.push("Married");}
  if(DivorcedChecked){maritalStatus.push("Divorced");}
  if(WidowedChecked){maritalStatus.push("Widowed");}
  if(maritalStatus.length ==0){maritalStatus = ["Single","Married","Divorced","Widowed"];}

  wc2.maritalDim.filter(null);
  wc2.maritalDim.filter(function(d){
    return maritalStatus.indexOf(d) > -1;
  });
  wc2.update();
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
  wc1.educationDim.filter(null);
  wc1.educationDim.filter(function(d){
    return educationStatus.indexOf(d) > -1;
  });
  wc1.update();
});

$('#educationLess2, #educationHigh2, #educationBC2, #educationPH2').change(function(){
  var educationStatus =[];
  var LessChecked=($('#educationLess2:checked').val() == "Less than High School")
  var HighChecked=($('#educationHigh2:checked').val() == "High School degree")
  var bcChecked=($('#educationBC2:checked').val() == "Associate/Bachelor Degree")
  var phChecked=($('#educationPH2:checked').val() == "MS/PhD")

  if(LessChecked){educationStatus.push("Less than High School");}
  if(HighChecked){educationStatus.push("High School degree");}
  if(bcChecked){educationStatus.push("Associate/Bachelor Degree");}
  if(phChecked){educationStatus.push("MS/PhD");}
  if(educationStatus.length ==0){educationStatus = ["Less than High School","High School degree","Associate/Bachelor Degree","MS/PhD"];}
  wc2.educationDim.filter(null);
  wc2.educationDim.filter(function(d){
    return educationStatus.indexOf(d) > -1;
  });
  wc2.update();
});

$('#AgeSlider').change(function(){
  var lower = parseInt($('#AgeSlider').val()[0]);
  var higher = parseInt($('#AgeSlider').val()[1]);
  wc1.ageDim.filter(null);
  wc1.ageDim.filter([lower,higher]);
  wc1.update();
});

$('#AgeSlider2').change(function(){
  var lower = parseInt($('#AgeSlider').val()[0]);
  var higher = parseInt($('#AgeSlider').val()[1]);
  wc2.ageDim.filter(null);
  wc2.ageDim.filter([lower,higher]);
  wc2.update();
});
