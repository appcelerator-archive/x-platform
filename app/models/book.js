//http://docs.appcelerator.com/titanium/latest/#!/guide/Alloy_Collection_and_Model_Objects
exports.definition = {
	config : {
		columns : {
			"id" : "integer primary key autoincrement",
			"title" : "text",
			"author" : "text"
		},
		adapter : {
			type : "sql",
			collection_name : "book",
			idAttribute : "id"
		}
	},
	extendModel : function(Model) {
		_.extend(Model.prototype, {
			validate : function(attrs) {
				for (var key in attrs) {
					var value = attrs[key];
					if (key === "title") {
						if (value.trim().length <= 0) {
							return "Error: No title!";
						}
					}
					if (key === "author") {
						if (value.trim().length <= 0) {
							return "Error: No author!";
						}
					}
				}
			}
		});
		
        return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {
			// Implement the comparator method.
    	    comparator : function(book) {
        	    return book.get('title');
           }
		});

		return Collection;
	}
}; 