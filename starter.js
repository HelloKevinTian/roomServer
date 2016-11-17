var child_process = require('child_process');

var child = child_process.spawn('node', ['cs2Room'], {
	detached: true,
	stdio: 'inherit'
});
child.unref();

//打印子进程的输出数据
child.stdout.on('data', function(data) {
	console.log('stdout: ' + data);
});

//监听子进程的错误流数据
child.stderr.on('data', function(data) {
	console.log('stderr: ' + data);
});

//监听子进程的退出事件
child.on('close', function(code) {
	console.log('子进程退出，code：' + code);
});