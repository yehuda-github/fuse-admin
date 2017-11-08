/*! backbone.paginator - v0.1.54 - 6/30/2012
* http://github.com/addyosmani/backbone.paginator
* Copyright (c) 2012 Addy Osmani; Licensed MIT */
define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	"use strict";

	//var Paginator = {};
	//Paginator.version = "0.15";	
	
	// @name: requestPager
	//
	// Paginator for server-side data being requested from a backend/API
	//
	// @description:
	// This paginator is responsible for providing pagination
	// and sort capabilities for requests to a server-side
	// data service (e.g an API)
	//
	
	var Paginator = Backbone.Collection.extend({

		sync: function ( method, model, options ) {
			var self = this;
						
			// Create default values if no others are specified
			_.defaults(self.paginator_ui, {
				firstPage: 0,
				currentPage: 1,
				perPage: 5,
				totalPages: 10
			});
			
			// Change scope of 'paginator_ui' object values
			_.each(self.paginator_ui, function(value, key) {
				if( _.isUndefined(self[key]) ) {
					self[key] = self.paginator_ui[key];
				}
			});
		
			// Some values could be functions, let's make sure
			// to change their scope too and run them
			var queryAttributes = {};
			_.each(self.server_api, function(value, key){
				if( _.isFunction(value) ) {
					value = _.bind(value, self);
					value = value();
				}
				queryAttributes[key] = value;
			});
			
			var queryOptions = _.clone(self.paginator_core);
			_.each(queryOptions, function(value, key){
				if( _.isFunction(value) ) {
					value = _.bind(value, self);
					value = value();
				}
				queryOptions[key] = value;
			});
			
			// Create default values if no others are specified
			queryOptions = _.defaults(queryOptions, {
				timeout: 25000,
				cache: false,
				type: 'GET',
				dataType: 'jsonp'
			});

			queryOptions = _.extend(queryOptions, {
				jsonpCallback: 'callback',
				data: decodeURIComponent($.param(queryAttributes)),
				processData: false,
				url: _.result(queryOptions, 'url')
			}, options);
			
			return $.ajax( queryOptions );

		},
		
		updateRoute: function() {
			//console.log( this.router.routes[Backbone.history.fragment] );
			//console.log( Backbone.history.fragment );
			//console.log( this.router.routes[Backbone.history.fragment] );
			
			var _routeContainsPageNumber = false;
			var _pageNumberFragment = this.routePageNumberFragment + this.currentPage;
			var _fragmentIndex = 0;
			var _fragments = Backbone.history.fragment.split("/");
			
			for(_fragmentIndex = 0; _fragmentIndex < _fragments.length; _fragmentIndex++) {
				if(_fragments[_fragmentIndex].indexOf(this.routePageNumberFragment) === 0) {
					_fragments[_fragmentIndex] = _pageNumberFragment;
					_routeContainsPageNumber = true;
				}
			}
			
			if(!_routeContainsPageNumber) {
				_fragments.push(_pageNumberFragment);
			}
		
			this.router.navigate(_fragments.join("/"), true);			
		},
		
		requestNextPage: function ( options ) {	
			if(this.totalPages === this.currentPage) {
				return;
			}
			
			if ( this.currentPage !== undefined ) {
				this.currentPage += 1;
				this.updateRoute();
				return;// this.pager( options );
			} else {
				var response = new $.Deferred();
				response.reject();
				return response.promise();
			}
		},

		requestPreviousPage: function ( options ) {
		
			if(this.firstPage === this.currentPage) {
				return;
			}
			
			if ( this.currentPage !== undefined ) {
				this.currentPage -= 1;
				this.updateRoute();
				return;// this.pager( options );
			} else {
				var response = new $.Deferred();
				response.reject();
				return response.promise();
			}
		},

		updateOrder: function ( column ) {
			if (column !== undefined) {
				this.sortField = column;
				this.pager();
			}

		},

		goTo: function ( page, options ) {
			if (!page) {
				page = 1;
			}
			
			this.currentPage = parseInt(page, 10);
			
			return this.pager(options);
			
			/*
			else {
				var response = new $.Deferred();
				response.reject();
				return response.promise();
			}
			*/
		},

		howManyPer: function ( count ) {
			if( count !== undefined ){
				this.currentPage = this.firstPage;
				this.perPage = count;
				this.pager();				
			}
		},

		sort: function () {
			//assign to as needed.
		},

		info: function () {
			var info = {
				// If parse() method is implemented and totalRecords is set to the length
				// of the records returned, make it available. Else, default it to 0
				totalRecords: this.totalRecords || 0,
				currentPage: this.currentPage,
				firstPage: this.firstPage,
				totalPages: this.totalPages,
				lastPage: this.totalPages,
				perPage: this.perPage,
				isFirstPage: this.firstPage >= this.currentPage,
				isLastPage: this.totalPages <= this.currentPage
			};

			if(info.totalRecords === 0) {
				info.firstRecordNumber = 0;
			}
			else {
				info.firstRecordNumber = ((info.currentPage - 1) * info.perPage) + 1;
			}
			
			if(info.totalRecords < info.perPage) {
				info.lastRecordNumber = info.totalRecords;
			}
			else {
				info.lastRecordNumber = info.firstRecordNumber + info.perPage - 1;
			}

			this.information = info;
			return info;
		},

		// fetches the latest results from the server
		pager: function ( options ) {
			if ( !_.isObject(options) ) {
				options = {};
			}
			return this.fetch( options );
		}
	});

	return Paginator;
});