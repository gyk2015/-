window.onload = function() {
    var hichat = new HiChat();
    hichat.init();
};

//定义我们的hichat类
var HiChat = function() {
    this.socket = null;
};

//向原型添加业务方法
HiChat.prototype = {
    init: function() {//此方法初始化程序
        var that = this;
        var tosocketid;
        //建立到服务器的socket连接
        this.socket = io.connect();
        //监听socket的connect事件，此事件表示连接已经建立
        this.socket.on('connect', function() {
            //连接到服务器后，显示昵称输入
            document.querySelector('.login').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            //检查昵称输入框是否为空
            if (nickName.trim().length != 0) {
                //不为空，则发起一个login事件并将输入的昵称发送到服务器
                that.socket.emit('login', nickName);
            } else {
                //否则输入框获得焦点
                document.getElementById('nicknameInput').focus();
            };
        }, false);
        this.socket.on('nickExisted', function() {
            alert("欢迎回来")
            document.getElementById('info').textContent = '欢迎回来'; //显示昵称被占用的提示
        });
        this.socket.on('loginSuccess', function() {
            document.title = '聊天室 | ' + document.getElementById('nicknameInput').value;
            document.querySelector('.login').style.display = 'none';//隐藏遮罩层显聊天界面
            document.getElementById('messageInput').focus();//让消息输入框获得焦点
        });
        this.socket.on('system', function(nickName, userCount,users, type) {
            //判断用户是连接还是离开以显示不同的信息
            var msg = nickName + (type == 'login' ? ' joined' : ' left');
            //指定系统消息显示为红色
            that._displayNewMsg('system ', msg, 'red');
            //将在线人数显示到页面顶部
            document.getElementById('status').textContent = userCount + '用户';
            document.getElementById('friendList').getElementsByTagName("ul")[0].remove();
            let ul=document.createElement('ul');
            document.getElementById('friendList').appendChild(ul);
            for(let i=0;i<users.length;i++){
                let p=document.createElement('li')
                let statusstring=users[i].islogin?'（在线）':'（离线）';
                p.innerHTML=users[i].nickname + statusstring
                p.id=users[i].socketid
                p.addEventListener('click',function(){
                    // that.socket.emit('onetoone',this.id)
                    tosocketid=this.id;
                    that._displayNewMsg('system','私发给'+this.innerHTML)
                })
                document.getElementById('friendList').getElementsByTagName("ul")[0].appendChild(p)
            }
            let p=document.createElement('li');
            p.innerHTML='群发';
            p.addEventListener('click',function(){
                tosocketid='';
                that._displayNewMsg('system','群发')
            })
            document.getElementById('friendList').getElementsByTagName("ul")[0].appendChild(p)
                
           
         });
        this.socket.on('onetoonemsg', function(user,msg) {
            that._displayNewMsg(user, msg);
        });
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg,tosocketid); //把消息发送到服务器
                that._displayNewMsg('me', msg); //把自己的消息显示到自己的窗口中
            };
        }, false);
        this.socket.on('newMsg', function(user, msg) {
            that._displayNewMsg(user, msg);
        });
    },
    _displayNewMsg: function(user, msg, color){
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
};