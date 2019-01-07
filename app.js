
var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var ejs = require('ejs');
var fs = require('fs');

var app = express();
app.use(express.static('public'));

var server = http.createServer(app);

var userrooms = [];

server.listen(52273, function(){
	console.log('server running');
});

app.get('/', function (req,res){
	fs.readFile('Lobby.html', function(err , data){
		res.send(data.toString());
	});
});

app.get('/canvas/:room', function(req, res){
	
	for(var item in userrooms){
		if(userrooms[item].roomname == req.params.room){
			fs.readFile('canvas.html', 'utf8', function(err, data){
				res.send(ejs.render(data,{
					room: req.params.room
				}));
			});
			
		}else{
			res.redirect('/');
		}
	}
	
});

/*app.post('/canvas/:room', function(req,res){
	var pass = req.body.pwd;
	console.log('req.body.pwd : '+pass);
	console.log(':room : '+ req.params.room);
	
	
	for(var item in userrooms){
		console.log(userrooms[item.roomname]);
		console.log(userrooms[item].roomname);
		if(userrooms[item].roomname == req.params.room && 
				userrooms[item].roompass == pass){
			fs.readFile('canvas.html', 'utf8', function(err, data){
				res.send(ejs.render(data,{
					room: req.params.room
				}));
			});
			
		}else{
			res.redirect('/');
		}
	}
	
});*/

app.get('/room', function(req,res){
	
	// Object.keys()만 돌리게 되면 해당 Object의 value값만 배열로 반환이 됩니다.
	// filter() 메서드는 주어진 판별 함수를 통과하는 요소를 모아 새로운 배열로 만들어 반환합니다.
/*	var rooms = Object.keys(io.sockets.adapter.rooms).filter(function(item){
		// indexOf() 메서드는 배열에서 지정된 요소를 찾을 수있는 첫 번째 인덱스를 반환하고 존재하지 않으면 -1을 반환합니다.
		return item.indexOf('/')<0;
	});
	res.send(rooms);
	*/
	//var currentRoom = Object.keys(io.sockets.adapter.rooms).filter(item => item!=io.sockets.id);
	res.send(userrooms);
});


var io = socketio.listen(server);

io.sockets.on('connect', function(socket){
	//var roomId = "";
	
/*	var userroom = {
			userid: string,
			roomname: string,
			roompass: string,
			roommaxp: int,
			roomcurp: int
	}*/
	
	
	
	socket.on('join', function(data){
		console.log('data at join : '+data);
		
		for(var item in userrooms){
			
			if(userrooms[item].roomname == data){
				userrooms[item].roomcurp += 1;
				console.log(userrooms[item].roomcurp);
			}
		}
		
		
		
		socket.join(data);
		roomId = data;
	});
	
	socket.on('draw', function(data){
		io.sockets.in(roomId).emit('line', data);
	});
	
	socket.on('onCreateRoom', function(data){
		var roomexist = false;
		for(var item in userrooms){
			if(data.roomname == userrooms[item].roomname){
				roomexist = true;
			}
		}
		
		if(!roomexist){
			socket.leave(socket.room);
			//socket.join(data.roomname);
			socket.room = data.roomname;
			data.rcode = 0;
			
			userrooms.push({
				userid: data.userid,
				roomname: data.roomname,
				roompass: data.roompass,
				roommaxp: data.roommaxp,
				roomcurp: 0
			});
		}else{
			data.rcode = 1;
		}
		
		if(data.rcode == 0){
			console.log(data);
		socket.emit('onCreateRoom', data)
		}else{
			console.log('기존 방있음');
		}
	});
	
	socket.on('updateRooms', function(data){
		userrooms = data;
	})
	
})
