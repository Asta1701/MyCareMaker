angular.module('app.directives', [])
.directive('starRating', [function(){
  return {
      restrict: 'E',
      template: '<div ng-bind-html="stars">{{stars}}</div>',
      scope: {
        value: '@'
      },
      link: function (scope) {
            var html = '';
            var starCount = 0;
            if (scope.value !== -1) {
//                console.log("value (int): " + parseInt(scope.value) + "\nvalue: '" + scope.value + "'");
                for (var i=0; i<parseInt(scope.value); i++) {
                    html += '<i class="icon_rating ion-ios-star "></i>';
//                    console.log("link: " + i);
                    starCount++;
                }
//                console.log(scope.value - parseInt(scope.value));
                if (scope.value - parseInt(scope.value) > 0.01) {

//                    console.log("half star")
                    html += '<i class="icon_rating ion-ios-star-half "></i>';
                    starCount++;
                }

                for (var i=0; i<5-starCount; i++) {
                    html += '<i class="icon_rating ion-ios-star-outline "></i>';
                }

                scope.stars = html; 
            } else {
                scope.stars = 'N/A';
            }
            
      }
    };
}])
.directive('textSizeSlider', ['$document', function ($document) {
    return {
      restrict: 'E',
      template: '<div class="text-size-slider">\n\
<span class="small-letter" ng-style="{ fontSize: min + unit }">A</span>\n\
 <input class="Slider" type="range" min="{{ min }}" max="{{ max }}" ng-model="textSize" value="{{ value }}" /> \n\
<span class="big-letter" ng-style="{ fontSize: max + unit }">A</span></div>',
      scope: {
        min: '@',
        max: '@',
        unit: '@',
        value: '@'
      },
      link: function (scope, element, attr, controller) {
            scope.textSize = scope.value;
            sessionStorage.setItem("fontSize", JSON.stringify(scope.value));
//        
//        console.log(controller);
//        scope.$watch('textSize', function (size) {
//
//            console.log(size);
//            localStorage.setItem("fontSize", JSON.stringify(size));
//            setFontSizes(size);
//        });
      }
    };
  }]);


angular.module('mycaremakerAdd', [])
.directive('mycaremakerAdd', ['$timeout', function($timeout){
    return {
        restrict: 'E',
        templateUrl: 'templates/myCareMakerAdd.html',
        scope: {
            submitFn: '&',
            btnadd: '@',
            btncancel: '@',
            btnsubmit: '@',            
            inputs: '=',
            inputclass: '@',
            labelclass: '@',
            btnclass: '@'
        },
        link: function (scope) {
      
            scope.id = 'addButton';
            scope.goToAddForm = function(){
                scope.id = 'addForm';
                
                for (var i=0; i<scope.inputs.length; i++) {
                
                    if (scope.inputs[i].type === "select") {
    //                    scope.inputs[i].ngmodel = 1;
                        for (var j=0; j<scope.inputs[i].options.length; j++){

                            if (scope.inputs[i].options[j].selected) {
                                //Necessary to set to fix a undefined option being selected http://jsfiddle.net/MTfRD/3/
                                scope.inputs[i].ngmodel = scope.inputs[i].options[j].value;
                                console.log("set " +scope.inputs[i].options[j].value);
                            } else {
                                scope.inputs[i].options[j].selected = "";
                            }
                        }
                    }

                }

                
               

            };
            scope.goToAddButton = function(){
                scope.id = 'addButton';
            };

        }
    };
}]);
