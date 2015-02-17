angular.module('parkingApp', ['ngGeolocation'])
    .controller('parkingController', function($scope, $http, $geolocation, $document) {
        $scope.parkingSpots = [];
        $scope.order = 'properties.distance';
        $scope.reverse = false;
        $scope.myPosition = null;
        $scope.changeOrder = function(by) {

            if ($scope.order = by) {
                $scope.reverse = !$scope.reverse;
            }
            $scope.order = by;
        }
        $http.get('http://parkleit-api.codeformuenster.org/').success(function(data) {

            $scope.parkingSpots = data.features;
            $scope.geojson = {
                data: data.features
            };

            $scope.updateDistance();

        }).error(function() {

            $document.find('body').eq(0).html('<div class="container alert alert-danger"><span class="glyphicon glyphicon-exclamation-sign"></span> Beim Laden der Parkplatzdaten ist ein Fehler aufgetreten. ' + 
                'Bitte später erneut versuchen.</div>');
        })

        $geolocation.getCurrentPosition({
            timeout: 60000
        }).then(function(position) {
            $scope.myPosition = position;
        });

        $scope.updateDistance = function() {

            if ($scope.myPosition) {
                $scope.parkingSpots.forEach(function(spot) {                  
                    //Make it work for both points and areas
                    if (typeof spot.geometry.coordinates[0] == 'number') {
                        var lat = spot.geometry.coordinates[1];
                        var lon = spot.geometry.coordinates[0];
                    } else {
                        var lat = spot.geometry.coordinates[0][0][1];
                        var lon = spot.geometry.coordinates[0][0][0];
                    }

                    spot.properties.distance = getDistance($scope.myPosition.coords.latitude, $scope.myPosition.coords.longitude, lat, lon).toFixed(2);
                })
            }
        }
        $scope.$watch('myPosition.coords', function(newValue, oldValue) {
            $scope.updateDistance();
        });

        //Credit: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
        function getDistance(lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1); // deg2rad below
            var dLon = deg2rad(lon2 - lon1);
            var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        }

        function deg2rad(deg) {
            return deg * (Math.PI / 180)
        }

    }).directive('freecolor', function() {
        return {
            scope: {
                spot: '=spot'
            },

            link: function(scope, element, attrs) {
                scope.$watch('spot.properties.free', function(value) {

                    //Not beautiful, but fasted way to do this according to
                    //http://stackoverflow.com/questions/6665997/switch-statement-for-greater-than-less-than

                  	var bgColor;
                  
                    if (value >= 100) {
                        bgColor = '#2ecc71';
                    }

                    if (value < 100 && value >= 50) {
                        bgColor = '#f1c40f';
                    }

                    if (value < 50 && value >= 20) {
                        bgColor = '#e67e22';
                    }

                    if (value < 20 && value >= 5) {
                        bgColor = '#e74c3c';
                    }

                    if (value < 5) {
                        bgColor = '#c0392b';
                    }

                    element.css('background-color', bgColor);
                });
            }
        };
    });
