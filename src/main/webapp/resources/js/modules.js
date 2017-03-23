'use strict';

var jsonTable = function () {
	var _actualPageNum = 1;
	var pagingConfig = {
		total: 100,
		maxVisible: 10,
		page: _actualPageNum,
		leaps: true,
		firstLastUse: true,
		first: '←',
		last: '→',
		wrapClass: 'pagination',
		activeClass: 'active',
		disabledClass: 'disabled',
		nextClass: 'next',
		prevClass: 'prev',
		lastClass: 'last',
		firstClass: 'first'
	};

	var _buildHtmlTable = function (JSONData, recordCount, tableSelector, tablePagerSelector, pagingCallback, cellCallbackConfig) {
		$(tableSelector).empty();
		$(tablePagerSelector).empty();
		var totalPage = Math.floor(recordCount / JSONData.length);
		pagingConfig.total = totalPage;
		pagingConfig.page = _actualPageNum;
		var columns = _addAllColumnHeaders(JSONData, tableSelector);
		var tBody$ = $('<tbody/>');
		for (var i = 0; i < JSONData.length; i++) {
			var row$ = $('<tr/>');
			for (var colIndex = 0; colIndex < columns.length; colIndex++) {
				var cellValue = JSONData[i][columns[colIndex]];
				if (cellValue == null)
					cellValue = "";
				var cell$ = $('<td/>').html(cellValue);
				if (cellCallbackConfig) {
					for (var cccI = 0; cccI < cellCallbackConfig.length; cccI++) {
						if (colIndex + 1 == cellCallbackConfig[cccI].columnIndex) {
							cell$.click(cellCallbackConfig[cccI].callback);
							cell$.hover(function () {
								$(this).css('cursor', 'pointer');
							});
						}
					}
				}
				row$.append(cell$);
			}
			tBody$.append(row$);
		}
		$(tableSelector).append(tBody$);
		$(tableSelector).addClass("table table-bordered");
		var paginator = $(tablePagerSelector).bootpag(pagingConfig);
		paginator.off("page");
		paginator.on("page", function (event, num) {
			event.preventDefault();
			event.stopImmediatePropagation();
			_actualPageNum = num;
			var start = pagingConfig.maxVisible * (num - 1);
			var length = pagingConfig.maxVisible;
			console.log("Paging event! num=" + num + ', start=' + start + ", length=" + length);
			pagingCallback(start, length);
		});
	};

	var _addAllColumnHeaders = function (JSONData, tableSelector) {
		var columnSet = [];
		var tHead$ = $('<thead/>');
		var headerTr$ = $('<tr/>');
		for (var i = 0; i < JSONData.length; i++) {
			var rowHash = JSONData[i];
			for (var key in rowHash) {
				if ($.inArray(key, columnSet) == -1) {
					columnSet.push(key);
					headerTr$.append($('<th/>').html(key));
				}
			}
		}
		tHead$.append(headerTr$)
		$(tableSelector).append(tHead$);

		return columnSet;
	};


	return {
		drawTable: function (JSONData, recordCount, tableSelector, tablePagerSelector, pagingCallback, cellCallbackConfig) {
			_buildHtmlTable(JSONData, recordCount, tableSelector, tablePagerSelector, pagingCallback, cellCallbackConfig);
		},
		resetPage: function () {
			_actualPageNum = 1;
		}
	}
}();

var searchFilter = function () {
	var filters = [];
	var filtersActiveSelector = '#filtersActive';
	var searchFieldSelector = '#searchField';
	var searchOperatorSelector = '#searchOperator';
	var searchValSelector = '#searchVal';
	var addFilterBtnSelector = '#addFilterBtn';
	var searchBtnSelector = '#searchBtn';

	var _drawFiltersActive = function () {
		$(filtersActiveSelector).empty();
		for (var i = 0; i < filters.length; i++) {
			var p$ = $('<p/>').html(filters[i].field + " " + filters[i].searchOperator + " " + filters[i].searchVal);
			$(filtersActiveSelector).append(p$);
		}
	};

	var _buildFilterSelect = function (JSONData) {
		$(searchFieldSelector).empty();
		var rowHash = JSONData[0];
		for (var key in rowHash) {
			$(searchFieldSelector).append($('<option>', {
				value: key,
				text: key
			}));
		}
	};

	var _addFilterBtnCallback = function (event) {
		event.preventDefault();
		event.stopImmediatePropagation();
		var field = $(searchFieldSelector).val();
		var searchOperator = $(searchOperatorSelector).val();
		var searchVal = $(searchValSelector).val();
		var filter = {
			field: field,
			searchOperator: searchOperator,
			searchVal: searchVal
		};
		filters.push(filter);
		_drawFiltersActive();
	};

	var _reset = function () {
		filters = [];
		$(searchValSelector).val("");
		_drawFiltersActive();
	};

	var _addMd5 = function (md5) {
		var indexToRemove = [];
		for (var i = 0; i < filters.length; i++) {
			var filter = filters[i];
			if (filter.field=='md5'){
				indexToRemove.push(i);
			}
		}
		for (var j = 0; j < indexToRemove.length; j++ ){
			filters.splice(j,1);
		}
		var filter = {
			field: "md5",
			searchOperator: "$eq",
			searchVal: md5
		};
		filters.push(filter);
	};
	return {
		init: function (JSONData, searchCallback) {
			_buildFilterSelect(JSONData);
			$(addFilterBtnSelector).off("click");
			$(addFilterBtnSelector).on('click', _addFilterBtnCallback);
			$(searchBtnSelector).off("click");
			$(searchBtnSelector).on('click', searchCallback);
		},
		reset: function () {
			_reset();
		},
		getFilters: function () {
			return filters;
		},
		addMd5: function (md5) {
			_addMd5(md5);
		}
	}
}();


