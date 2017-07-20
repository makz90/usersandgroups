var app = angular.module('myApp', ["angucomplete"]);
app.controller('mainController', function ($scope, $http) {

    $scope.userFormData = {};
    $scope.groupFormData = {};
    $scope.groupClasses = {};

    $scope.getAllData = function () {
        console.log("getting all:");
        $scope.getUsers();
        $scope.getGroups();
    };

    $scope.clearError = function () {
        $scope.errorMessage = "";
    };


    //GET calls ------------------------------------------------------------

    $scope.getUsers = function () {
        console.log("--- get users");
        $http({
            method: 'GET',
            url: '/api/users'
        }).then(function successCallback(response) {

            $scope.users = response.data;

            angular.forEach($scope.users, function(value, key) {
                $http({
                    method: 'GET',
                    url: '/api/groups/user/' + value.id
                }).then(function successCallback(response) {

                    $scope.users[key].groups = response.data;
                    console.log($scope.users[key]);

                }, function errorCallback(response) {

                });
            });

        }, function errorCallback(response) {

        });
    };

    $scope.getGroups = function () {

        saveCollapsedState();

        console.log("--- get groups");
        $http({
            method: 'GET',
            url: '/api/groups'
        }).then(function successCallback(response) {
            $scope.groups = response.data;

            angular.forEach($scope.groups, function(value, key) {
                $http({
                    method: 'GET',
                    url: '/api/users/group/' + value.id
                }).then(function successCallback(response) {

                    //$scope.groups[key].class = "collapse";
                    $scope.groups[key].users = response.data;
                    console.log($scope.groups[key]);


                }, function errorCallback(response) {

                });
            });


        }, function errorCallback(response) {

        });
    };

    $scope.getUserGroups = function () {
        $http({
            method: 'GET',
            url: '/api/usergroups/'
        }).then(function successCallback(response) {
            $scope.usergroups = response.data;
            console.log(response.data);
        }, function errorCallback(response) {

        });
    };



    //POST calls ------------------------------------------------------------

    $scope.addUser = function () {
        if ($scope.userFormData.login && $scope.userFormData.password) {
            $http({
                method: 'POST',
                url: '/api/users',
                data: $scope.userFormData
            }).then(function successCallback(response) {

                if (response.data.toString().startsWith("ER")) {
                    $scope.errorMessage = response.data;
                } else {
                    $scope.errorMessage = "";
                }

                console.log(response.data);
            }, function errorCallback(response) {

            });
            $scope.getUsers();
        }
    };

    $scope.addGroup = function () {

        if ($scope.groupFormData.name) {
            $http({
                method: 'POST',
                url: '/api/groups',
                data: $scope.groupFormData
            }).then(function successCallback(response) {

                if (response.data.toString().startsWith("ER")) {
                    $scope.errorMessage = response.data;
                } else {
                    $scope.errorMessage = "";
                }

                console.log(response.data);
            }, function errorCallback(response) {

            });
            $scope.getGroups();
        }


    };


    function saveCollapsedState() {
        angular.forEach($scope.groups, function(value, key) {
            var collapseClass = angular.element( document.querySelector( '#collapse' + value.id ) );
            $scope.groupClasses[value.id] = collapseClass[0].className;
        });
    }

    $scope.addUserToGroup = function (userId, groupId) {

        $http({
            method: 'POST',
            url: '/api/usergroups/' + groupId + '/' + userId,
            data: $scope.groupFormData
        }).then(function successCallback(response) {

            if (response.data.toString().startsWith("ER")) {
                $scope.errorMessage = response.data;
            } else {
                $scope.errorMessage = "";
            }

            console.log(response.data);
        }, function errorCallback(response) {

        });
        $scope.getAllData();
    };


    //DELETE calls ------------------------------------------------------------

    $scope.deleteUser = function (id) {

        $http({
            method: 'DELETE',
            url: '/api/users/' + id
        }).then(function successCallback(response) {
            console.log(response.data);
        }, function errorCallback(response) {

        });
        $http({
            method: 'DELETE',
            url: '/api/usergroups/user/' + id
        }).then(function successCallback(response) {
            console.log(response.data);
        }, function errorCallback(response) {

        });
        $scope.getAllData();
    };

    $scope.deleteGroup = function (id) {

        $http({
            method: 'DELETE',
            url: '/api/groups/' + id
        }).then(function successCallback(response) {
            console.log(response.data);
        }, function errorCallback(response) {

        });
        $http({
            method: 'DELETE',
            url: '/api/usergroups/group/' + id
        }).then(function successCallback(response) {
            console.log(response.data);
        }, function errorCallback(response) {

        });
        $scope.getAllData();
    };


    $scope.removeUserFromGroup = function (user_id, group_id) {

        $http({
            method: 'DELETE',
            url: '/api/usergroups/' + group_id + '/' + user_id
        }).then(function successCallback(response) {
            console.log(response.data);
        }, function errorCallback(response) {

        });
        $scope.getAllData();
    };


    //PUT calls ------------------------------------------------------------
    $scope.updateUser = function (id, itemName, itemValue) {
        if (itemValue) {
            $http({
                method: 'PUT',
                url: '/api/users/' + id + '/'+ itemName + '/' + itemValue
            }).then(function successCallback(response) {

            }, function errorCallback(response) {

            });
            $scope.getAllData();
            itemValue = "";
        }
        $('.modal-backdrop').remove();
    };

    $scope.updateGroup = function (id, itemName, itemValue) {
        if (itemValue) {
            $http({
                method: 'PUT',
                url: '/api/groups/' + id + '/'+ itemName + '/' + itemValue
            }).then(function successCallback(response) {

            }, function errorCallback(response) {

            });
            $scope.getAllData();
            itemValue = "";
        }
        $('.modal-backdrop').remove();
    };

});