(function(){
    let app = angular.module("AspectJML", []);
    app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.withCredentials = true;
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
        $httpProvider.defaults.headers.common["Accept"] = "application/json";
        $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
    }])

    .directive('onKeyup', function() {
        return function(scope, elm, attrs) {
          var allowedKeys = scope.$eval(attrs.keys);
          elm.bind('keydown', function(evt) {
            angular.forEach(allowedKeys, function(key) {
              if (key == evt.which) {
                 evt.preventDefault(); // Doesn't work at all
                 window.stop(); // Works in all browsers but IE
                 document.execCommand("Stop"); // Works in IE
                 return false; // Don't even know why it's here. Does nothing.
              }
            });
          });
        };
    })

    .controller("FormCtrl", function($scope, $http) {
        $scope.renTab = null;
        $scope.curTab = 'main';
        $scope.tabs = [];
        $scope.tabCount = 1;
        $scope.buffers = {};
        openBuffer('main');

        $scope.compile = function() {
            console.log("vamo compilar esse caraiii!");
            let code = editor.getValue();
            let request_data = {
                "java": {
                    "class_name": "Main",
                    "source_code": code
                }
            }
            $http.post("http://localhost:3000/compile", request_data)
                 .success(function(data, status) {
                     document.getElementById("console_output").value = data.completed ? data.output : data.errors
                     if (data.completed) {
                        applySuccess();
                     } else {
                         applyError();
                     }
                     console.log(data);
                 }).error(function (data, status, header, config) {
                     console.log("DEU ERRRORRR")
                     applyError();
                });
        }
      $scope.addTab = function() {
        var newTab = "Tab " + ($scope.tabs.length + 1);
        $scope.tabs.push(newTab);
        openBuffer(newTab);
        $scope.selectTab(newTab);
      }

      $scope.removeTab = function(tab) {
        var index = $scope.tabs.indexOf(tab);
        if(index != -1) $scope.tabs.splice(index, 1);
        if (tab == $scope.curTab) {
          $scope.curTab = 'main';
          selectBuffer('main');
        }
        delete $scope.buffers[tab];
      }

      $scope.selectTab = function(tab) {
        $scope.curTab = tab;
        selectBuffer(tab);
      }

      $scope.isSelected = function(tab) {
        return $scope.curTab === tab;
      }

      $scope.renameTab = function(tab) {
        console.log("Renomeando: ");
        console.log(tab);
        $scope.renTab = tab;
      }

      $scope.renameEnter = function(keyEvent, tab, inputValue) {
        if (keyEvent.which === 13) {
            console.log(tab);
            $scope.renTab = null;
            if (typeof inputValue != 'undefined') {
              console.log("Novo nome:")
              var index = $scope.tabs.indexOf(tab);
              if(index != -1) $scope.tabs[index] = inputValue;
              renameBuffer(tab, inputValue);
              $scope.curTab = inputValue;
            }
        }
      }

      function renameBuffer(oldName, newName) {
        var copyBuffer = $scope.buffers[oldName];
        delete $scope.buffers[oldName]
        $scope.buffers[newName] = copyBuffer
      }

      function selectBuffer(name) {
        var buf = $scope.buffers[name];
        if (buf.getEditor()) buf = buf.linkedDoc({sharedHist: true});
        var old = editor.swapDoc(buf);
        var linked = old.iterLinkedDocs(function(doc) {linked = doc;});
        if (linked) {
          for (var name in buffers) if ($scope.buffers[name] == old) $scope.buffers[name] = linked;
          old.unlinkDoc(linked);
        }
        editor.focus();
      }

      function openBuffer(name) {
        $scope.buffers[name] = CodeMirror.Doc("", "javascript");
      }
    });
})();
