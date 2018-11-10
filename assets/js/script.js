var app = angular.module('fileUpload', ['ngMaterial', 'ngMessages', 'material.svgAssetsCache',
    'ngFileUpload', 'uiCropper']);
app.controller('fileController', ['$scope', '$http', '$timeout', '$httpParamSerializerJQLike', 'ngfDataUrlFilter',
    function ($scope, $http, $timeout, $httpParamSerializerJQLike, ngfDataUrlFilter) {

    var getFileBlob = function (url, cb) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.addEventListener('load', function() {
                    cb(xhr.response);
                });
                xhr.send();
        };

        var blobToFile = function (blob, name) {
                blob.lastModifiedDate = new Date();
                blob.name = name;
                return blob;
        };

        var getFileObject = function(filePathOrUrl, cb) {
               getFileBlob(filePathOrUrl, function (blob) {
                  cb(blobToFile(blob, 'test.jpg'));
               });
        };


        $scope.updateImage = function (filename) {
            $scope.picFileUpdated = window.location.href + filename;
            getFileObject($scope.picFileUpdated, function (fileObject) {
                 $scope.currentFile = fileObject;
            });
            $scope.onImageUpdated();
        };

        $scope.test_images = [
            { 'url': 'assets/images/face2.jpg' },
            { 'url': 'assets/images/face3.jpg' },
            { 'url': 'assets/images/face4.jpg' },
            { 'url': 'assets/images/face5.jpg' },
            { 'url': 'assets/images/face6.jpg' },
            { 'url': 'assets/images/face7.jpg' }
        ];

        $scope.colorDictionnary = {
            "happiness": ['mediumseagreen', 'white'],
            "surprise": ['hotpink', 'white'],
            "neutral": ['lightgray', 'black'],
            "contempt": ['saddlebrown', 'white'],
            "sadness": ['black', 'white'],
            "fear": ['darkblue', 'white'],
            "anger": ['darkred', 'white'],
            "disgust": ['darkseagreen', 'black'],
        }

        $scope.positiveEmotions = ['happiness', 'surprise', 'neutral', 'contempt'];
        $scope.negativeEmotions = ['sadness', 'fear', 'anger', 'disgust'];

        $scope.p = {"prediction":[]};
        $scope.upload = function () {
            if ($scope.currentFile) {

                var form = new FormData();
                form.append('Input2505', $scope.currentFile);
                $scope.showSpinner = true;
                $http({
                    method: 'POST',
                    url: 'https://emo.saravanakumar.me/emotion_ferplus/predict',
                    data: form,
                    headers: { 'Content-Type': undefined },
                }).then(function (response) {
                    $scope.showSpinner = false;
                    if ($scope.p["predictions"] && $scope.p["predictions"].length == response.data.prediction.length) {
                        for (var i = 0; i < $scope.p["predictions"].length; i++) {
                            $scope.p.predictions[i].face = response.data.prediction[i].face;
                            for (var key in $scope.p["predictions"][i].emotion) {
                                if ($scope.p["predictions"][i].emotion.hasOwnProperty(key)) {
                                   $scope.p["predictions"][i].emotion[key] = response.data.prediction[i].emotion[key];
                                }
                            }
                        }
                    } else {
                        $scope.p["predictions"] = [];
                        $timeout(function() {
                            $scope.p["predictions"] = response.data.prediction;
                            if (response.data.prediction.length == 0) {
                                $scope.errorMessage = "No faces detected on this image";
                            } else {
                                $scope.errorMessage = "";
                            }
                        })
                    }

                }, function (response) {
                    $scope.showSpinner = false;
                    $scope.errorMessage = "There was an error with your request";
                    console.log(response);
                }, function (evt) {
                    $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                });
            }
        }

        $scope.$watchCollection('picFile', function () {
            if ($scope.picFile) {
                $scope.picFileUpdated = ngfDataUrlFilter($scope.picFile);

                if (!$scope.currentFile ||
                    (($scope.currentFile.name != $scope.picFile.name) &&
                        ($scope.currentFile.size != $scope.picFile.size))) {
                    $scope.currentFile = $scope.picFile;
                    $scope.onImageUpdated();
                }
            }
        }, true);

        $scope.drag = function ($isDragging, $class, $event) {

            if ($isDragging) {
                $('#dropArea').addClass('draggedOver');
                $('#textInfo').addClass('draggedOver');
                $('#uploadIcon').addClass('draggedOver');
            } else {
                $scope.removeClasses();
            }
        }

        $scope.removeClasses = function () {
            $('#dropArea').removeClass('draggedOver');
            $('#textInfo').removeClass('draggedOver');
            $('#uploadIcon').removeClass('draggedOver');
        }

        $scope.onImageUpdated = function () {
            if ($scope.picFileUpdated != undefined) {
                $('#dropArea').height(60);
                $scope.removeClasses();
                $timeout(function () {
                    $scope.upload()
                }, 200);
            }
        }


    }])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
        $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
        $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
        $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    });