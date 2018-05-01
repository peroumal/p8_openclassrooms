/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	/**
	 * Creates a new client side storage object and will create an empty
	 * collection if no collection already exists.
	 *
	 * @param {string} name The name of our DB we want to use
	 * @param {function} callback Our fake DB uses callbacks because in
	 * real life you probably would be making AJAX calls
	 */
	function Store(name, callback) {
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			var data = {
				todos: []
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}

	/**
	 * Finds items based on a query given as a JS object
	 *
	 * @param {object} query The query to match against (i.e. {foo: 'bar'})
	 * @param {function} callback	 The callback to fire when the query has
	 * completed running
	 *
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // data will return any items that have foo: bar and
	 *	 // hello: world in their properties
	 * });
	 */
	Store.prototype.find = function (query, callback) {
		if (!callback) {
			return;
		}

		var todos = JSON.parse(localStorage[this._dbName]).todos;

		callback.call(this, todos.filter(function (todo) {
			for (var q in query) {
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		}));
	};

	/**
	 * Will retrieve all data from the collection
	 *
	 * @param {function} callback The callback to fire upon retrieving data
	 */
	Store.prototype.findAll = function (callback) {
		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	/**
	* Check if an given data-id value exist in todo-lists
	* @param {string} value The data-id value to search
	*/
	Store.prototype.isDataIdExist = function(value){
		var todoLists = document.getElementsByClassName("todo-list");
		for (var i=0;i<todoLists.length;i++){
			var todos = todoLists[i].childNodes;
			for (var j=0;j<todos.length;j++){
				//console.log("Is attribute data-id="+value+" exist ? ",todos[j].getAttribute("data-id"));
				if(todos[j].getAttribute("data-id") == value) {
					console.log("Attribute data-id="+value+" already exist");
					return true;
				}
			}
		}
		console.log("Attribute data-id="+value+" is uniq");
	  return false;
	}

	/**
	* Generate random id, not used in given {todos}
	* @param todos List of todos, called todoList
	* @param {number} idLength The start length of id
	* @param {string} charset The charset to use for id generation
	* @param {boolean} unlimited if is true the generated id length can surpass {idLength}
	* if necessary for generate an random id. Else if there atno will be returned.
	*/
	Store.prototype.generateRandomTodoId = function(todos, charset, idLength, unlimited){
		// maximum todo
		var maxTodos = Math.floor(
			Math.pow(charset.length,idLength)
			*((charset.length-1)/charset.length)
		);

		// When max todos limit is done
		if(maxTodos <= todos.length) {
			if(!unlimited){
				alert("Le nombre maximum de "+maxTodos+" todos est atteint. Vous ne pouvez pas en rajouter, à moins de supprimer des todos");
				return;
			}
			idLength +=1;
		}

		// Generate an random id
		var newId;
		do {
				newId="";
				for (var i = 0; i < idLength; i++)
						newId += charset.charAt(Math.floor(Math.random() * charset.length))+"";
		} while (this.isDataIdExist(newId));
		return newId;
	};

	/**
	 * Will save the given data to the DB. If no item exists it will create a new
	 * item, otherwise it'll simply update an existing item's properties
	 *
	 * @param {object} updateData The data to save back into the DB
	 * @param {function} callback The callback to fire after saving
	 * @param {number} id An optional param to enter an ID of an item to update
	 */
	Store.prototype.save = function (updateData, callback, id) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;

		callback = callback || function () {};

		// If an ID was actually given, find the item and update each property
		if (id) {
			for (var i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					for (var key in updateData) {
						todos[i][key] = updateData[key];
					}
					break;
				}
			}
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		} else { // If no id not given

			// Todo id generation based on millisecond time
			var newId = new Date().getTime();

			// Todo random id generation : code line below
			//var newId = this.generateRandomTodoId(todos,"0123456789",6,true);
			if(!newId)return;

    	// Assign an ID
			updateData.id = parseInt(newId);
			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}
	};

	/**
	 * Will remove an item from the Store based on its ID
	 *
	 * @param {number} id The ID of the item you want to remove
	 * @param {function} callback The callback to fire after saving
	 */
	Store.prototype.remove = function (id, callback) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;
		/* We already know the id. This operation is useless
		var todoId = id;

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == id) {
				todoId = todos[i].id;
			}
		}*/

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == id) {
				todos.splice(i, 1);
			}
		}

		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, todos);
	};

	/**
	 * Will drop all storage and start fresh
	 *
	 * @param {function} callback The callback to fire after dropping the data
	 */
	Store.prototype.drop = function (callback) {
		var data = {todos: []};
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);
