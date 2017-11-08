<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>users admin</title>
<script type="text/javascript" src="<c:url value="/js/jquery-1.7.2.js"/>"></script>
<script type="text/javascript" src="<c:url value="/js/json2.js"/>"></script>
<script type="text/javascript" src="<c:url value="/js/underscore.js"/>"></script>
<script type="text/javascript" src="<c:url value="/js/backbone.js"/>"></script>

<script type="text/template" id="tmplt-Users">
        <ul>
        </ul>
</script>
<script type="text/template" id="tmplt-User">
		    <div>*******************************************************</div>
		    <div>{{ name }} </div>
		    <div>{{ MSISDN }} </div>
		    <div>{{ status }} </div>
		    <div>{{ email }} </div>
 </script>
<script type="text/javascript">


	//since JSP uses \<\% for it's own template, we cannot use that with backbone as well
	//this trick forces backbone to user {{ }} as the template keyword
	_.templateSettings = {
			  interpolate : /\{\{(.+?)\}\}/g
			};


	//see a very good tutorial at http://bardevblog.wordpress.com/2012/01/16/understanding-backbone-js-simple-example/

	//Namespaces
	var Admin = {
			Models: {},
			Collections: {},
			Views: {},
			Templates: {}
	}

	Admin.Models.User = Backbone.Model.extend({
		defaults: {
			name: "",
			MSISDNs: "",
			status: 1,
			emails: ""
		} 
	});
	Admin.Collections.UserList = Backbone.Collection.extend({
		model: Admin.Collections.User,
	    url: "users.json", /* this is magic to fill this collection automatically */
	    initialize: function(){
	        //console.log("Admin.Collections.UserList initialize");
	    }
	});
	
	Admin.Router = Backbone.Router.extend({
		routes: {
			"" : "defaultRout"
		},
	    defaultRoute: function () {
	        console.log("defaultRoute");
	        var users = new Admin.Collections.UserList();
	        new Admin.Views.UserList({ collection: users });
	        users.fetch();
	        console.log(usres.length);
	    }
	});
	
	var appRouter = new Admin.Router();
	Backbone.history.start();
	
	Admin.Templates.UserList = _.template($("#tmplt-Users").html())

	
	Admin.Views.UserList = Backbone.View.extend({
		el: $("#mainContainer"),
		collection: Admin.Collections.UserList,
	    initialize: function () {
	        _.bindAll(this, "render");
	         this.collection.bind("reset", this.render);
	    },
	 
	    render: function(){
	        console.log("render")  
	        console.log(this.collection.length);
	    }
	});
</script>

</head>
<body>
 <div id="mainContainer"></div>
</body>
</html>