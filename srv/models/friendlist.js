/*
 * models/userlist.js
 * @author Osmay Y. Cruz Alvarez <osmay.cruz@gmail.com>
 * This model hadles the userlist of a user
 *
*/

var FRIENDLIST = "FriendList";

/*
 * This method look for an id in a array
 * @return false the user doesnt exists
 *         true the user exists. 
*/
var search = function(array, id){
	for (var i = 0; i <= array.length; i++) {
		if (array[i] === id) return true;
	}
	return false;
}

exports = module.exports = function(app){
	var db       = app.locals.db
    , mongoose = db.mongoose
    , Schema   = mongoose.Schema
    ;

  var friendListSchema = new Schema({
  	userId: String,
  	friends: [],    //here i store the all the friends if not in black list can see my position but not my name
  	blacklist: [],  // here store the friends who can't see my position
  	showme: [],     // this people can see my name & pposition in the map
  }, {collection: FRIENDLIST});

  friendListSchema.methods.addFriend = function(friendId){
  	if(!search(this.friends, friendId)){ // the userID is not in firendlist
  		this.friends.push(friendId);
  	}
  };

  friendListSchema.methods.addToBlackList = function(friendId){
  	if(!search(this.blacklist, friendId)){ // the userID is not in blacklist
  		this.blacklist.push(friendId);
  	}
  };

  friendListSchema.methods.addShowMe = function(friendId){
  	if(!search(this.showme, friendId)){ // the userID is not in blacklist
  		this.showme.push(friendId);
  	}
  };

  friendList = mongoose.model(FRIENDLIST, friendListSchema);
}