//服务器及页面部分
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users=[];//保存所有在线用户的昵称
app.use('/', express.static(__dirname + '/www'));
server.listen(80);
//socket部分
io.on('connection', function(socket) {
    //昵称设置
    socket.on('login', function(nickname) {
    	let isexit=false;
    	for(let i=0;i<users.length;i++){
    		if (users[i].nickname==nickname) {
    			users[i].islogin=true;
            	socket.emit('nickExisted');
            	socket.userIndex = i;
            	socket.nickname = nickname;
            	socket.emit('loginSuccess');
            	io.sockets.emit('system', nickname,users.length,users, 'login');

            	isexit=true;
            	break;
    		}
		}

        if (!isexit) {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            let param={
            	nickname:nickname,
            	socketid:socket.id,
            	islogin:true
            }
            users.push(param);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname,users.length,users, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        };
    });
    //断开连接的事件
	socket.on('disconnect', function() {
	    //将断开连接的用户从users中删除
	    // users.splice(socket.userIndex, 1);
	    users[socket.userIndex].islogin=false;
	    //通知除自己以外的所有人
	    socket.broadcast.emit('system', socket.nickname, users.length, users,'logout');
	});
	socket.on('postMsg', function(msg,tosocketid) {
		if(tosocketid){
			io.sockets.socket(tosocketid).emit('onetoonemsg',socket.nickname, msg); 
		}else{
			//将消息发送到除自己外的所有用户
        	socket.broadcast.emit('newMsg', socket.nickname, msg);
		}
        
    });
});