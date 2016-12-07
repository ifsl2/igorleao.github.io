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
        $scope.curTab = 'Main.java';
        $scope.tabs = [];
        $scope.tabCount = 1;
        $scope.buffers = {};
        $scope.compiling = false;
        $scope.output = "Code not compiled yet";
        $scope.ASPECT_JML_COMPILER = "aspectjml1.7";
        $scope.JDK_COMPILER = "jdk1.7";
        $scope.compiler = $scope.ASPECT_JML_COMPILER;
        $scope.compiler_outputs = [];
        $scope.current_compiler_output = null;
        $scope.oneFile = false;
        $scope.compilerOutput = "(compiler output will display here)"
        $scope.programOutput = "(program output will display here)"

        openBuffer('Main.java');
        selectBuffer('Main.java');

        $scope.compile = function() {
            NProgress.start();
            $scope.compiling = true;
            $scope.compilerOutput = "Compiling ..."
            $scope.programOutput = "Waiting for the compile to run  ..."

            console.log("vamo compilar esse caraiii!");
            //let code = editor.getValue();

            // TODO: ONEFILE!!!!!!!!!!!!!!!!!!!!!
            let request_data = {
                "options": {
                    "compiler": $scope.compiler,
                    "one_file": $scope.oneFile
                },
                "code": []
            }

            var classes = []
            var curObject = {}
            curObject["class_name"] = 'Main.java'
            selectBufferWithoutFocus('Main.java');
            curObject["source_code"] = editor.getValue();
            classes.push(curObject);
            for (var i in $scope.tabs) {
                curObject = {};
                curObject["class_name"] = $scope.tabs[i];
                selectBufferWithoutFocus($scope.tabs[i]);
                curObject["source_code"] = editor.getValue();
                classes.push(curObject);
            }
            request_data.code = classes;
            $scope.selectTab($scope.curTab);
            console.log(request_data);

            $http.post("http://54.203.4.64:3000/compile", request_data)
            .success(function(data, status) {
                $scope.compiler_outputs.push(data);
                $scope.current_compiler_output = data;

                $scope.programOutput = data.completed ? data["program_output"] : data.errors
                $scope.compilerOutput = (data["compiler_output"] == "") ? ("Compiled at: "+ data["finished_at"]) : data["compiler_output"]

                NProgress.done();
                console.log(data);
            }).error(function (data, status, header, config) {
                console.log("DEU ERRRORRR")
                //applyError();
                NProgress.done();
            });
            $scope.compiling = false;
        }

        $scope.addTab = function(tabName) {
            $scope.tabs.push(tabName);
            openBuffer(tabName);
            $scope.selectTab(tabName);
            $scope.newTabName = "";
        }

        $scope.removeTab = function(tab) {
            var index = $scope.tabs.indexOf(tab);
            if(index != -1) $scope.tabs.splice(index, 1);
            if (tab == $scope.curTab) {
                $scope.curTab = 'Main.java';
                selectBuffer('Main.java');
            }
            delete $scope.buffers[tab];
        }

        $scope.selectTab = function(tab) {
            console.log(tab);
            $scope.curTab = tab;
            selectBuffer(tab);
        }

        $scope.isSelected = function(tab) {
            return $scope.curTab === tab;
        }

        $scope.renameTab = function(tab) {
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

        $scope.addCompilerOutputTab = function() {
            console.log("AHIOOOIIIIII");
            var tabName = "output:" + new Date().getTime();
            $scope.addTab(tabName);
            $scope.compiler_outputs.push(tabName);
            var value = $scope.current_compiler_output["compiler_output"] || "Not compiled yet";
            console.log(value);
            editor.setValue(value);
        }

        function renameBuffer(oldName, newName) {
            var copyBuffer = $scope.buffers[oldName];
            delete $scope.buffers[oldName]
            $scope.buffers[newName] = copyBuffer
        }

        function selectBufferWithoutFocus(name) {
            var buf = $scope.buffers[name];
            if (buf.getEditor()) buf = buf.linkedDoc({sharedHist: true});
            var old = editor.swapDoc(buf);
            var linked = old.iterLinkedDocs(function(doc) {linked = doc;});
            if (linked) {
                for (var name in buffers) if ($scope.buffers[name] == old) $scope.buffers[name] = linked;
                old.unlinkDoc(linked);
            }
        }

        function selectBuffer(name) {
            selectBufferWithoutFocus(name);
            editor.focus();
        }

        function openBuffer(name) {
            var content = ""
            if (name == "Main.java") content = document.getElementById("editor").innerHTML;
            $scope.buffers[name] = CodeMirror.Doc(content, "text/x-java");
        }
    });
})();
